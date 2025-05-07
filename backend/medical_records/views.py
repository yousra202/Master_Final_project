from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (
    MedicalRecord, MedicalHistory, Allergy, 
    Medication, LabResult, VitalSign, AIAnalysis
)
from .serializers import (
    MedicalRecordSerializer, MedicalRecordCreateSerializer,
    MedicalHistorySerializer, AllergySerializer,
    MedicationSerializer, LabResultSerializer,
    VitalSignSerializer, AIAnalysisSerializer
)
from users.models import Patient

class IsOwnerOrDoctor(permissions.BasePermission):
    """
    Custom permission to only allow owners of a medical record or doctors to view it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is a doctor
        if hasattr(request.user, 'doctor'):
            return True
        
        # Check if user is the owner of the medical record
        return obj.patient.user == request.user

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_serializer_class(self):
        if self.action == 'create':
            return MedicalRecordCreateSerializer
        return MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        
        # If user is a doctor, return all medical records
        if hasattr(user, 'doctor'):
            return MedicalRecord.objects.all()
        
        # If user is a patient, return only their medical record
        if hasattr(user, 'patient'):
            return MedicalRecord.objects.filter(patient=user.patient)
        
        # Otherwise return empty queryset
        return MedicalRecord.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_record(self, request):
        """
        Get the medical record for the current patient user.
        """
        if not hasattr(request.user, 'patient'):
            return Response(
                {"detail": "You do not have a patient profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            record = MedicalRecord.objects.get(patient=request.user.patient)
            serializer = self.get_serializer(record)
            return Response(serializer.data)
        except MedicalRecord.DoesNotExist:
            return Response(
                {"detail": "Medical record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return MedicalHistory.objects.filter(medical_record_id=record_id)
        return MedicalHistory.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)

class AllergyViewSet(viewsets.ModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return Allergy.objects.filter(medical_record_id=record_id)
        return Allergy.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)

class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return Medication.objects.filter(medical_record_id=record_id)
        return Medication.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)

class LabResultViewSet(viewsets.ModelViewSet):
    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return LabResult.objects.filter(medical_record_id=record_id)
        return LabResult.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)

class VitalSignViewSet(viewsets.ModelViewSet):
    queryset = VitalSign.objects.all()
    serializer_class = VitalSignSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return VitalSign.objects.filter(medical_record_id=record_id)
        return VitalSign.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)

class AIAnalysisViewSet(viewsets.ModelViewSet):
    queryset = AIAnalysis.objects.all()
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDoctor]

    def get_queryset(self):
        record_id = self.kwargs.get('record_pk')
        if record_id:
            return AIAnalysis.objects.filter(medical_record_id=record_id)
        return AIAnalysis.objects.none()
    
    def perform_create(self, serializer):
        record_id = self.kwargs.get('record_pk')
        medical_record = get_object_or_404(MedicalRecord, id=record_id)
        serializer.save(medical_record=medical_record)
