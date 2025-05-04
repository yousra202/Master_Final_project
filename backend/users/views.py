from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import json
from .serializers import (
    DoctorRegistrationSerializer, 
    PatientRegistrationSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer
)
from .models import Doctor, Patient

class DoctorRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = DoctorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': 'doctor',
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PatientRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': 'patient',
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': user.user_type,
                'username': user.username
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            # If doctor profile doesn't exist, create one with default values
            doctor = Doctor.objects.create(
                user=request.user,
                license_number="",
                specialty="",
                description="",
                address="",
                other_specialties=[],
                availability={
                    "schedule": [
                        {
                            "day": "Lundi",
                            "slots": [
                                {"start": "08:00", "end": "10:00"},
                                {"start": "14:00", "end": "17:00"}
                            ]
                        },
                        {
                            "day": "Mardi",
                            "slots": [
                                {"start": "09:00", "end": "12:00"},
                                {"start": "15:00", "end": "18:00"}
                            ]
                        }
                    ],
                    "consultationDuration": 30
                },
                consultation_duration=30,
                notifications_settings={
                    "newAppointments": True,
                    "appointmentReminders": True,
                    "onlineConsultations": False,
                    "patientMessages": True
                }
            )
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
    
    def put(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            user = request.user
            
            # Update user data
            if 'username' in request.data:
                user.username = request.data.get('username')
            if 'email' in request.data:
                user.email = request.data.get('email')
            if 'phone' in request.data:
                user.phone = request.data.get('phone')
            if 'birth_date' in request.data:
                user.birth_date = request.data.get('birth_date')
            
            user.save()
            
            # Update doctor data
            if 'license_number' in request.data:
                doctor.license_number = request.data.get('license_number')
            if 'specialty' in request.data:
                doctor.specialty = request.data.get('specialty')
            if 'description' in request.data:
                doctor.description = request.data.get('description')
            if 'address' in request.data:
                doctor.address = request.data.get('address')
            
            # Handle JSON fields
            if 'other_specialties' in request.data:
                try:
                    doctor.other_specialties = json.loads(request.data.get('other_specialties'))
                except:
                    doctor.other_specialties = request.data.get('other_specialties')
            
            if 'availability' in request.data:
                try:
                    doctor.availability = json.loads(request.data.get('availability'))
                except:
                    doctor.availability = request.data.get('availability')
            
            if 'notifications' in request.data:
                try:
                    doctor.notifications_settings = json.loads(request.data.get('notifications'))
                except:
                    doctor.notifications_settings = request.data.get('notifications')
            
            # Handle profile picture
            if 'profile_picture' in request.FILES:
                doctor.profile_picture = request.FILES['profile_picture']
            
            doctor.save()
            
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            # Create doctor profile if it doesn't exist
            doctor = Doctor.objects.create(
                user=request.user,
                license_number=request.data.get('license_number', ''),
                specialty=request.data.get('specialty', ''),
                description=request.data.get('description', ''),
                address=request.data.get('address', '')
            )
            
            # Handle JSON fields
            if 'other_specialties' in request.data:
                try:
                    doctor.other_specialties = json.loads(request.data.get('other_specialties'))
                except:
                    doctor.other_specialties = request.data.get('other_specialties')
            
            if 'availability' in request.data:
                try:
                    doctor.availability = json.loads(request.data.get('availability'))
                except:
                    doctor.availability = request.data.get('availability')
            
            if 'notifications' in request.data:
                try:
                    doctor.notifications_settings = json.loads(request.data.get('notifications'))
                except:
                    doctor.notifications_settings = request.data.get('notifications')
            
            # Handle profile picture
            if 'profile_picture' in request.FILES:
                doctor.profile_picture = request.FILES['profile_picture']
            
            doctor.save()
            
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)

class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = PatientProfileSerializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({'detail': 'Patient profile not found'}, status=status.HTTP_404_NOT_FOUND)
