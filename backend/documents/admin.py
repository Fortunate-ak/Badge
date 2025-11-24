from django.contrib import admin
from .models import DocumentCategory, Document, Verification, ConsentLog

class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name',)
    readonly_fields = ('id',)

class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'applicant', 'title', 'type', 'uploaded_by', 'created_at')
    list_filter = ('created_at', 'updated_at', 'type')
    search_fields = ('title', 'applicant__email', 'uploaded_by__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'file_hash')
    filter_horizontal = ('categories',)
    fieldsets = (
        (None, {'fields': ('id', 'applicant', 'uploaded_by')}),
        ('Document Info', {'fields': ('title', 'type', 'content', 'categories')}),
        ('File', {'fields': ('file', 'file_hash')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

class VerificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'institution', 'is_verified', 'verified_by', 'created_at')
    list_filter = ('is_verified', 'created_at', 'institution')
    search_fields = ('document__id', 'institution__name', 'verified_by__email')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        (None, {'fields': ('id', 'document', 'institution')}),
        ('Verification', {'fields': ('is_verified', 'verified_by', 'rejection_reason')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

class ConsentLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'applicant', 'requester_institution', 'is_granted', 'created_at', 'revoked_at')
    list_filter = ('is_granted', 'created_at', 'revoked_at')
    search_fields = ('applicant__email', 'requester_institution__name')
    readonly_fields = ('id', 'created_at')
    filter_horizontal = ('document_categories',)
    fieldsets = (
        (None, {'fields': ('id', 'applicant', 'requester_institution')}),
        ('Consent', {'fields': ('is_granted', 'document_categories')}),
        ('Timestamps', {'fields': ('created_at', 'revoked_at')}),
    )

admin.site.register(DocumentCategory, DocumentCategoryAdmin)
admin.site.register(Document, DocumentAdmin)
admin.site.register(Verification, VerificationAdmin)
admin.site.register(ConsentLog, ConsentLogAdmin)
