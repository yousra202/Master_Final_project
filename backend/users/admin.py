from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Doctor, Patient, AdminProfile, ActivityLog

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'user_type', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'birth_date', 'gender')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'birth_date', 'gender')}),
    )

class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialty', 'license_number', 'is_verified']
    list_filter = ['specialty', 'is_verified']
    search_fields = ['user__username', 'user__email', 'specialty']

class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['user__username', 'user__email']

class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
    search_fields = ['user__username', 'user__email', 'role']

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'details']
    readonly_fields = ['user', 'action', 'details', 'timestamp']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Doctor, DoctorAdmin)
admin.site.register(Patient, PatientAdmin)
admin.site.register(AdminProfile, AdminProfileAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)
