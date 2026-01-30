from django.db import models
from django.conf import settings
import uuid
import secrets

class APIKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='api_keys')
    key = models.CharField(max_length=255, unique=True, db_index=True, editable=False)
    label = models.CharField(max_length=255, help_text="A friendly name for this key")
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    request_count = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.label} ({self.institution.name})"
