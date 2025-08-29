"""
API 시리얼라이저 예시

이 파일은 drf-spectacular-auth가 적용된 API의 시리얼라이저 예시를 보여줍니다.
"""

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import BlogPost, Comment


class UserSerializer(serializers.ModelSerializer):
    """
    사용자 정보 시리얼라이저
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id"]


class CommentSerializer(serializers.ModelSerializer):
    """
    댓글 시리얼라이저
    """

    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "author", "created_at"]
        read_only_fields = ["id", "author", "created_at"]


class BlogPostSerializer(serializers.ModelSerializer):
    """
    블로그 포스트 시리얼라이저
    """

    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "content",
            "author",
            "created_at",
            "updated_at",
            "is_published",
            "comments",
            "comments_count",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def get_comments_count(self, obj):
        """댓글 수를 반환합니다"""
        return obj.comments.count()


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """
    블로그 포스트 생성용 시리얼라이저
    """

    class Meta:
        model = BlogPost
        fields = ["title", "content", "is_published"]


class PublicBlogPostSerializer(serializers.ModelSerializer):
    """
    공개용 블로그 포스트 시리얼라이저 (인증 없이 볼 수 있는 정보)
    """

    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = BlogPost
        fields = ["id", "title", "content", "author_name", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]
