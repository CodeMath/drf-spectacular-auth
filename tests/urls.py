"""
URLs for testing
"""

from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView

from drf_spectacular_auth.views import SpectacularAuthSwaggerView

urlpatterns = [
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularAuthSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("auth/", include("drf_spectacular_auth.urls")),
]
