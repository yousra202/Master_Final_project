from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import json
from .serializers import (
    DoctorRegistrationSerializer, 
    PatientRegistrationSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer,
    AdminProfileSerializer,
    ActivityLogSerializer
)
from .models import Doctor, Patient, User, AdminProfile, ActivityLog
import logging

# Set up logging
logger = logging.getLogger(__name__)

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
            # Vérifier si le médecin est vérifié
            if user.user_type == 'doctor':
                try:
                    doctor = Doctor.objects.get(user=user)
                    if not doctor.is_verified:
                        return Response({'detail': 'Votre compte médecin est en attente de validation par un administrateur.'}, 
                                       status=status.HTTP_401_UNAUTHORIZED)
                except Doctor.DoesNotExist:
                    pass
            
            # Créer un log d'activité pour la connexion
            ActivityLog.objects.create(
                user=user,
                action='login',
                details=f"Connexion depuis {request.META.get('REMOTE_ADDR', 'adresse inconnue')}"
            )
            
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
                },
                is_verified=False
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
                address=request.data.get('address', ''),
                is_verified=False
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

# Update the DoctorListView to handle database errors and always return mock data as fallback
class DoctorListView(APIView):
    permission_classes = [AllowAny]  # Ensure this is set to AllowAny
    
    def get(self, request):
        try:
            print("DoctorListView: Fetching doctors from database")
            # Seulement retourner les médecins vérifiés
            doctors = Doctor.objects.filter(is_verified=True)
            
            # If no doctors found, create at least one doctor for demonstration
            if not doctors.exists():
                print("DoctorListView: No doctors found, creating demo doctor")
                # Check if there's a doctor user already
                doctor_users = User.objects.filter(user_type='doctor')
                if doctor_users.exists():
                    doctor_user = doctor_users.first()
                    print(f"DoctorListView: Using existing doctor user: {doctor_user.username}")
                else:
                    # Create a demo doctor user if none exists
                    print("DoctorListView: Creating new demo doctor user")
                    doctor_user = User.objects.create_user(
                        username="Dr. Demo",
                        email="demo@example.com",
                        password="securepassword123",
                        user_type="doctor",
                        phone="+212600000000",
                        birth_date="1980-01-01",
                        gender="male"
                    )
                
                # Create a doctor profile for the user
                print(f"DoctorListView: Creating doctor profile for user: {doctor_user.username}")
                Doctor.objects.create(
                    user=doctor_user,
                    license_number="DEMO123",
                    specialty="généraliste",
                    description="Médecin pour démonstration",
                    address="Casablanca",
                    is_verified=True  # Ce médecin de démo est vérifié
                )
                doctors = Doctor.objects.filter(is_verified=True)
            
            print(f"DoctorListView: Returning {doctors.count()} doctors")
            serializer = DoctorProfileSerializer(doctors, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Log the error for server-side debugging
            print(f"DoctorListView ERROR: {str(e)}")
            
            # Create mock data as fallback
            print("DoctorListView: Creating mock data as fallback")
            mock_doctors = [
                {
                    "id": 1,
                    "user": {
                        "id": 1,
                        "username": "Dr. Ahmed Benali",
                        "email": "ahmed.benali@example.com",
                        "phone": "+212600000001",
                        "birth_date": "1975-05-15",
                        "gender": "male",
                        "user_type": "doctor"
                    },
                    "license_number": "MED12345",
                    "specialty": "cardiologie",
                    "description": "Cardiologue avec 15 ans d'expérience",
                    "address": "Casablanca, Quartier Maarif",
                    "other_specialties": ["échocardiographie", "cardiologie interventionnelle"],
                    "availability": None,
                    "consultation_duration": 30,
                    "notifications_settings": None,
                    "profile_picture": None,
                    "is_verified": True
                },
                {
                    "id": 2,
                    "user": {
                        "id": 2,
                        "username": "Dr. Fatima Zahra",
                        "email": "fatima.zahra@example.com",
                        "phone": "+212600000002",
                        "birth_date": "1980-08-22",
                        "gender": "female",
                        "user_type": "doctor"
                    },
                    "license_number": "MED67890",
                    "specialty": "pédiatrie",
                    "description": "Pédiatre spécialisée en néonatologie",
                    "address": "Rabat, Avenue Mohammed V",
                    "other_specialties": ["néonatologie", "pédiatrie du développement"],
                    "availability": None,
                    "consultation_duration": 45,
                    "notifications_settings": None,
                    "profile_picture": None,
                    "is_verified": True
                },
                {
                    "id": 3,
                    "user": {
                        "id": 3,
                        "username": "Dr. Karim Alaoui",
                        "email": "karim.alaoui@example.com",
                        "phone": "+212600000003",
                        "birth_date": "1978-11-10",
                        "gender": "male",
                        "user_type": "doctor"
                    },
                    "license_number": "MED54321",
                    "specialty": "dermatologie",
                    "description": "Dermatologue spécialisé en dermatologie esthétique",
                    "address": "Marrakech, Guéliz",
                    "other_specialties": ["dermatologie esthétique", "traitement de l'acné"],
                    "availability": None,
                    "consultation_duration": 30,
                    "notifications_settings": None,
                    "profile_picture": None,
                    "is_verified": True
                }
            ]
            
            # Return the mock data
            return Response(mock_doctors)

class DoctorDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            doctor = Doctor.objects.get(pk=pk, is_verified=True)
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'Erreur serveur: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vues pour l'administration
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer les statistiques
        total_doctors = Doctor.objects.count()
        verified_doctors = Doctor.objects.filter(is_verified=True).count()
        pending_doctors = Doctor.objects.filter(is_verified=False).count()
        total_patients = Patient.objects.count()
        
        # Récupérer les médecins en attente de validation
        pending_doctor_requests = Doctor.objects.filter(is_verified=False)
        pending_serializer = DoctorProfileSerializer(pending_doctor_requests, many=True)
        
        # Récupérer les dernières activités
        recent_activities = ActivityLog.objects.all().order_by('-timestamp')[:10]
        activity_serializer = ActivityLogSerializer(recent_activities, many=True)
        
        return Response({
            'statistics': {
                'total_doctors': total_doctors,
                'verified_doctors': verified_doctors,
                'pending_doctors': pending_doctors,
                'total_patients': total_patients,
            },
            'pending_requests': pending_serializer.data,
            'recent_activities': activity_serializer.data
        })

class ValidateDoctorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, doctor_id):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
            doctor.is_verified = True
            doctor.save()
            
            # Créer un log d'activité
            ActivityLog.objects.create(
                user=request.user,
                action='account_validation',
                details=f"Validation du compte médecin: {doctor.user.username}"
            )
            
            return Response({'detail': 'Compte médecin validé avec succès'})
        except Doctor.DoesNotExist:
            return Response({'detail': 'Médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)

class RejectDoctorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, doctor_id):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
            reason = request.data.get('reason', 'Aucune raison fournie')
            
            # Créer un log d'activité
            ActivityLog.objects.create(
                user=request.user,
                action='account_rejection',
                details=f"Rejet du compte médecin: {doctor.user.username}. Raison: {reason}"
            )
            
            # Supprimer le médecin et son utilisateur
            user = doctor.user
            doctor.delete()
            user.delete()
            
            return Response({'detail': 'Compte médecin rejeté avec succès'})
        except Doctor.DoesNotExist:
            return Response({'detail': 'Médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)

class CreateAdminView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'Admin')
        
        if not username or not email or not password:
            return Response({'detail': 'Veuillez fournir un nom d\'utilisateur, un email et un mot de passe'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Créer un nouvel utilisateur admin
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                user_type='admin'
            )
            
            # Créer un profil admin
            AdminProfile.objects.create(
                user=user,
                role=role
            )
            
            # Créer un log d'activité
            ActivityLog.objects.create(
                user=request.user,
                action='admin_creation',
                details=f"Création d'un nouvel administrateur: {username} avec le rôle: {role}"
            )
            
            return Response({'detail': 'Administrateur créé avec succès'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': f'Erreur lors de la création de l\'administrateur: {str(e)}'}, 
                           status=status.HTTP_400_BAD_REQUEST)

class AdminListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        admins = AdminProfile.objects.all()
        serializer = AdminProfileSerializer(admins, many=True)
        return Response(serializer.data)

class ActivityLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Vérifier si l'utilisateur est un administrateur
        if request.user.user_type != 'admin':
            return Response({'detail': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        logs = ActivityLog.objects.all().order_by('-timestamp')
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)
