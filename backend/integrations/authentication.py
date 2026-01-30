from rest_framework import authentication
from rest_framework import exceptions
from .models import APIKey
from django.utils import timezone

class APIKeyAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        key = request.META.get('HTTP_X_API_KEY')
        if not key:
            return None

        try:
            api_key = APIKey.objects.get(key=key, is_active=True)
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API Key')

        # Update stats
        # Note: In a high concurrency environment, F() expressions or background tasks are better,
        # but strictly following "request_count" requirement directly here for simplicity as per instructions.
        api_key.last_used_at = timezone.now()
        api_key.request_count += 1
        api_key.save(update_fields=['last_used_at', 'request_count'])

        # Attach institution to request for easy access in views
        request.institution = api_key.institution
        
        # Return None for user (AnonymousUser) and the api_key as auth
        return (None, api_key)
