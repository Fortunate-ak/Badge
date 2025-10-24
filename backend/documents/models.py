from django.db import models
from django.conf import settings
import uuid

class DocumentCategory(models.Model):
    """
    System-defined categories for documents (e.g., ACADEMIC, EMPLOYMENT, IDENTITY).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Document(models.Model):
    """
    Represents a document uploaded by a student or an institution.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    categories = models.ManyToManyField(DocumentCategory, related_name='documents')
    file_hash = models.CharField(max_length=255, help_text="Hash of the file to ensure integrity")
    storage_path = models.CharField(max_length=1024)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Document for {self.student.email}"

class Verification(models.Model):
    """
    Records the verification status of a document by an institution.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='verifications')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='verifications')
    is_verified = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True, help_text="Reason for rejection, if applicable")
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='verified_documents')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification for {self.document.id} by {self.institution.name}"

class ConsentLog(models.Model):
    """
    Logs student consent for sharing document categories with institutions or employers.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consent_logs')
    requester_institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True, related_name='requested_consent')
    requester_employer = models.ForeignKey('institutions.Employer', on_delete=models.CASCADE, null=True, blank=True, related_name='requested_consent')
    document_categories = models.ManyToManyField(DocumentCategory)
    is_granted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Consent from {self.student.email}"
