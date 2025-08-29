"""
Django Admin 설정

이 파일은 Django Admin에서 모델을 관리하기 위한 설정입니다.
"""

from django.contrib import admin

from .models import BlogPost, Comment


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """
    블로그 포스트 Admin 설정
    """

    list_display = ["title", "author", "is_published", "created_at"]
    list_filter = ["is_published", "created_at", "author"]
    search_fields = ["title", "content"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("title", "content", "author")}),
        ("게시 설정", {"fields": ("is_published",)}),
        (
            "메타정보",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    댓글 Admin 설정
    """

    list_display = ["post", "author", "content_preview", "created_at"]
    list_filter = ["created_at", "author"]
    search_fields = ["content", "post__title"]
    readonly_fields = ["created_at"]

    def content_preview(self, obj):
        """댓글 내용 미리보기 (50자 제한)"""
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "댓글 내용"
