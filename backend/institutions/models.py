from django.db import models
from django.conf import settings
import uuid

class Institution(models.Model):
    """
    Represents an organization, which can be a university, company, or other entity.
    """
    INSTITUTION_CATEGORIES = [
        ('University', 'University'),
        ('Company', 'Company'),
        ('Vocational School', 'Vocational School'),
        ('Certification Body', 'Certification Body'),
        ('Other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, choices=INSTITUTION_CATEGORIES)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='institution_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    admins = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='InstitutionStaff',
        related_name='institutions'
    )

    def __str__(self):
        return self.name

class InstitutionStaff(models.Model):
    """
    Through model to represent the relationship between a User and an Institution.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'institution')

    def __str__(self):
        return f"{self.user.email} at {self.institution.name}"
