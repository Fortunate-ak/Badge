from django.contrib import admin
from .models import Institution, InstitutionStaff

class InstitutionStaffInline(admin.TabularInline):
    model = InstitutionStaff
    extra = 1
    fields = ('user', 'is_admin', 'date_joined')
    readonly_fields = ('date_joined',)

class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'website', 'created_at', 'updated_at')
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('name', 'website')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [InstitutionStaffInline]
    fieldsets = (
        (None, {'fields': ('id', 'name', 'category')}),
        ('Contact Info', {'fields': ('website', 'address')}),
        ('Media', {'fields': ('profile_image',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

class InstitutionStaffAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'is_admin', 'date_joined')
    list_filter = ('is_admin', 'date_joined', 'institution')
    search_fields = ('user__email', 'institution__name')
    readonly_fields = ('date_joined',)

admin.site.register(Institution, InstitutionAdmin)
admin.site.register(InstitutionStaff, InstitutionStaffAdmin)
