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
    ActivityLogView
)

urlpatterns = [
    path('auth/doctor/register/', DoctorRegistrationView.as_view(), name='doctor-register'),
    path('auth/patient/register/', PatientRegistrationView.as_view(), name='patient-register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/verify-token/', TokenVerifyView.as_view(), name='token-verify'),
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('doctor/profile/update/', DoctorProfileView.as_view(), name='doctor-profile-update'),
    path('patient/profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('test/', DoctorListView.as_view(), name='test-view'),
    
    # Routes d'administration
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/doctors/validate/<int:doctor_id>/', ValidateDoctorView.as_view(), name='validate-doctor'),
    path('admin/doctors/reject/<int:doctor_id>/', RejectDoctorView.as_view(), name='reject-doctor'),
    path('admin/create/', CreateAdminView.as_view(), name='create-admin'),
    path('admin/list/', AdminListView.as_view(), name='admin-list'),
    path('admin/logs/', ActivityLogView.as_view(), name='activity-logs'),
]
