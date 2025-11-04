import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def proxy_carbon_calculate(request):
    try:
        token = request.auth.key
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json', 'X-User-Id': str(request.user.id)}
        resp = requests.post(f'{settings.CARBON_CALCULATOR_URL}/calculate', json=request.data, headers=headers, timeout=30)
        return Response(resp.json(), status=resp.status_code)
    except Exception as e:
        return Response({'error': str(e)}, status=503)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def proxy_carbon_explain(request):
    try:
        token = request.auth.key
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json', 'X-User-Id': str(request.user.id)}
        resp = requests.post(f'{settings.CARBON_CALCULATOR_URL}/explain', json=request.data, headers=headers, timeout=30)
        return Response(resp.json(), status=resp.status_code)
    except Exception as e:
        return Response({'error': str(e)}, status=503)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    from auth_app.serializers import UserSerializer
    return Response(UserSerializer(request.user).data)
