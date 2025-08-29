"""
Tests for DRF Spectacular Auth
"""
import os
import django

# Configure Django settings for tests
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tests.settings')
django.setup()