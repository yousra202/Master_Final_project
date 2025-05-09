from django.db import models
from users.models import Patient, Doctor, User

class MedicalRecord(models.Model):
    """Dossier médical principal d'un patient"""
    patient = models.OneToOneField('users.Patient', on_delete=models.CASCADE, related_name='medical_record')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'medical_records'  # Add this line
        
    def __str__(self):
        return f"Dossier Médical de {self.patient.user.username}"

class MedicalHistory(models.Model):
    """Antécédents médicaux du patient"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='history_entries')
    condition = models.CharField(max_length=200)
    diagnosis_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        app_label = 'medical_records'
        
    def __str__(self):
        return f"{self.condition} - {self.medical_record.patient.user.username}"

class Allergy(models.Model):
    """Allergies du patient"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=200)
    severity = models.CharField(max_length=50, choices=[
        ('mild', 'Légère'),
        ('moderate', 'Modérée'),
        ('severe', 'Sévère'),
    ])
    reaction = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.allergen} - {self.medical_record.patient.user.username}"

class Medication(models.Model):
    """Médicaments actuels et passés"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} - {self.medical_record.patient.user.username}"

class LabResult(models.Model):
    """Résultats d'analyses de laboratoire"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='lab_results')
    test_name = models.CharField(max_length=200)
    test_date = models.DateField()
    result_value = models.CharField(max_length=100)
    unit = models.CharField(max_length=50, blank=True, null=True)
    reference_range = models.CharField(max_length=100, blank=True, null=True)
    is_abnormal = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.test_name} - {self.medical_record.patient.user.username}"

class MedicalImage(models.Model):
    """Images médicales comme les radiographies, IRM, etc."""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medical_images')
    image_type = models.CharField(max_length=100)
    image_date = models.DateField()
    image_file = models.ImageField(upload_to='medical_images/')
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.image_type} - {self.medical_record.patient.user.username}"

class VitalSign(models.Model):
    """Signes vitaux du patient"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='vital_signs')
    date_recorded = models.DateTimeField()
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"Signes vitaux de {self.medical_record.patient.user.username} le {self.date_recorded.strftime('%Y-%m-%d')}"

class MedicalDocument(models.Model):
    """Documents médicaux (PDF, images, etc.)"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='medical_documents/')
    upload_date = models.DateTimeField(auto_now_add=True)
    document_type = models.CharField(max_length=50, choices=[
        ('medical_report', 'Rapport Médical'),
        ('lab_result', 'Résultat d\'Analyse'),
        ('prescription', 'Prescription'),
        ('imaging', 'Imagerie'),
        ('other', 'Autre'),
    ])
    file_type = models.CharField(max_length=20, blank=True, null=True)  # pdf, image, etc.
    
    def __str__(self):
        return f"{self.title} - {self.medical_record.patient.user.username}"
    
    def save(self, *args, **kwargs):
        # Déterminer le type de fichier
        if self.file:
            file_name = self.file.name.lower()
            if file_name.endswith('.pdf'):
                self.file_type = 'pdf'
            elif file_name.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                self.file_type = 'image'
            else:
                self.file_type = 'other'
        super().save(*args, **kwargs)

class Operation(models.Model):
    """Opérations chirurgicales"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='operations')
    name = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField()
    doctors = models.ManyToManyField(Doctor, related_name='performed_operations')
    hospital = models.CharField(max_length=200)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} - {self.medical_record.patient.user.username} - {self.date}"
