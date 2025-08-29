"""
Pytest configuration for drf-spectacular-auth
"""
import os
import sys
import django
from django.conf import settings

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings before any imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tests.settings')

# Setup Django
if not settings.configured:
    django.setup()