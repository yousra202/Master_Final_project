from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    DoctorRegistrationView,
    PatientRegistrationView,
    LoginView,
    DoctorProfileView,
    PatientProfileView
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
]
