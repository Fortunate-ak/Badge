# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'institutions', views.InstitutionViewSet)
router.register(r'institution-staff', views.InstitutionStaffViewSet)
router.register(r'document-categories', views.DocumentCategoryViewSet)
router.register(r'documents', views.DocumentViewSet)
router.register(r'verifications', views.VerificationViewSet)
router.register(r'consent-logs', views.ConsentLogViewSet)
router.register(r'opportunities', views.OpportunityViewSet)
router.register(r'applications', views.ApplicationViewSet)
router.register(r'match-records', views.MatchRecordViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path("auth/", include("accounts.urls")),
]
