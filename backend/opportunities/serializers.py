# backend/opportunities/serializers.py
from rest_framework import serializers
from .models import Opportunity, Application, MatchRecord
from institutions.serializers import InstitutionSerializer

class OpportunitySerializer(serializers.ModelSerializer):
    """
    Serializer for Opportunity model.
    """
    institution_details = InstitutionSerializer(source='posted_by_institution', read_only=True)
    match_score = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'description', 'content', 'opportunity_type',
            'posted_by_institution', 'institution_details', 'filters', 'tags',
            'positive_tags', 'negative_tags', 'start_date', 'expiry_date',
            'created_at', 'updated_at', 'match_score'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'institution_details', 'match_score']

class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for Application model.
    """
    class Meta:
        model = Application
        fields = [
            'id', 'applicant', 'opportunity', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'applicant', 'status'] # Status updated by institution

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
