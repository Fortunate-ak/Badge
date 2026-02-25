# backend/opportunities/serializers.py
from rest_framework import serializers
from .models import Opportunity, Application, MatchRecord
from institutions.serializers import InstitutionSerializer
from documents.serializers import DocumentCategorySerializer, DocumentSerializer
from django.contrib.auth import get_user_model
from documents.models import ConsentLog

User = get_user_model()

class MatchRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for MatchRecord model.
    """
    class Meta:
        model = MatchRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'match_percentage', 'winning_argument', 'losing_argument', 'matched_tags']


class MatchRecordDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for MatchRecord model, that is meant for the application. 
    """
    class Meta:
        model = MatchRecord
        fields = ['id', 'created_at', 'match_percentage', 'winning_argument', 'losing_argument', 'matched_tags']


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
            'created_at', 'updated_at', 'match_score', 'has_applied', 'document_categories',
            'document_categories_details', 'specific_requirements'
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
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image', 'social_links', 'dob', 'interests', 'bio']

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
        fields = ['id', 'applicant', 'opportunity', 'status', 'letter', 'created_at']
        read_only_fields = ['id', 'applicant', 'opportunity', 'created_at']

class ApplicationDetailSerializer(ApplicationSerializer):
    """
    Detailed serializer for a single application, including more context.
    """
    opportunity = OpportunitySerializer(read_only=True)
    documents = serializers.SerializerMethodField()
    match_record = serializers.SerializerMethodField()
    submitted_documents_details = serializers.SerializerMethodField()
    
    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + ['updated_at', 'documents', 'match_record', 'submitted_documents', 'submitted_documents_details']
        
    
    def get_match_record(self, obj):
        applicant = obj.applicant
        opportunity = obj.opportunity
                
        return MatchRecordDetailSerializer(MatchRecord.objects.filter(applicant=applicant, opportunity=opportunity).first()).data
    
    def get_documents(self, obj):
        """
        Get all documents where the institution has consent to view based on document categories.
        """
        institution = obj.opportunity.posted_by_institution
        applicant = obj.applicant
        
        # Get all document categories the institution has consent to view
        consented_categories = ConsentLog.objects.filter(
            requester_institution=institution,
            applicant=applicant,
            is_granted=True
        ).values_list('document_categories', flat=True).distinct()
        
        # Filter documents that belong to consented categories
        documents = applicant.documents.filter(categories__in=consented_categories).distinct()
        
        return DocumentSerializer(documents, many=True).data

    def get_submitted_documents_details(self, obj):
        """
        Get the details of documents submitted for specific requirements.
        Returns a list of DocumentSerializer data.
        """
        submitted_docs_map = obj.submitted_documents or {}
        doc_ids = list(submitted_docs_map.values())
        if not doc_ids:
            return []

        # Fetch documents
        documents = obj.applicant.documents.filter(id__in=doc_ids)
        return DocumentSerializer(documents, many=True).data

class ApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new application.
    """
    submitted_documents = serializers.JSONField(required=False)

    class Meta:
        model = Application
        fields = ['opportunity', 'letter', 'submitted_documents']

    def validate(self, data):
        opportunity = data.get('opportunity')
        submitted_documents_raw = data.get('submitted_documents', {})

        # Filter out empty values
        submitted_documents = {k: v for k, v in submitted_documents_raw.items() if v}
        data['submitted_documents'] = submitted_documents

        if not opportunity:
            return data

        specific_requirements = opportunity.specific_requirements or []

        # Validate that all mandatory requirements are met
        for req in specific_requirements:
            if req.get('mandatory', False):
                req_id = str(req.get('id'))
                if req_id not in submitted_documents:
                     raise serializers.ValidationError(f"Missing mandatory document for requirement: {req.get('label')}")

        # Validate that the submitted documents exist and belong to the user
        user = self.context['request'].user
        for doc_id in submitted_documents.values():
            if not user.documents.filter(id=doc_id).exists():
                raise serializers.ValidationError(f"Document {doc_id} does not exist or does not belong to you.")

        return data


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating application status (Institution side).
    """
    class Meta:
        model = Application
        fields = ['status']
