from django.db import models
from django.conf import settings
import uuid
from documents.models import DocumentCategory

class Opportunity(models.Model):
    """
    Represents various types of opportunities, such as jobs, programs, scholarships, and admissions.
    """
    OPPORTUNITY_TYPES = [
        ('Job', 'Job'),
        ('Program', 'Program/Course'),
        ('Scholarship', 'Scholarship'),
        ('Admission', 'Admission'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    content = models.TextField() # The full on description of the content
    opportunity_type = models.CharField(max_length=20, choices=OPPORTUNITY_TYPES)
    posted_by_institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='opportunities')

    tags = models.JSONField(default=list, help_text="List of keywords or tags for matching")
    
    document_categories = models.ManyToManyField(DocumentCategory, blank=True, related_name='opportunities', help_text="Document categories required for this opportunity")

    start_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Application(models.Model):
    """
    Tracks an applicant's application to an opportunity.
    """
    
    STATUS_TYPES = [
        ('Submitted', 'Submitted'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('In Review', 'In Review'),
        ('Pending Verification', 'Pending Verification'),
        ('Waitlisted', 'Waitlisted')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=100, default='Submitted', choices=STATUS_TYPES)
    letter = models.TextField(blank=True, null=True, help_text="A motivational letter or additional info from the applicant.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('applicant', 'opportunity')

    def __str__(self):
        return f"{self.applicant.email}'s application for {self.opportunity.title}"

class MatchRecord(models.Model):
    """
    Stores the result of the AI matching engine for an applicant and an opportunity.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column="match_record_id")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='match_records')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='match_records')
    is_stale = models.BooleanField(default=False)
    match_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    winning_argument = models.TextField()
    losing_argument = models.TextField()
    matched_tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('applicant', 'opportunity')

    def __str__(self):
        return f"Match for {self.applicant.email} and {self.opportunity.title}"
