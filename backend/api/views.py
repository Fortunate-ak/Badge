# backend/api/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

# Import models from all apps
from accounts.models import User
from institutions.models import Institution, InstitutionStaff
from documents.models import DocumentCategory, Document, Verification, ConsentLog
from opportunities.models import Opportunity, Application, MatchRecord

# Import serializers from all apps
from accounts.serializers import UserSerializer
from institutions.serializers import InstitutionSerializer, InstitutionStaffSerializer
from documents.serializers import DocumentCategorySerializer, DocumentSerializer, VerificationSerializer, ConsentLogSerializer
from opportunities.serializers import OpportunitySerializer, ApplicationSerializer, MatchRecordSerializer

# Define ViewSets for each model

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institutions.
    """
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]

class InstitutionStaffViewSet(viewsets.ModelViewSet):
    """
    API endpoint for institution staff relationships.
    """
    queryset = InstitutionStaff.objects.all()
    serializer_class = InstitutionStaffSerializer
    permission_classes = [IsAuthenticated]

class DocumentCategoryViewSet(viewsets.ModelViewSet):
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

class OpportunityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for opportunities.
    """
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for applications.
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

class MatchRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint for match records.
    """
    queryset = MatchRecord.objects.all()
    serializer_class = MatchRecordSerializer
    permission_classes = [IsAuthenticated]
