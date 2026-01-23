from django.db import models
from django.conf import settings
import uuid
import hashlib
import os
import mimetypes


def generate_unique_filename(instance, filename):
    """Generate a unique file path for uploaded documents.

    Path format: documents/<applicant_id_or_anonymous>/<uuid4><ext>
    This prevents filename collisions while keeping files organized by applicant.
    """
    ext = os.path.splitext(filename)[1].lower()
    applicant_part = str(getattr(instance, 'applicant_id', None) or 'anonymous')
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('documents', applicant_part, unique_name)


def detect_mime_type(uploaded_file):
    """Detect mime type for an uploaded Django file.

    Tries to use the `content_type` attribute available on UploadedFile objects
    (e.g. InMemoryUploadedFile / TemporaryUploadedFile). Falls back to the
    `mimetypes` module using the filename extension. Always returns a string;
    defaults to 'application/octet-stream' when unknown.
    """
    # UploadedFile objects often expose .file with .content_type, or directly .content_type
    content_type = None
    try:
        content_type = getattr(uploaded_file, 'content_type', None)
    except Exception:
        content_type = None

    if not content_type:
        try:
            inner = getattr(uploaded_file, 'file', None)
            content_type = getattr(inner, 'content_type', None)
        except Exception:
            content_type = None

    if not content_type:
        guessed, _ = mimetypes.guess_type(getattr(uploaded_file, 'name', '') or '')
        content_type = guessed

    return content_type or 'application/octet-stream'


def compute_file_hash(uploaded_file, algorithm='md5'):
    """Compute a hex digest for an uploaded file using the given algorithm.

    This helper will attempt to iterate over `uploaded_file.chunks()` when
    available (efficient for uploaded files) and fall back to reading the
    whole file if necessary. It will also attempt to rewind the file pointer
    when possible so Django can continue processing it after hashing.
    """
    try:
        hasher = hashlib.new(algorithm)
    except Exception:
        hasher = hashlib.md5()

    file_obj = getattr(uploaded_file, 'file', uploaded_file)

    # If the file-like supports chunks(), use it
    try:
        if hasattr(uploaded_file, 'chunks'):
            for chunk in uploaded_file.chunks():
                hasher.update(chunk)
        else:
            # Read in blocks to avoid memory spikes
            file_obj.seek(0)
            for chunk in iter(lambda: file_obj.read(8192), b""):
                hasher.update(chunk)
    except Exception:
        # As a last resort, try reading .read()
        try:
            file_obj.seek(0)
            hasher.update(file_obj.read())
        except Exception:
            pass

    # Rewind when possible
    try:
        file_obj.seek(0)
    except Exception:
        pass

    return hasher.hexdigest()

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
    # Use a custom upload_to to ensure unique filenames and avoid collisions.
    file = models.FileField(upload_to=generate_unique_filename, max_length=1024, null=True, blank=True)
    title = models.CharField(max_length=255, help_text="Title of the document", blank=True)
    content = models.TextField(help_text="Content or description of the document", blank=True)
    type = models.CharField(max_length=100, help_text="Type of the document", blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate hash if not present and file is present
        if self.file:
            # Always set the document `type` to the detected MIME type of the file
            try:
                self.type = detect_mime_type(self.file)
            except Exception:
                # Fallback: keep whatever value exists or blank
                if not self.type:
                    self.type = 'application/octet-stream'

            # Compute file hash if missing or empty
            if not self.file_hash:
                try:
                    self.file_hash = compute_file_hash(self.file)
                except Exception:
                    # leave file_hash blank if hashing fails
                    pass
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
        return f"Consent from {self.applicant.email} ({self.is_granted})"
