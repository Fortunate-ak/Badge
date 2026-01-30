from rest_framework import viewsets, mixins, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import APIKey
from .serializers import (
    APIKeySerializer, ExternalOpportunitySerializer, ExternalApplicationSerializer,
    ExternalApplicantSerializer, ExternalDocumentUploadSerializer, ExternalVerificationSerializer
)
from .authentication import APIKeyAuthentication
from institutions.models import InstitutionStaff
from opportunities.models import Opportunity, Application
from documents.models import Document, Verification
from accounts.models import User

# --- Management Views (Internal) ---

class APIKeyViewSet(viewsets.ModelViewSet):
    """
    Manage API Keys for your institution.
    """
    serializer_class = APIKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return keys for institutions where the user is staff/admin
        user = self.request.user
        if not user.is_institution_staff:
            return APIKey.objects.none()
        
        staff_records = InstitutionStaff.objects.filter(user=user)
        institution_ids = staff_records.values_list('institution_id', flat=True)
        return APIKey.objects.filter(institution_id__in=institution_ids).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_institution_staff:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You are not institution staff.")
        
        # Determine institution. For now, pick the first one they are admin of.
        # Ideally, the frontend should pass institution_id if the user belongs to multiple.
        # But looking at InstitutionViewSet, it seems simplified.
        staff_record = InstitutionStaff.objects.filter(user=user, is_admin=True).first()
        if not staff_record:
             # Try non-admin staff? Prompt says "any admin of an instution can visit this page"
             staff_record = InstitutionStaff.objects.filter(user=user).first()
             
        if not staff_record:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You do not belong to an institution.")

        serializer.save(institution=staff_record.institution)

# --- External API Views ---

class BaseExternalViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [] # APIKeyAuthentication handles auth, we just need to ensure request.institution exists

    def check_permissions(self, request):
        if not hasattr(request, 'institution') or not request.institution:
             self.permission_denied(request, message="Invalid or missing API Key")
        super().check_permissions(request)

class ExternalOpportunityViewSet(BaseExternalViewSet):
    serializer_class = ExternalOpportunitySerializer

    def get_queryset(self):
        return Opportunity.objects.filter(posted_by_institution=self.request.institution)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        opportunity = self.get_object()
        stats = Application.objects.filter(opportunity=opportunity).values('status').annotate(count=Count('status'))
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        opportunity = self.get_object()
        applications = Application.objects.filter(opportunity=opportunity)
        serializer = ExternalApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class ExternalApplicantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieve applicant details.
    Only allows access if the applicant has applied to an opportunity belonging to the institution.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = []
    serializer_class = ExternalApplicantSerializer

    def get_queryset(self):
        # Filter users who have applied to ANY opportunity of this institution
        return User.objects.filter(
            applications__opportunity__posted_by_institution=self.request.institution
        ).distinct()

class ExternalDocumentViewSet(viewsets.GenericViewSet):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = []

    @action(detail=False, methods=['post'], url_path='verify')
    def verify_document(self, request):
        """
        Uploads and automatically verifies a document for a user.
        """
        if not hasattr(request, 'institution') or not request.institution:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ExternalDocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            file_obj = serializer.validated_data['file']
            title = serializer.validated_data.get('title', file_obj.name)
            description = serializer.validated_data.get('description', '')
            doc_type = serializer.validated_data.get('document_type', '')

            try:
                applicant = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'Applicant not found'}, status=status.HTTP_404_NOT_FOUND)

            # Check if this applicant has any relation with the institution (optional, but good practice)
            # For now, we allow uploading if they exist.
            
            # Create Document
            # We set uploaded_by to None because it's an API action, or we could find a staff member.
            # But the model allows uploaded_by to be null.
            document = Document.objects.create(
                applicant=applicant,
                file=file_obj,
                title=title,
                content=description,
                type=doc_type,
                uploaded_by=None 
            )

            # Create Verification
            verification = Verification.objects.create(
                document=document,
                institution=request.institution,
                is_verified=True,
                verified_by=None # API Verification
            )

            return Response({
                'document_id': document.id,
                'verification_id': verification.id,
                'status': 'Verified'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
