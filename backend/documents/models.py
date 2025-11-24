from django.db import models
from django.conf import settings
import uuid
import hashlib

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
    Represents a document uploaded by an applicant or an institution.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    categories = models.ManyToManyField(DocumentCategory, related_name='documents')
    file_hash = models.CharField(max_length=255, help_text="Hash of the file to ensure integrity", blank=True)
    # storage_path replaced by FileField for better Django handling. Allow null for migration compatibility.
    file = models.FileField(upload_to='documents/', max_length=1024, null=True, blank=True)
    title = models.CharField(max_length=255, help_text="Title of the document", blank=True)
    content = models.TextField(help_text="Content or description of the document", blank=True)
    type = models.CharField(max_length=100, help_text="Type of the document", blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate hash if not present and file is present
        if self.file and not self.file_hash:
             md5_hash = hashlib.md5()
             for chunk in self.file.chunks():
                 md5_hash.update(chunk)
             self.file_hash = md5_hash.hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Document for {self.applicant.email}"

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
    Logs applicant consent for sharing document categories with institutions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consent_logs')
    requester_institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='requested_consent')
    document_categories = models.ManyToManyField(DocumentCategory)
    is_granted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Consent from {self.applicant.email}"
