from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models  # Add this import
from .models import Doctor, Patient, AdminProfile, ActivityLog, Consultation, Prescription, Review
from medical_records.models import MedicalRecord

User = get_user_model()

class DoctorRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    phone = serializers.CharField(max_length=15)
    birth_date = serializers.DateField()
    gender = serializers.CharField(max_length=10)
    license_number = serializers.CharField(max_length=20)
    specialty = serializers.CharField(max_length=50)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'phone': validated_data['phone'],
            'birth_date': validated_data['birth_date'],
            'gender': validated_data['gender'],
            'user_type': 'doctor'
        }
        
        user = User.objects.create_user(**user_data)
        
        doctor_data = {
            'user': user,
            'license_number': validated_data['license_number'],
            'specialty': validated_data['specialty'],
            'is_verified': False  # Par défaut, les médecins doivent être vérifiés
        }
        
        Doctor.objects.create(**doctor_data)
        return user

class PatientRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    phone = serializers.CharField(max_length=15)
    birth_date = serializers.DateField()
    gender = serializers.CharField(max_length=10)
    address = serializers.CharField()
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'phone': validated_data['phone'],
            'birth_date': validated_data['birth_date'],
            'gender': validated_data['gender'],
            'user_type': 'patient'
        }
        
        user = User.objects.create_user(**user_data)
        
        patient_data = {
            'user': user,
            'address': validated_data['address'],
            'is_verified': True  # Les patients sont vérifiés automatiquement
        }
        
        patient = Patient.objects.create(**patient_data)
        
        # Create a medical record for the patient
        MedicalRecord.objects.create(patient=patient)
        
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'birth_date', 'gender', 'user_type']

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'license_number', 'specialty', 'description', 'address', 
                 'other_specialties', 'availability', 'consultation_duration', 
                 'notifications_settings', 'profile_picture', 'is_verified',
                 'offers_online_consultation', 'offers_physical_consultation',
                 'online_consultation_fee', 'physical_consultation_fee']

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Patient
        fields = ['id', 'user', 'address', 'medical_history', 'is_verified']

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'role', 'permissions']

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'action', 'details', 'timestamp']

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

class ConsultationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ['doctor', 'patient', 'date', 'start_time', 'end_time', 
                 'consultation_type', 'symptoms']
        
    def validate(self, data):
        # Check if the time slot is available
        doctor = data['doctor']
        date = data['date']
        start_time = data['start_time']
        end_time = data['end_time']
        
        # Check if there's an existing confirmed consultation at this time
        existing_consultations = Consultation.objects.filter(
            doctor=doctor,
            date=date,
            status='confirmed'
        ).filter(
            # Check for overlapping time slots
            (models.Q(start_time__lt=end_time) & models.Q(end_time__gt=start_time))
        )
        
        if existing_consultations.exists():
            raise serializers.ValidationError("This time slot is already booked")
        
        return data

class ReviewSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'doctor', 'patient', 'consultation', 'rating', 'comment', 'created_at']
