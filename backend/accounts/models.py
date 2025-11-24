from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    """
    Custom user manager for the custom user model.
    """
    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError('The given email must be set')

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_staff=is_staff,
            is_active=True,
            is_superuser=is_superuser,
            last_login=timezone.now(),
            date_joined=timezone.now(),
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email for authentication instead of username.
    """
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    # New fields
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    is_applicant = models.BooleanField(default=True)
    is_institution_staff = models.BooleanField(default=False)

    # Recommendation engine fields
    interests = models.JSONField(default=list, blank=True, help_text="List of user interests or tags")


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    def get_short_name(self):
        return self.first_name
