from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_applicant', 'is_institution_staff', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_applicant', 'is_institution_staff', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    readonly_fields = ('date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'dob', 'bio')}),
        ('Profile', {'fields': ('profile_image', 'social_links')}),
        ('Permissions', {'fields': ('is_applicant', 'is_institution_staff', 'is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )
    ordering = ('-date_joined',)

admin.site.register(User, UserAdmin)
