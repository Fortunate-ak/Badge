from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated



# AUTH views
# Current User View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Provides the profile for the currently authenticated user.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
def api_register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    User = get_user_model()
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=request.data.get('first_name'),
        last_name=request.data.get('last_name'),
        bio=request.data.get('bio', ''),
        dob=request.data.get('dob'),
        is_applicant=request.data.get('is_applicant', True),
        is_institution_staff=request.data.get('is_institution_staff', False)
    )
    login(request, user)
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST'])
def api_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    print("---hello man")
    user = authenticate(request, email=email, password=password)
    if user is not None:
        login(request, user)
        return Response({'status': 'Logged in'})
    else:
        return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['GET'])
def api_logout(request):
    logout(request)
    return Response({'status': 'Logged out'})