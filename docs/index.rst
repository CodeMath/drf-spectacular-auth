DRF Spectacular Auth Documentation
===================================

🔐 **Simple Authentication UI for DRF Spectacular with AWS Cognito support**

.. image:: https://badge.fury.io/py/drf-spectacular-auth.svg
   :target: https://badge.fury.io/py/drf-spectacular-auth
   :alt: PyPI version

.. image:: https://img.shields.io/pypi/pyversions/drf-spectacular-auth.svg
   :target: https://pypi.org/project/drf-spectacular-auth/
   :alt: Python

.. image:: https://img.shields.io/badge/django-3.2%2B-blue.svg
   :target: https://www.djangoproject.com/
   :alt: Django

.. image:: https://img.shields.io/badge/license-MIT-green.svg
   :target: https://github.com/CodeMath/drf-spectacular-auth/blob/main/LICENSE
   :alt: License

A Django package that adds a clean, simple authentication panel to your DRF Spectacular (Swagger UI) documentation, 
with built-in support for AWS Cognito and sessionStorage token management.

Features
--------

✨ **Key Features**

* 🔐 **Simple & Secure**: SessionStorage-based token management with CSRF protection
* 🎨 **Clean UI**: Modern authentication panel that integrates seamlessly with Swagger UI  
* 🛡️ **AWS Cognito Support**: Built-in integration with AWS Cognito User Pools
* 📋 **Smart Token Management**: Client-side sessionStorage with manual token copy option
* 🎯 **Auto Authorization**: Automatically attempts to populate Swagger UI authorization headers
* 🎨 **Customizable**: Flexible theming and positioning options
* 🌍 **i18n Ready**: Multi-language support (Korean, English, Japanese)
* 🔧 **Extensible**: Plugin system for additional authentication providers
* 📦 **Easy Integration**: Minimal setup with sensible defaults
* ⚡ **Production Ready**: Stable, maintainable codebase focused on reliability

Quick Start
-----------

Installation::

    pip install drf-spectacular-auth

Basic Setup::

    # settings.py
    INSTALLED_APPS = [
        'drf_spectacular_auth',  # Add before 'drf_spectacular'
        'drf_spectacular',
        # ... your other apps
    ]

    DRF_SPECTACULAR_AUTH = {
        'COGNITO_REGION': 'your-aws-region',
        'COGNITO_CLIENT_ID': 'your-cognito-client-id',
        'AUTO_AUTHORIZE': True,
    }

    # urls.py
    from drf_spectacular_auth.views import SpectacularAuthSwaggerView

    urlpatterns = [
        path('api/auth/', include('drf_spectacular_auth.urls')),
        path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    ]

That's it! 🎉 Your Swagger UI now has an authentication panel.

Table of Contents
-----------------

.. toctree::
   :maxdepth: 2
   :caption: User Guide

   installation
   quickstart
   configuration
   customization
   examples

.. toctree::
   :maxdepth: 2
   :caption: Advanced

   architecture
   providers
   api_reference
   troubleshooting

.. toctree::
   :maxdepth: 1
   :caption: Development

   contributing
   changelog

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`