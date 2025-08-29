"""
API URL 설정

이 파일은 drf-spectacular-auth와 함께 사용되는 API URL 설정의 예시를 보여줍니다.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from . import views

# 기본 라우터 설정
router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet)

# 중첩 라우터 설정 (포스트의 댓글)
posts_router = routers.NestedDefaultRouter(router, r'posts', lookup='post')
posts_router.register(r'comments', views.CommentViewSet, basename='post-comments')

urlpatterns = [
    # ViewSet 라우터
    path('', include(router.urls)),
    path('', include(posts_router.urls)),
    
    # 함수 기반 뷰
    path('public/posts/', views.public_posts, name='public-posts'),
    path('user/profile/', views.user_profile, name='user-profile'),
    path('health/', views.health_check, name='health-check'),
]