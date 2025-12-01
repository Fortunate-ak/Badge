# backend/institutions/serializers.py
from rest_framework import serializers
from .models import Institution, InstitutionStaff
from accounts.serializers import UserSerializer

class InstitutionStaffSerializer(serializers.ModelSerializer):
    """
    Serializer for the InstitutionStaff model.
    Includes nested user details for display purposes.
    """
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = InstitutionStaff
        fields = ['id', 'user', 'user_details', 'institution', 'is_admin', 'date_joined']
        read_only_fields = ['date_joined', 'user_details']

class InstitutionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Institution model.
    """
    # We use a simplified view for admins to avoid deep nesting overhead if not needed
    admins = InstitutionStaffSerializer(source='institutionstaff_set', many=True, read_only=True)

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'category', 'website', 'address',
            'profile_image', 'created_at', 'updated_at', 'admins', 'verified', 'description', 'email', 'phone'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'admins']


class SimpleInstitutionSerializer(serializers.ModelSerializer):
    """
    Simpler Serializer for the Institution model.
    """

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'category', 'website', 'address',
            'profile_image', 'created_at', 'updated_at', 'verified', 'description', 'email', 'phone'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified']
