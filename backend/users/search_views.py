from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Doctor, User
from .serializers import DoctorProfileSerializer

class SearchSuggestionsView(APIView):
    """
    API endpoint that provides search suggestions for doctors, specialties, and locations.
    """
    def get(self, request):
        query = request.query_params.get('query', '')
        location = request.query_params.get('location', '')
        
        if len(query) < 2 and len(location) < 2:
            return Response({
                'specialties': [],
                'doctors': [],
                'locations': []
            })
        
        results = {
            'specialties': [],
            'doctors': [],
            'locations': []
        }
        
        # Search for specialties
        if query:
            # Get unique specialties that match the query
            specialty_matches = Doctor.objects.filter(
                specialty__icontains=query
            ).values_list('specialty', flat=True).distinct()[:5]
            
            results['specialties'] = [
                {'id': idx, 'name': specialty} 
                for idx, specialty in enumerate(specialty_matches)
            ]
        
        # Search for doctors
        if query:
            doctor_matches = Doctor.objects.filter(
                Q(user__username__icontains=query) | 
                Q(specialty__icontains=query)
            ).select_related('user')[:5]
            
            results['doctors'] = [
                {
                    'id': doctor.id,
                    'name': f"Dr. {doctor.user.username}",
                    'specialty': doctor.specialty,
                    'address': doctor.address or ''
                }
                for doctor in doctor_matches
            ]
        
        # Search for locations
        if location:
            # Get unique locations from doctor addresses
            location_matches = Doctor.objects.filter(
                address__icontains=location
            ).values_list('address', flat=True).distinct()[:5]
            
            results['locations'] = [
                {'id': idx, 'name': loc} 
                for idx, loc in enumerate(location_matches) if loc
            ]
        
        return Response(results)


class SearchResultsView(APIView):
    """
    API endpoint that returns search results for doctors based on specialty and location.
    """
    def get(self, request):
        specialty = request.query_params.get('specialty', '')
        location = request.query_params.get('location', '')
        
        query = Q()
        
        if specialty:
            query &= Q(specialty__icontains=specialty) | Q(user__username__icontains=specialty)
        
        if location:
            query &= Q(address__icontains=location)
        
        # If no filters are applied, return an empty list
        if not specialty and not location:
            return Response([])
        
        doctors = Doctor.objects.filter(query).select_related('user')
        serializer = DoctorSerializer(doctors, many=True)
        
        return Response(serializer.data)
