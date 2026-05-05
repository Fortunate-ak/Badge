# backend/documents/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DocumentCategory, Document, Verification, ConsentLog
from institutions.serializers import SimpleInstitutionSerializer

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image']

class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = '__all__'


class DocumentCategorySerializerMini(serializers.ModelSerializer):
    """
    Small Serializer to represent DocumentCategory
    """
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id', 'name', 'description']

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model.
    """
    document_categories_details = DocumentCategorySerializerMini(source='categories', read_only=True, many=True)
    applicant_details = UserMiniSerializer(source='applicant', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'applicant', 'categories', 'title', 'content', 'type', 'file_hash',
            'file', 'uploaded_by', 'created_at', 'updated_at', 'document_categories_details', 'applicant_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_hash', 'uploaded_by', 'document_categories_details', 'applicant_details']

class VerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Verification model.
    """
    institution_details = SimpleInstitutionSerializer(source='institution', read_only=True)
    document_details = DocumentSerializer(source='document', read_only=True)

    class Meta:
        model = Verification
        fields = [
            'id', 'document', 'institution', 'institution_details', 'document_details', 'is_verified',
            'rejection_reason', 'verified_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'verified_by', 'institution_details', 'document_details']

        
class ConsentLogSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsentLog model.
    """
    document_categories_details = DocumentCategorySerializerMini(source='document_categories', read_only=True, many=True)
    requester_institution_details = SimpleInstitutionSerializer(source="requester_institution", read_only=True)
    applicant_details = UserMiniSerializer(source='applicant', read_only=True)
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'applicant', 'applicant_details', 'requester_institution', 'document_categories',
            'is_granted', 'created_at', 'revoked_at', 'document_categories_details', 'requester_institution_details'
        ]
        read_only_fields = ['id', 'created_at', 'document_categories_details', 'requester_institution_details', 'applicant_details']


