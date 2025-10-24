from django.db import models
from django.conf import settings
import uuid

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
    opportunity_type = models.CharField(max_length=20, choices=OPPORTUNITY_TYPES)
    posted_by_institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True, related_name='opportunities')
    posted_by_employer = models.ForeignKey('institutions.Employer', on_delete=models.CASCADE, null=True, blank=True, related_name='opportunities')
    filters = models.JSONField(default=dict, help_text="e.g., required qualifications, minimum GPA")
    tags = models.JSONField(default=list, help_text="List of keywords or tags for matching")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Application(models.Model):
    """
    Tracks a student's application to an opportunity.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=100, default='Submitted')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'opportunity')

    def __str__(self):
        return f"{self.student.email}'s application for {self.opportunity.title}"

class MatchRecord(models.Model):
    """
    Stores the result of the AI matching engine for a student and an opportunity.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column="match_record_id")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='match_records')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='match_records')
    is_stale = models.BooleanField(default=False)
    match_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    winning_argument = models.TextField()
    losing_argument = models.TextField()
    matched_tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'opportunity')

    def __str__(self):
        return f"Match for {self.student.email} and {self.opportunity.title}"
