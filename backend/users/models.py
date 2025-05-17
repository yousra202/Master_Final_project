from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=15, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    
    objects = UserManager()
    
    def __str__(self):
        return self.username

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    license_number = models.CharField(max_length=20, blank=True)
    specialty = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    other_specialties = models.JSONField(default=list, blank=True, null=True)
    availability = models.JSONField(default=dict, blank=True, null=True)
    consultation_duration = models.IntegerField(default=30)
    notifications_settings = models.JSONField(default=dict, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    offers_online_consultation = models.BooleanField(default=False)
    offers_physical_consultation = models.BooleanField(default=True)
    online_consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    physical_consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"Dr. {self.user.username}"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    address = models.TextField()
    medical_history = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username


class Consultation(models.Model):
    CONSULTATION_TYPE_CHOICES = (
        ('physical', 'Physical'),
        ('online', 'Online'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='consultations')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    medical_record = models.ForeignKey(
        'medical_records.MedicalRecord',  # Fully qualified path
        on_delete=models.CASCADE,
        related_name='consultations',
        null=True,
        blank=True
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    consultation_type = models.CharField(max_length=10, choices=CONSULTATION_TYPE_CHOICES, default='physical')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    symptoms = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    treatment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Consultation: {self.doctor.user.username} - {self.patient.user.username} on {self.date} at {self.start_time}"

class Prescription(models.Model):
    consultation = models.ForeignKey(
        Consultation, on_delete=models.CASCADE, related_name='prescriptions'
        )
    medication = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Prescription for {self.consultation}"

class Review(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reviews')
    consultation = models.ForeignKey(Consultation, on_delete=models.SET_NULL, related_name='review', null=True, blank=True)
    rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.patient.user.username} for {self.doctor.user.username}"

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    role = models.CharField(max_length=50, default="Admin")
    permissions = models.JSONField(default=dict, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('account_validation', 'Validation de compte'),
        ('account_rejection', 'Rejet de compte'),
        ('config_change', 'Modification de configuration'),
        ('admin_creation', 'Création d\'administrateur'),
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('appointment_creation', 'Création de rendez-vous'),
        ('appointment_confirmation', 'Confirmation de rendez-vous'),
        ('appointment_cancellation', 'Annulation de rendez-vous'),
        ('other', 'Autre'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"
