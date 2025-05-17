# brain_diagnostics/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrainScanViewSet

router = DefaultRouter()
router.register(r'brain-scans', BrainScanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]