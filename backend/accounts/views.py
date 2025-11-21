from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

@api_view(['GET'])
@ensure_csrf_cookie
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Provides the profile for the currently authenticated user.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def api_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)
    if user is not None:
        login(request, user)
        return Response({'status': 'Logged in', 'user': UserSerializer(user).data})
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['GET'])
def api_logout(request):
    logout(request)
    return Response({'status': 'Logged out'})
