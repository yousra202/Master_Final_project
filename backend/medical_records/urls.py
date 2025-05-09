from django.urls import path
from .views import (
    MedicalRecordListView,
    MedicalRecordDetailView,
    PatientMedicalRecordView,
    MedicalHistoryView,
    AllergyView,
    MedicationView,
    LabResultView,
    VitalSignView,
    MedicalDocumentView,
    OperationView,
    ConsultationPrescriptionView
)

urlpatterns = [
    path('records/', MedicalRecordListView.as_view(), name='medical-record-list'),
    path('records/<int:pk>/', MedicalRecordDetailView.as_view(), name='medical-record-detail'),
    path('my-record/', PatientMedicalRecordView.as_view(), name='patient-medical-record'),
    path('records/<int:record_id>/history/', MedicalHistoryView.as_view(), name='medical-history'),
    path('records/<int:record_id>/allergies/', AllergyView.as_view(), name='allergies'),
    path('records/<int:record_id>/medications/', MedicationView.as_view(), name='medications'),
    path('records/<int:record_id>/lab-results/', LabResultView.as_view(), name='lab-results'),
    path('records/<int:record_id>/vital-signs/', VitalSignView.as_view(), name='vital-signs'),
    path('records/<int:record_id>/documents/', MedicalDocumentView.as_view(), name='medical-documents'),
    path('records/<int:record_id>/operations/', OperationView.as_view(), name='operations'),
    path('consultations/<int:consultation_id>/prescriptions/', ConsultationPrescriptionView.as_view(), name='consultation-prescriptions'),
]
