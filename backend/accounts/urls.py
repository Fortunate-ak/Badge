from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.api_login, name='login'),
    path('logout/', views.api_logout, name='logout'),
    path('me/', views.current_user_view, name='current_user'),
]