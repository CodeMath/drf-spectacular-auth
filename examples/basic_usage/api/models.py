"""
API 모델 예시

이 파일은 drf-spectacular-auth와 함께 사용되는 API 모델의 예시를 보여줍니다.
"""

from django.contrib.auth.models import User
from django.db import models


class BlogPost(models.Model):
    """
    블로그 포스트 모델 예시
    """

    title = models.CharField(max_length=200, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    is_published = models.BooleanField(default=False, verbose_name="게시 여부")

    class Meta:
        verbose_name = "블로그 포스트"
        verbose_name_plural = "블로그 포스트들"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Comment(models.Model):
    """
    댓글 모델 예시
    """

    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="포스트",
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")

    class Meta:
        verbose_name = "댓글"
        verbose_name_plural = "댓글들"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.post.title}에 대한 {self.author.username}의 댓글"
