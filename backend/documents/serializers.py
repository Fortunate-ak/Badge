# backend/documents/serializers.py
from rest_framework import serializers
from .models import DocumentCategory, Document, Verification, ConsentLog
from institutions.serializers import SimpleInstitutionSerializer

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
    
    class Meta:
        model = Document
        fields = [
            'id', 'applicant', 'categories', 'title', 'content', 'type', 'file_hash',
            'file', 'uploaded_by', 'created_at', 'updated_at', 'document_categories_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_hash', 'uploaded_by', 'document_categories_details']

class VerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Verification model.
    """
    class Meta:
        model = Verification
        fields = [
            'id', 'document', 'institution', 'is_verified',
            'rejection_reason', 'verified_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'verified_by', 'institution']

        
class ConsentLogSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsentLog model.
    """
    document_categories_details = DocumentCategorySerializerMini(source='document_categories', read_only=True, many=True)
    requester_institution_details = SimpleInstitutionSerializer(source="requester_institution", read_only=True)
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'applicant', 'requester_institution', 'document_categories',
            'is_granted', 'created_at', 'revoked_at', 'document_categories_details', 'requester_institution_details'
        ]
        read_only_fields = ['id', 'created_at', 'document_categories_details', 'requester_institution_details']

