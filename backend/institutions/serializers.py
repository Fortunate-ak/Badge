# backend/institutions/serializers.py
from rest_framework import serializers
from .models import Institution, InstitutionStaff

class InstitutionStaffSerializer(serializers.ModelSerializer):
    """
    Serializer for the InstitutionStaff model.
    """
    class Meta:
        model = InstitutionStaff
        fields = ['user', 'institution', 'is_admin', 'date_joined']

class InstitutionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Institution model.
    """
    admins = InstitutionStaffSerializer(source='institutionstaff_set', many=True, read_only=True)

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'category', 'website', 'address',
            'profile_image', 'created_at', 'updated_at', 'admins'
        ]
