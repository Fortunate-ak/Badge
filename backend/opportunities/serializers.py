# backend/opportunities/serializers.py
from rest_framework import serializers
from .models import Opportunity, Application, MatchRecord
from institutions.serializers import InstitutionSerializer
from documents.serializers import DocumentCategorySerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class OpportunitySerializer(serializers.ModelSerializer):
    """
    Serializer for Opportunity model.
    """
    institution_details = InstitutionSerializer(source='posted_by_institution', read_only=True)
    match_score = serializers.FloatField(read_only=True, required=False)
    has_applied = serializers.SerializerMethodField()
    document_categories_details = DocumentCategorySerializer(source='document_categories', many=True, read_only=True)

    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'description', 'content', 'opportunity_type',
            'posted_by_institution', 'institution_details', 'tags', 'start_date', 'expiry_date',
            'created_at', 'updated_at', 'match_score', 'has_applied', 'document_categories', 'document_categories_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'institution_details', 'match_score', 'has_applied', 'document_categories_details']

    def get_has_applied(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Application.objects.filter(opportunity=obj, applicant=user).exists()
        return False

class ApplicantSerializer(serializers.ModelSerializer):
    """
    Serializer for the applicant (user) details within an application.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image', 'social_links', 'dob', 'interests']

class OpportunityForApplicationSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for the opportunity details within an application.
    """
    class Meta:
        model = Opportunity
        fields = ['id', 'title', 'opportunity_type']

class ApplicationSerializer(serializers.ModelSerializer):
    """
    Basic serializer for lists of applications.
    """
    applicant = ApplicantSerializer(read_only=True)
    opportunity = OpportunityForApplicationSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'applicant', 'opportunity', 'status', 'created_at']
        read_only_fields = ['id', 'applicant', 'opportunity', 'created_at']

class ApplicationDetailSerializer(ApplicationSerializer):
    """
    Detailed serializer for a single application, including more context.
    """
    opportunity = OpportunitySerializer(read_only=True)

    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + ['updated_at']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new application.
    """
    class Meta:
        model = Application
        fields = ['opportunity']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating application status (Institution side).
    """
    class Meta:
        model = Application
        fields = ['status']

class MatchRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for MatchRecord model.
    """
    class Meta:
        model = MatchRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'match_percentage', 'winning_argument', 'losing_argument', 'matched_tags']
