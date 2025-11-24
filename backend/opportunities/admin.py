from django.contrib import admin
from .models import Opportunity, Application, MatchRecord

class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'opportunity_type', 'posted_by_institution', 'created_at', 'updated_at')
    list_filter = ('opportunity_type', 'created_at', 'updated_at', 'posted_by_institution')
    search_fields = ('title', 'description', 'posted_by_institution__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('id', 'title', 'opportunity_type', 'posted_by_institution')}),
        ('Description', {'fields': ('description', 'content')}),
        ('Filters & Tags', {'fields': ('filters', 'tags')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'opportunity', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('applicant__email', 'opportunity__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('id', 'applicant', 'opportunity', 'status')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

class MatchRecordAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'opportunity', 'match_percentage', 'is_stale', 'created_at')
    list_filter = ('is_stale', 'created_at', 'match_percentage')
    search_fields = ('applicant__email', 'opportunity__title')
    readonly_fields = ('id', 'created_at', 'match_percentage')
    fieldsets = (
        (None, {'fields': ('id', 'applicant', 'opportunity')}),
        ('Match Info', {'fields': ('match_percentage', 'is_stale', 'matched_tags')}),
        ('Arguments', {'fields': ('winning_argument', 'losing_argument')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

admin.site.register(Opportunity, OpportunityAdmin)
admin.site.register(Application, ApplicationAdmin)
admin.site.register(MatchRecord, MatchRecordAdmin)
