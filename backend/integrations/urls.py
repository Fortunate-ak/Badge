from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Internal Management
router.register(r'keys', views.APIKeyViewSet, basename='apikey')

# External API
router.register(r'v1/opportunities', views.ExternalOpportunityViewSet, basename='external-opportunity')
router.register(r'v1/applicants', views.ExternalApplicantViewSet, basename='external-applicant')
router.register(r'v1/documents', views.ExternalDocumentViewSet, basename='external-document')

urlpatterns = [
    path('', include(router.urls)),
]
