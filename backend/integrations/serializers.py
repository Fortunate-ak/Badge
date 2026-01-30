from rest_framework import serializers
from .models import APIKey
from opportunities.models import Opportunity, Application, MatchRecord
from documents.models import Document, Verification
from accounts.models import User
from institutions.models import InstitutionStaff

class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'key', 'label', 'created_at', 'last_used_at', 'is_active', 'request_count']
        read_only_fields = ['id', 'key', 'created_at', 'last_used_at', 'request_count']

    def create(self, validated_data):
        # Institution is set in perform_create in the view
        return super().create(validated_data)

class ExternalOpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'description', 'opportunity_type', 'start_date', 'expiry_date',
            'created_at', 'updated_at', 'tags'
        ]

class ExternalApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image', 'social_links', 'dob', 'interests', 'bio']

class ExternalApplicationSerializer(serializers.ModelSerializer):
    applicant = ExternalApplicantSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'applicant', 'status', 'letter', 'created_at', 'updated_at']

class ExternalDocumentUploadSerializer(serializers.Serializer):
    email = serializers.EmailField()
    file = serializers.FileField()
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    document_type = serializers.CharField(required=False)

class ExternalVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = ['id', 'is_verified', 'rejection_reason', 'created_at']
