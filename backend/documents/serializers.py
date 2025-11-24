# backend/documents/serializers.py
from rest_framework import serializers
from .models import DocumentCategory, Document, Verification, ConsentLog

class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model.
    """
    class Meta:
        model = Document
        fields = [
            'id', 'applicant', 'categories', 'title', 'content', 'type', 'file_hash',
            'file', 'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_hash', 'uploaded_by']

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
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'applicant', 'requester_institution', 'document_categories',
            'is_granted', 'created_at', 'revoked_at'
        ]
        read_only_fields = ['id', 'created_at', 'revoked_at', 'applicant']
