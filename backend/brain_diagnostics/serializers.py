# brain_diagnostics/serializers.py
from rest_framework import serializers
from .models import BrainScan

class BrainScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrainScan
        fields = ['id', 'patient', 'image', 'result', 'confidence', 'created_at']
        read_only_fields = ['result', 'confidence', 'created_at']