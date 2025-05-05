from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doctor, Patient, AdminProfile, ActivityLog

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
        
        Patient.objects.create(**patient_data)
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
                 'notifications_settings', 'profile_picture', 'is_verified']

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Patient
        fields = ['id', 'user', 'address', 'is_verified']

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
