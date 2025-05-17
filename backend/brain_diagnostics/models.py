# brain_diagnostics/models.py
from django.db import models
from users.models import Patient

class BrainScan(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='brain_scans', null=True, blank=True)
    image = models.ImageField(upload_to='brain_scans/')
    result = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Brain Scan {self.id} - {self.result or 'Undiagnosed'}"