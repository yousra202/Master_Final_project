from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    DoctorRegistrationView,
    PatientRegistrationView,
    LoginView,
    DoctorProfileView,
    PatientProfileView,
    DoctorListView,
    DoctorDetailView,
    AdminDashboardView,
    ValidateDoctorView,
    RejectDoctorView,
    CreateAdminView,
    AdminListView,
    ActivityLogView,
    DoctorAvailabilityView,
    ConsultationListView,
    ConsultationDetailView,
    PrescriptionView,
    ReviewView
)

urlpatterns = [
    # Authentication routes
    path('auth/doctor/register/', DoctorRegistrationView.as_view(), name='doctor-register'),
    path('auth/patient/register/', PatientRegistrationView.as_view(), name='patient-register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/verify-token/', TokenVerifyView.as_view(), name='token-verify'),
    
    # Profile routes
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('doctor/profile/update/', DoctorProfileView.as_view(), name='doctor-profile-update'),
    path('patient/profile/', PatientProfileView.as_view(), name='patient-profile'),
    
    # Doctor routes
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('doctors/<int:doctor_id>/availability/', DoctorAvailabilityView.as_view(), name='doctor-availability'),
    path('doctors/<int:doctor_id>/reviews/', ReviewView.as_view(), name='doctor-reviews'),
    
    # Consultation routes
    path('consultations/', ConsultationListView.as_view(), name='consultation-list'),
    path('consultations/<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('consultations/<int:consultation_id>/prescriptions/', PrescriptionView.as_view(), name='prescription-create'),
    
    # Admin routes
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/doctors/validate/<int:doctor_id>/', ValidateDoctorView.as_view(), name='validate-doctor'),
    path('admin/doctors/reject/<int:doctor_id>/', RejectDoctorView.as_view(), name='reject-doctor'),
    path('admin/create/', CreateAdminView.as_view(), name='create-admin'),
    path('admin/list/', AdminListView.as_view(), name='admin-list'),
    path('admin/logs/', ActivityLogView.as_view(), name='activity-logs'),
    
    # Test route
    path('test/', DoctorListView.as_view(), name='test-view'),
]
