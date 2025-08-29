from django.apps import AppConfig


class DrfSpectacularAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'drf_spectacular_auth'
    verbose_name = 'DRF Spectacular Auth'

    def ready(self):
        # Import settings to ensure they're loaded
        from . import conf  # noqa