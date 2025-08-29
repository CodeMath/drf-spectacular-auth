"""
URL configuration for example_project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView
from drf_spectacular_auth.views import SpectacularAuthSwaggerView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/', include('api.urls')),
    
    # 인증 API (drf-spectacular-auth에서 제공)
    path('api/auth/', include('drf_spectacular_auth.urls')),
    
    # Swagger/OpenAPI 문서
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # 기본 DRF API 브라우저 (선택사항)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]