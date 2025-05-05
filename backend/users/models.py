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
    
    def __str__(self):
        return f"Dr. {self.user.username}"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    address = models.TextField()
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username

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
        ('other', 'Autre'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"
