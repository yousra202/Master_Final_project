
# brain_diagnostics/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import BrainScan
from .serializers import BrainScanSerializer
from .tumor_detection import predict_tumor

class BrainScanViewSet(viewsets.ModelViewSet):
    queryset = BrainScan.objects.all()
    serializer_class = BrainScanSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Process the image and update the result
        result, confidence = predict_tumor(instance.image.path)
        instance.result = result
        instance.confidence = confidence
        instance.save()
    
    @action(detail=False, methods=['post'])
    def diagnose(self, request):
        """
        Endpoint for anonymous diagnostics (no patient association)
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            
            # Process the image and update the result
            result, confidence = predict_tumor(instance.image.path)
            instance.result = result
            instance.confidence = confidence
            instance.save()
            
            return Response({
                'id': instance.id,
                'result': result,
                'confidence': confidence,
                'image_url': request.build_absolute_uri(instance.image.url)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
