# backend/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Used for retrieving and updating user profile information.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active',
            'date_joined', 'bio', 'profile_image', 'social_links', 'dob',
            'is_applicant', 'is_institution_staff', 'interests'
        ]
        read_only_fields = ['id', 'email', 'is_staff', 'is_active', 'date_joined', 'is_applicant', 'is_institution_staff']
        # Roles (is_applicant, is_institution_staff) should generally not be changeable via simple profile update
        # email is identity, usually handled separately or locked

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'bio', 'dob', 'is_applicant', 'is_institution_staff'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields won't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            bio=validated_data.get('bio', ''),
            dob=validated_data.get('dob'),
            is_applicant=validated_data.get('is_applicant', True),
            is_institution_staff=validated_data.get('is_institution_staff', False)
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs
