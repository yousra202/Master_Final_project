# brain_diagnostics/admin.py
from django.contrib import admin
from .models import BrainScan

@admin.register(BrainScan)
class BrainScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'result', 'confidence', 'created_at')
    list_filter = ('result', 'created_at')
    search_fields = ('patient__user__username', 'result')