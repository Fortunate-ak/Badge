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
from opportunities.serializers import OpportunitySerializer, ApplicationSerializer, MatchRecordSerializer, ApplicationStatusUpdateSerializer

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

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institutions.
    """
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]
    
    # Change create institution view, to automatically make the current request user to be an institution admin
    def perform_create(self, serializer):
        institution = serializer.save()
        print("institution created:", institution, self.request.user)
        InstitutionStaff.objects.create(institution=institution, user=self.request.user, is_admin=True)
        # Update the user's staff status
        self.request.user.is_institution_staff = True
        self.request.user.save()

    @action(detail=True, methods=['post'], url_path='add-staff')
    def add_staff(self, request, pk=None):
        """
        Add a staff member to the institution.
        Requires the requester to be an admin of the institution.
        """
        institution = self.get_object()

        # Check if requester is admin of this institution
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
        return Response({'status': 'Staff member added.'}, status=status.HTTP_201_CREATED)

class InstitutionStaffViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institution staff relationships.
    """
    queryset = InstitutionStaff.objects.all()
    serializer_class = InstitutionStaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users should only see staff of institutions they belong to, or if they are superadmin
        user = self.request.user
        if user.is_staff:
            return InstitutionStaff.objects.all()

        # Get institutions where user is staff
        my_institutions = InstitutionStaff.objects.filter(user=user).values_list('institution', flat=True)
        return InstitutionStaff.objects.filter(institution__in=my_institutions)

class DocumentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for document categories. Read-only for standard users.
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
        user = self.request.user
        # Users see their own documents
        # Institution staff see documents they have consent for

        # Basic: return own documents
        return Document.objects.filter(applicant=user)

        # TODO: Expand to include documents accessible via consent if user is institution staff
        # This logic can get complex, for now we prioritize basic flow.

    def perform_create(self, serializer):
        # Auto assign uploader
        # Check if uploading for self or on behalf (if allowed)
        # For now assume uploading for self or need to specify applicant if staff

        applicant = serializer.validated_data.get('applicant')
        if not applicant:
            serializer.save(applicant=self.request.user, uploaded_by=self.request.user)
        else:
            serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        """
        Verify a document.
        """
        document = self.get_object()
        institution_id = request.data.get('institution_id')
        is_verified = request.data.get('is_verified', True)
        rejection_reason = request.data.get('rejection_reason', '')

        if not institution_id:
             return Response({'error': 'Institution ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is staff of institution
        if not InstitutionStaff.objects.filter(institution_id=institution_id, user=request.user).exists():
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        verification, created = Verification.objects.update_or_create(
            document=document,
            institution_id=institution_id,
            defaults={
                'is_verified': is_verified,
                'rejection_reason': rejection_reason,
                'verified_by': request.user
            }
        )
        return Response(VerificationSerializer(verification).data)

class VerificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for document verifications.
    """
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer
    permission_classes = [IsAuthenticated]

class ConsentLogViewSet(viewsets.ModelViewSet):
    """
    API endpoint for consent logs.
    """
    queryset = ConsentLog.objects.all()
    serializer_class = ConsentLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ConsentLog.objects.filter(Q(applicant=user) | Q(requester_institution__admins__user=user)).distinct()

    @action(detail=True, methods=['post'], url_path='revoke')
    def revoke(self, request, pk=None):
        consent = self.get_object()
        if consent.applicant != request.user:
             return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        from django.utils import timezone
        consent.revoked_at = timezone.now()
        consent.save()
        return Response({'status': 'Consent revoked.'})

class OpportunityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for opportunities.
    """
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Ensure user is staff of the institution
        institution = serializer.validated_data.get('posted_by_institution')
        print(institution, self.request.user, "--printing stuff here", serializer.validated_data)
        if not InstitutionStaff.objects.filter(institution=institution, user=self.request.user).exists():
             raise serializers.ValidationError("You are not a staff member of this institution.")
        serializer.save()

    @action(detail=False, methods=['get'], url_path='recommended')
    def recommended(self, request):
        """
        Returns opportunities recommended for the current user.
        Sorted by match score (highest first) and expiry date (non-expired first).
        """
        user = request.user
        if not user.is_applicant:
             return Response({'error': 'Recommendations are only for applicants.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.filter_queryset(self.get_queryset())

        engine = RecommendationEngine()
        sorted_opportunities = engine.sort_opportunities(user, queryset)

        # We need to paginate the result since we are returning a list,
        # but viewset pagination works on querysets usually.
        # However, we have a list of objects now.

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
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Applicants see their own applications
        if user.is_applicant:
            return Application.objects.filter(applicant=user)

        # Institution staff see applications to their opportunities
        if user.is_institution_staff:
             return Application.objects.filter(opportunity__posted_by_institution__admins__user=user).distinct()

        return Application.objects.none()

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user, status='Submitted')

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        application = self.get_object()

        # Check permission
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
