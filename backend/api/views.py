# backend/api/views.py
from rest_framework import viewsets, status, mixins
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import serializers

# Import models from all apps
from accounts.models import User
from institutions.models import Institution, InstitutionStaff
from documents.models import DocumentCategory, Document, Verification, ConsentLog
from opportunities.models import Opportunity, Application, MatchRecord
from opportunities.recommendation import RecommendationEngine

# Import serializers from all apps
from accounts.serializers import UserSerializer, ChangePasswordSerializer, RegisterSerializer
from institutions.serializers import InstitutionSerializer, InstitutionStaffSerializer
from documents.serializers import DocumentCategorySerializer, DocumentSerializer, VerificationSerializer, ConsentLogSerializer
from opportunities.serializers import (
    OpportunitySerializer, ApplicationSerializer, MatchRecordSerializer,
    ApplicationStatusUpdateSerializer, ApplicationDetailSerializer, ApplicationCreateSerializer
)

# Define ViewSets for each model

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Get current user profile.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        Change user password.
        """
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'Password updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='search')
    def search_by_email(self, request):
        """
        Search for a user by email.
        """
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institutions.
    """
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        institution = serializer.save()
        InstitutionStaff.objects.create(institution=institution, user=self.request.user, is_admin=True)
        self.request.user.is_institution_staff = True
        self.request.user.save()

    @action(detail=True, methods=['post'], url_path='add-staff')
    def add_staff(self, request, pk=None):
        """
        Add a staff member to the institution.
        """
        institution = self.get_object()
        if not InstitutionStaff.objects.filter(institution=institution, user=request.user, is_admin=True).exists() and not request.user.is_staff:
            return Response({'error': 'You do not have permission to add staff.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        is_admin = request.data.get('is_admin', False)

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        if InstitutionStaff.objects.filter(institution=institution, user=user).exists():
            return Response({'error': 'User is already staff.'}, status=status.HTTP_400_BAD_REQUEST)

        InstitutionStaff.objects.create(institution=institution, user=user, is_admin=is_admin)
        user.is_institution_staff = True
        user.save()
        return Response({'status': 'Staff member added.'}, status=status.HTTP_201_CREATED)

class InstitutionStaffViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institution staff relationships.
    """
    queryset = InstitutionStaff.objects.all()
    serializer_class = InstitutionStaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return InstitutionStaff.objects.all()
        my_institutions = InstitutionStaff.objects.filter(user=user).values_list('institution', flat=True)
        return InstitutionStaff.objects.filter(institution__in=my_institutions)

    def perform_destroy(self, instance):
        """
        Only allow admins of the institution to remove staff.
        """
        if not InstitutionStaff.objects.filter(institution=instance.institution, user=self.request.user, is_admin=True).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to remove staff from this institution.")
        instance.delete()

class DocumentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for document categories.
    """
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [IsAuthenticated]

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for documents.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        applicant = serializer.validated_data.get('applicant')
        if not applicant:
            serializer.save(applicant=self.request.user, uploaded_by=self.request.user)
        else:
            serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        document = self.get_object()
        institution_id = request.data.get('institution_id')
        is_verified = request.data.get('is_verified', True)
        rejection_reason = request.data.get('rejection_reason', '')

        if not institution_id:
             return Response({'error': 'Institution ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not InstitutionStaff.objects.filter(institution_id=institution_id, user=request.user).exists():
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        verification, created = Verification.objects.update_or_create(
            document=document,
            institution_id=institution_id,
            defaults={'is_verified': is_verified, 'rejection_reason': rejection_reason, 'verified_by': request.user}
        )
        return Response(VerificationSerializer(verification).data)

class VerificationViewSet(viewsets.ModelViewSet):
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer
    permission_classes = [IsAuthenticated]

class ConsentLogViewSet(viewsets.ModelViewSet):
    queryset = ConsentLog.objects.all()
    serializer_class = ConsentLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ConsentLog.objects.filter(Q(applicant=user) | Q(requester_institution__admins__in=User.objects.filter(id=user.id))).distinct()

    @action(detail=True, methods=['post'], url_path='revoke')
    def revoke(self, request, pk=None):
        consent = self.get_object()
        if consent.applicant != request.user:
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from django.utils import timezone
        consent.revoked_at = timezone.now()
        consent.save()
        return Response({'status': 'Consent revoked.'})
    
    @action(detail=True, methods=['get'], url_path='accept')
    def accept(self, request, pk=None):
        consent = self.get_object()
        if consent.applicant != request.user:
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        consent.is_granted = True
        consent.save()
        return Response({'status': 'Consent accepted.'})
    
    @action(detail=False, methods=['post'], url_path='check')
    def check(self, request):
        """Check if a university has consent to view specific document categories."""
        document_category_ids = request.data.get('document_categories', [])
        institution_id = request.data.get('institution_id')
        applicant_id = request.data.get('applicant_id')
        
        if len(document_category_ids) == 0:# Get all categories if not given any
            document_category_ids = [str(doc_id) for doc_id in DocumentCategory.objects.all().values_list('id', flat=True)]
            document_category_ids = list(document_category_ids)
            

        if not all([document_category_ids, institution_id, applicant_id]):
            return Response(
                {'error': 'document_categories, institution_id, and applicant_id are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all accepted consents for this applicant and institution
        consents = ConsentLog.objects.filter(
            applicant__pk=applicant_id,
            requester_institution__id=institution_id,
            is_granted=True,
            revoked_at__isnull=True
        )

        # Get consented document categories
        consented_categories = set(
            [str(cat_id) for cat_id in consents.values_list('document_categories', flat=True)] # Make sure they're strings first
        )
        
        # Build response dict
        result = {
            category_id: category_id in consented_categories
            for category_id in document_category_ids
        }

        return Response(result)
        

class OpportunityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for opportunities.
    """
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        institution = serializer.validated_data.get('posted_by_institution')
        if not InstitutionStaff.objects.filter(institution=institution, user=self.request.user).exists():
             raise serializers.ValidationError("You are not a staff member of this institution.")
        serializer.save()

    @action(detail=True, methods=['get'], url_path='has-applied')
    def has_applied(self, request, pk=None):
        """
        Check if the current user has applied to this opportunity.
        """
        opportunity = self.get_object()
        has_applied = Application.objects.filter(opportunity=opportunity, applicant=request.user).exists()
        application_id = None
        if has_applied:
            application_id = Application.objects.get(opportunity=opportunity, applicant=request.user).id
        return Response({'has_applied': has_applied, 'application_id': application_id})

    @action(detail=True, methods=['get'], url_path='applications')
    def applications(self, request, pk=None):
        """
        Get all applications for a specific opportunity.
        (Restricted to institution staff)
        """
        opportunity = self.get_object()
        if not InstitutionStaff.objects.filter(institution=opportunity.posted_by_institution, user=request.user).exists():
            return Response({'error': 'You do not have permission to view applications for this opportunity.'}, status=status.HTTP_403_FORBIDDEN)
        
        applications = Application.objects.filter(opportunity=opportunity)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='recommended')
    def recommended(self, request):
        user = request.user
        if not user.is_applicant:
             return Response({'error': 'Recommendations are only for applicants.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.filter_queryset(self.get_queryset())
        engine = RecommendationEngine()
        sorted_opportunities = engine.sort_opportunities(user, queryset)

        page = self.paginate_queryset(sorted_opportunities)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(sorted_opportunities, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for applications.
    """
    queryset = Application.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        if self.action in ['retrieve', 'list']:
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_institution_staff:
             my_institutions = InstitutionStaff.objects.filter(user=user).values_list('institution', flat=True)
             return Application.objects.filter(Q(opportunity__posted_by_institution__in=my_institutions) | Q(applicant=user)).distinct()
        if user.is_applicant:
            return Application.objects.filter(applicant=user)
        return Application.objects.none()

    def perform_create(self, serializer):
        opportunity = serializer.validated_data.get('opportunity')
        if Application.objects.filter(opportunity=opportunity, applicant=self.request.user).exists():
            raise serializers.ValidationError("You have already applied to this opportunity.")
        serializer.save(applicant=self.request.user, status='Submitted')

        # Trigger "SLM" Match Record Generation
        try:
            engine = RecommendationEngine()
            engine.generate_match_record(self.request.user, opportunity)
        except Exception as e:
            # Log error but don't fail the application creation
            print(f"Error generating match record: {e}")

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        application = self.get_object()
        institution = application.opportunity.posted_by_institution
        if not InstitutionStaff.objects.filter(institution=institution, user=request.user).exists():
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MatchRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint for match records.
    """
    queryset = MatchRecord.objects.all()
    serializer_class = MatchRecordSerializer
    permission_classes = [IsAuthenticated]
