from django.urls import path
from .views import UserRegistrationView, UserLoginView, DashboardView, LogoutView




urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
