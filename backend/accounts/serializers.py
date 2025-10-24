# backend/accounts/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active',
            'date_joined', 'bio', 'profile_image', 'social_links', 'dob',
            'is_applicant', 'is_institution_staff'
        ]
        read_only_fields = ['is_staff', 'is_active', 'date_joined']
