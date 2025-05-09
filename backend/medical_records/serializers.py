from rest_framework import serializers
from .models import (
    MedicalRecord, MedicalHistory, Allergy, Medication,
    LabResult, MedicalImage, VitalSign, MedicalDocument, Operation
)
from users.serializers import PatientProfileSerializer, DoctorProfileSerializer
from users.models import Consultation, Prescription

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition', 'diagnosis_date', 'notes', 'is_active']

class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'allergen', 'severity', 'reaction']

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'name', 'dosage', 'frequency', 'start_date', 'end_date', 'is_active', 'notes']

class LabResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = ['id', 'test_name', 'test_date', 'result_value', 'unit', 'reference_range', 'is_abnormal', 'notes']

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = ['id', 'image_type', 'image_date', 'image_file', 'description']

class VitalSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSign
        fields = ['id', 'date_recorded', 'blood_pressure_systolic', 'blood_pressure_diastolic', 
                 'heart_rate', 'respiratory_rate', 'temperature', 'weight', 'height']

class MedicalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDocument
        fields = ['id', 'title', 'description', 'file', 'upload_date', 'document_type', 'file_type']

class OperationSerializer(serializers.ModelSerializer):
    doctors = DoctorProfileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Operation
        fields = ['id', 'name', 'date', 'description', 'doctors', 'hospital', 'notes']

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'medication', 'dosage', 'frequency', 'duration', 'notes', 'created_at']

class ConsultationSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = PatientProfileSerializer(read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Consultation
        fields = ['id', 'doctor', 'patient', 'date', 'start_time', 'end_time', 
                 'consultation_type', 'status', 'notes', 'symptoms', 'diagnosis', 
                 'treatment', 'created_at', 'updated_at', 'prescriptions']

class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    history_entries = MedicalHistorySerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    lab_results = LabResultSerializer(many=True, read_only=True)
    medical_images = MedicalImageSerializer(many=True, read_only=True)
    vital_signs = VitalSignSerializer(many=True, read_only=True)
    documents = MedicalDocumentSerializer(many=True, read_only=True)
    operations = OperationSerializer(many=True, read_only=True)
    consultations = ConsultationSerializer(many=True, read_only=True, source='patient.consultations')
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'created_at', 'updated_at', 'history_entries', 
                 'allergies', 'medications', 'lab_results', 'medical_images', 
                 'vital_signs', 'documents', 'operations', 'consultations']

class MedicalRecordSummarySerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    allergies_count = serializers.SerializerMethodField()
    active_medications_count = serializers.SerializerMethodField()
    consultations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'created_at', 'updated_at', 'allergies_count', 
                 'active_medications_count', 'consultations_count']
    
    def get_allergies_count(self, obj):
        return obj.allergies.count()
    
    def get_active_medications_count(self, obj):
        return obj.medications.filter(is_active=True).count()
    
    def get_consultations_count(self, obj):
        return obj.patient.consultations.count()
