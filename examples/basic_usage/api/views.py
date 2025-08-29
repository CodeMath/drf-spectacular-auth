"""
API 뷰 예시

이 파일은 drf-spectacular-auth가 적용된 API 뷰의 예시를 보여줍니다.
JWT 토큰을 사용한 인증이 필요한 뷰와 공개 뷰를 모두 포함합니다.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import BlogPost, Comment
from .serializers import (
    BlogPostSerializer, 
    BlogPostCreateSerializer, 
    CommentSerializer,
    PublicBlogPostSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="블로그 포스트 목록 조회",
        description="게시된 블로그 포스트들의 목록을 조회합니다. 인증이 필요합니다.",
        tags=["Blog Posts"]
    ),
    create=extend_schema(
        summary="블로그 포스트 생성",
        description="새로운 블로그 포스트를 생성합니다. JWT 토큰 인증이 필요합니다.",
        tags=["Blog Posts"]
    ),
    retrieve=extend_schema(
        summary="블로그 포스트 상세 조회",
        description="특정 블로그 포스트의 상세 정보를 조회합니다.",
        tags=["Blog Posts"]
    ),
    update=extend_schema(
        summary="블로그 포스트 수정",
        description="본인이 작성한 블로그 포스트를 수정합니다.",
        tags=["Blog Posts"]
    ),
    destroy=extend_schema(
        summary="블로그 포스트 삭제",
        description="본인이 작성한 블로그 포스트를 삭제합니다.",
        tags=["Blog Posts"]
    ),
)
class BlogPostViewSet(viewsets.ModelViewSet):
    """
    블로그 포스트 ViewSet (인증 필요)
    
    이 ViewSet은 JWT 토큰을 통한 인증이 필요합니다.
    drf-spectacular-auth를 통해 로그인한 후 발급받은 토큰을 
    Authorization 헤더에 'Bearer <token>' 형식으로 전달해야 합니다.
    """
    queryset = BlogPost.objects.filter(is_published=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BlogPostCreateSerializer
        return BlogPostSerializer
    
    def perform_create(self, serializer):
        # 현재 인증된 사용자를 작성자로 설정
        serializer.save(author=self.request.user)
    
    def get_queryset(self):
        # 본인이 작성한 글 또는 게시된 글만 조회 가능
        if self.action in ['update', 'destroy', 'partial_update']:
            return BlogPost.objects.filter(author=self.request.user)
        return BlogPost.objects.filter(is_published=True)
    
    @extend_schema(
        summary="내 블로그 포스트 목록",
        description="현재 로그인한 사용자가 작성한 모든 블로그 포스트를 조회합니다.",
        responses=BlogPostSerializer(many=True)
    )
    @action(detail=False, methods=['get'], url_path='my-posts')
    def my_posts(self, request):
        """내가 작성한 블로그 포스트들"""
        posts = BlogPost.objects.filter(author=request.user)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="블로그 포스트 게시/비게시",
        description="블로그 포스트의 게시 상태를 토글합니다.",
        request=None
    )
    @action(detail=True, methods=['post'], url_path='toggle-publish')
    def toggle_publish(self, request, pk=None):
        """게시 상태 토글"""
        post = self.get_object()
        if post.author != request.user:
            return Response(
                {"error": "본인이 작성한 글만 수정할 수 있습니다."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.is_published = not post.is_published
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        summary="댓글 목록 조회",
        description="특정 블로그 포스트의 댓글 목록을 조회합니다.",
        tags=["Comments"]
    ),
    create=extend_schema(
        summary="댓글 작성",
        description="블로그 포스트에 댓글을 작성합니다. 인증이 필요합니다.",
        tags=["Comments"]
    ),
)
class CommentViewSet(viewsets.ModelViewSet):
    """
    댓글 ViewSet (인증 필요)
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_pk')
        return Comment.objects.filter(post_id=post_id)
    
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_pk')
        serializer.save(author=self.request.user, post_id=post_id)


@extend_schema(
    summary="공개 블로그 포스트 목록",
    description="인증 없이 볼 수 있는 게시된 블로그 포스트들의 목록입니다.",
    responses=PublicBlogPostSerializer(many=True),
    tags=["Public API"]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def public_posts(request):
    """
    공개 블로그 포스트 목록 (인증 불필요)
    
    이 엔드포인트는 인증 없이 접근할 수 있습니다.
    """
    posts = BlogPost.objects.filter(is_published=True)[:10]  # 최신 10개
    serializer = PublicBlogPostSerializer(posts, many=True)
    return Response(serializer.data)


@extend_schema(
    summary="사용자 프로필 조회",
    description="현재 로그인한 사용자의 프로필 정보를 조회합니다. JWT 토큰 인증이 필요합니다.",
    tags=["User Profile"]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    사용자 프로필 조회 (인증 필요)
    
    이 엔드포인트는 JWT 토큰을 사용한 인증이 필요합니다.
    drf-spectacular-auth를 통해 로그인 후 발급받은 토큰을 사용하세요.
    """
    user = request.user
    post_count = BlogPost.objects.filter(author=user).count()
    published_count = BlogPost.objects.filter(author=user, is_published=True).count()
    comment_count = Comment.objects.filter(author=user).count()
    
    return Response({
        'user_info': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
        },
        'statistics': {
            'total_posts': post_count,
            'published_posts': published_count,
            'total_comments': comment_count,
        }
    })


@extend_schema(
    summary="API 상태 확인",
    description="API 서버의 상태를 확인합니다. 인증이 불필요합니다.",
    responses={200: {"type": "object", "properties": {"status": {"type": "string"}}}},
    tags=["Health Check"]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    API 헬스 체크 (인증 불필요)
    """
    return Response({
        "status": "healthy",
        "message": "DRF Spectacular Auth API is running",
        "auth_endpoints": {
            "login": "/api/auth/login/",
            "logout": "/api/auth/logout/",
        }
    })