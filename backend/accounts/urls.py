from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.api_login, name='login'),
    path('register/', views.api_register, name="register"),
    path('logout/', views.api_logout, name='logout'),
    path('me/', views.current_user_view, name='current_user'),
]