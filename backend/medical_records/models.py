from django.db import models
from django.utils import timezone
from users.models import Patient, Doctor

class MedicalRecord(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='patient_medical_record')
    blood_type = models.CharField(max_length=5, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Medical Record for {self.patient.user.username}"

class MedicalHistory(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, related_name='medical_histories', on_delete=models.CASCADE)
    condition = models.CharField(max_length=100)
    diagnosis_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.condition} - {self.medical_record.patient.user.username}"

class Allergy(models.Model):
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    medical_record = models.ForeignKey(MedicalRecord, related_name='allergies', on_delete=models.CASCADE)
    allergen = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    reaction = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.allergen} - {self.medical_record.patient.user.username}"

class Medication(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, related_name='medications', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.medical_record.patient.user.username}"

class LabResult(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, related_name='lab_results', on_delete=models.CASCADE)
    test_name = models.CharField(max_length=100)
    test_date = models.DateField()
    result_value = models.CharField(max_length=50)
    unit = models.CharField(max_length=20, blank=True, null=True)
    reference_range = models.CharField(max_length=50, blank=True, null=True)
    is_abnormal = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test_name} - {self.medical_record.patient.user.username}"

class VitalSign(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, related_name='vital_signs', on_delete=models.CASCADE)
    date_recorded = models.DateTimeField()
    blood_pressure_systolic = models.IntegerField(blank=True, null=True)
    blood_pressure_diastolic = models.IntegerField(blank=True, null=True)
    heart_rate = models.IntegerField(blank=True, null=True)
    respiratory_rate = models.IntegerField(blank=True, null=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Vital Signs on {self.date_recorded} - {self.medical_record.patient.user.username}"

class AIAnalysis(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, related_name='ai_analyses', on_delete=models.CASCADE)
    analysis_date = models.DateTimeField(auto_now_add=True)
    analysis_type = models.CharField(max_length=50)
    summary = models.TextField()
    recommendations = models.TextField(blank=True, null=True)
    alerts = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.analysis_type} Analysis - {self.medical_record.patient.user.username}"
