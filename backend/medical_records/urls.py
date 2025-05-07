from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    MedicalRecordViewSet, MedicalHistoryViewSet, AllergyViewSet,
    MedicationViewSet, LabResultViewSet, VitalSignViewSet, AIAnalysisViewSet
)

router = DefaultRouter()
router.register(r'records', MedicalRecordViewSet)

# Nested routers for related objects
records_router = routers.NestedSimpleRouter(router, r'records', lookup='record')
records_router.register(r'history', MedicalHistoryViewSet, basename='record-history')
records_router.register(r'allergies', AllergyViewSet, basename='record-allergies')
records_router.register(r'medications', MedicationViewSet, basename='record-medications')
records_router.register(r'lab-results', LabResultViewSet, basename='record-lab-results')
records_router.register(r'vital-signs', VitalSignViewSet, basename='record-vital-signs')
records_router.register(r'ai-analyses', AIAnalysisViewSet, basename='record-ai-analyses')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(records_router.urls)),
]
