# backend/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import PushSubscription

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Used for retrieving and updating user profile information.
    Includes nested institution details and staff records.
    """
    institution_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active',
            'date_joined', 'bio', 'profile_image', 'social_links', 'dob',
            'is_applicant', 'is_institution_staff', 'interests',
            'institution_details'
        ]
        read_only_fields = [
            'id', 'email', 'is_staff', 'is_active', 'date_joined', 'is_applicant',
            'is_institution_staff', 'institution_details'
        ]
        # Roles (is_applicant, is_institution_staff) should generally not be changeable via simple profile update
        # email is identity, usually handled separately or locked

    def get_institution_details(self, obj):
        """
        Get all institutions where the user is a staff member or admin.
        """
        # Circular import workaround? No, institutions depends on accounts usually.
        # But UserSerializer might be used in institutions.
        try:
            from institutions.serializers import SimpleInstitutionSerializer
            institutions = obj.institutions.all()
            return SimpleInstitutionSerializer(institutions, many=True).data
        except ImportError:
            return []


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
            'bio', 'dob', 'is_applicant', 'is_institution_staff', 'interests'
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
            is_institution_staff=validated_data.get('is_institution_staff', False),
            interests=validated_data.get('interests', [])
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


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['endpoint', 'p256dh', 'auth']

    def create(self, validated_data):
        user = self.context['request'].user
        subscription, created = PushSubscription.objects.update_or_create(
            user=user,
            endpoint=validated_data['endpoint'],
            defaults={
                'p256dh': validated_data['p256dh'],
                'auth': validated_data['auth']
            }
        )
        return subscription
