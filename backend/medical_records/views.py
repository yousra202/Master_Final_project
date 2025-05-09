from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import (
    MedicalRecord, MedicalHistory, Allergy, Medication,
    LabResult, MedicalImage, VitalSign, MedicalDocument, Operation
)
from .serializers import (
    MedicalRecordDetailSerializer, MedicalRecordSummarySerializer,
    MedicalHistorySerializer, AllergySerializer, MedicationSerializer,
    LabResultSerializer, MedicalImageSerializer, VitalSignSerializer,
    MedicalDocumentSerializer, OperationSerializer
)
from users.models import Patient, Doctor, Consultation, Prescription
from users.serializers import PrescriptionSerializer
import logging

# Configuration du logging
logger = logging.getLogger(__name__)

class MedicalRecordListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.user_type == 'doctor':
            # Les médecins peuvent voir la liste des dossiers médicaux de leurs patients
            try:
                doctor = Doctor.objects.get(user=user)
                # Obtenir les patients qui ont eu des consultations avec ce médecin
                patients_with_consultations = Patient.objects.filter(
                    consultations__doctor=doctor
                ).distinct()
                
                medical_records = MedicalRecord.objects.filter(
                    patient__in=patients_with_consultations
                )
                
                serializer = MedicalRecordSummarySerializer(medical_records, many=True)
                return Response(serializer.data)
            except Doctor.DoesNotExist:
                return Response({'detail': 'Profil de médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        elif user.user_type == 'patient':
            # Les patients ne peuvent voir que leur propre dossier médical
            try:
                patient = Patient.objects.get(user=user)
                medical_record, created = MedicalRecord.objects.get_or_create(patient=patient)
                
                serializer = MedicalRecordSummarySerializer(medical_record)
                return Response(serializer.data)
            except Patient.DoesNotExist:
                return Response({'detail': 'Profil de patient non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

class MedicalRecordDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user = request.user
        medical_record = get_object_or_404(MedicalRecord, pk=pk)
        
        if user.user_type == 'doctor':
            # Vérifier que le médecin a eu des consultations avec ce patient
            try:
                doctor = Doctor.objects.get(user=user)
                has_consultation = doctor.consultations.filter(patient=medical_record.patient).exists()
                
                if not has_consultation:
                    return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                                   status=status.HTTP_403_FORBIDDEN)
                
                serializer = MedicalRecordDetailSerializer(medical_record)
                return Response(serializer.data)
            except Doctor.DoesNotExist:
                return Response({'detail': 'Profil de médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        elif user.user_type == 'patient':
            # Les patients ne peuvent consulter que leur propre dossier médical
            try:
                patient = Patient.objects.get(user=user)
                
                if medical_record.patient != patient:
                    return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                                   status=status.HTTP_403_FORBIDDEN)
                
                serializer = MedicalRecordDetailSerializer(medical_record)
                return Response(serializer.data)
            except Patient.DoesNotExist:
                return Response({'detail': 'Profil de patient non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

class PatientMedicalRecordView(APIView):
    """Vue permettant aux patients d'accéder à leur propre dossier médical"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'patient':
            return Response({'detail': 'Seuls les patients peuvent accéder à cet endpoint'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        try:
            patient = Patient.objects.get(user=request.user)
            medical_record, created = MedicalRecord.objects.get_or_create(patient=patient)
            
            serializer = MedicalRecordDetailSerializer(medical_record)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({'detail': 'Profil de patient non trouvé'}, status=status.HTTP_404_NOT_FOUND)

class MedicalHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        history_entries = MedicalHistory.objects.filter(medical_record=medical_record)
        serializer = MedicalHistorySerializer(history_entries, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des antécédents médicaux
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des antécédents médicaux'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicalHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class AllergyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        allergies = Allergy.objects.filter(medical_record=medical_record)
        serializer = AllergySerializer(allergies, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des allergies
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des allergies'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = AllergySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class MedicationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        medications = Medication.objects.filter(medical_record=medical_record)
        serializer = MedicationSerializer(medications, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des médicaments
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des médicaments'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class LabResultView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        lab_results = LabResult.objects.filter(medical_record=medical_record)
        serializer = LabResultSerializer(lab_results, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des résultats d'analyses
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des résultats d\'analyses'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = LabResultSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class VitalSignView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        vital_signs = VitalSign.objects.filter(medical_record=medical_record)
        serializer = VitalSignSerializer(vital_signs, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des signes vitaux
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des signes vitaux'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = VitalSignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class MedicalDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        documents = MedicalDocument.objects.filter(medical_record=medical_record)
        serializer = MedicalDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des documents
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des documents'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicalDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(medical_record=medical_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class OperationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Vérifier les permissions
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de consulter ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        operations = Operation.objects.filter(medical_record=medical_record)
        serializer = OperationSerializer(operations, many=True)
        return Response(serializer.data)
    
    def post(self, request, record_id):
        medical_record = get_object_or_404(MedicalRecord, pk=record_id)
        
        # Seuls les médecins peuvent ajouter des opérations
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des opérations'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier si le médecin a l'autorisation
        if not self._has_permission(request.user, medical_record):
            return Response({'detail': 'Vous n\'avez pas l\'autorisation de modifier ce dossier médical'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = OperationSerializer(data=request.data)
        if serializer.is_valid():
            operation = serializer.save(medical_record=medical_record)
            
            # Ajouter le médecin actuel à la liste des médecins de l'opération
            doctor = Doctor.objects.get(user=request.user)
            operation.doctors.add(doctor)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _has_permission(self, user, medical_record):
        """Vérifier si l'utilisateur a l'autorisation d'accéder au dossier médical"""
        if user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return doctor.consultations.filter(patient=medical_record.patient).exists()
            except Doctor.DoesNotExist:
                return False
        elif user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return medical_record.patient == patient
            except Patient.DoesNotExist:
                return False
        return False

class ConsultationPrescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, consultation_id):
        consultation = get_object_or_404(Consultation, pk=consultation_id)
        
        # Vérifier si l'utilisateur est le médecin de cette consultation
        if request.user.user_type != 'doctor':
            return Response({'detail': 'Seuls les médecins peuvent ajouter des prescriptions'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        try:
            doctor = Doctor.objects.get(user=request.user)
            if consultation.doctor != doctor:
                return Response({'detail': 'Vous n\'êtes pas le médecin de cette consultation'}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            serializer = PrescriptionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(consultation=consultation)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Profil de médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)
