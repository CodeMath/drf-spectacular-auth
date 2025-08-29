"""
URLs for DRF Spectacular Auth
"""

from django.urls import path

from .views import login_view, logout_view

app_name = "drf_spectacular_auth"

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
]
