# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2025-08-29

### 🚨 Critical Bug Fix
- **Fixed JavaScript functionality** - Authentication form now works properly
- **Enhanced template processing** - Django template variables in JavaScript now render correctly
- **Improved architecture** - Override SpectacularSwaggerView.get() method for better integration

### 🔧 Technical Improvements
- **Direct Response data injection** - Auth context added directly to Response data dictionary
- **Better drf-spectacular integration** - Follows drf-spectacular's architectural patterns
- **Template variable processing** - Fixed CONFIG object in JavaScript with proper variable substitution

### ✅ Fixed
- Login form functionality completely broken due to template variable processing issues
- JavaScript CONFIG object receiving unprocessed Django template variables
- Event handlers not attaching due to malformed JavaScript configuration
- CSRF token, login URL, and other critical variables not being substituted

### 🏗️ Architecture
- **Enhanced SpectacularSwaggerView**: Now overrides get() method instead of get_context_data()
- **Direct data injection**: Auth context added directly to Response data for better template access
- **Improved context flow**: JavaScript template rendering with proper variable substitution

## [1.2.0] - 2025-08-29

### 🎯 Major Improvements
- **Fixed topbar issue** - Resolved unwanted UI overlays in Swagger UI
- **Proper template inheritance** - Now uses correct `{% extends 'drf_spectacular/swagger_ui.html' %}`
- **Major code cleanup** - Removed 800+ lines of unnecessary code
- **Architecture simplification** - 50% reduction in total files

### ✅ Fixed
- Template inheritance conflicts causing topbar display issues
- JavaScript injection complexity causing loading problems
- Template context propagation issues
- Complex template loading dependencies

### 🗑️ Removed
- `simple_swagger_ui.html` - Unused template with JavaScript injection approach
- `swagger_ui_enhanced.html` - Alternative template implementation
- `swagger_ui.js` - Standalone JavaScript file
- `auth_panel.html` - Integrated into main template
- `views_simple.py` - Alternative view implementation
- Various test and validation scripts (`test_simplified.py`, `validate_approach.py`)
- Temporary documentation (`USAGE_SIMPLIFIED.md`)
- Build artifacts and unnecessary configuration files

### ⚡ Performance
- Faster template loading due to proper inheritance
- Reduced bundle size with fewer files
- Cleaner JavaScript execution without complex injection
- Improved build times

### 🏗️ Architecture
- **Templates**: Simplified from 7 templates to 2 core templates
- **Views**: Cleaned up imports and removed unused JSON handling
- **Project Structure**: Cleaner, more maintainable codebase

## [1.1.1] - 2025-08-29

### 🚀 Features
- Enhanced template inheritance approach
- Improved JavaScript dynamic injection system

### 🔧 Technical Improvements  
- Better template context handling
- Optimized authentication panel rendering

## [1.1.0] - 2025-08-29

### 🎉 Major Release - Enhanced Architecture

### ✨ New Features
- **Multi-tier integration strategy** inspired by django-auth-adfs patterns
- **Django Authentication Backend** - Full Django user integration
- **Authentication Middleware** - Automatic auth handling for Spectacular views
- **Enhanced AWS Cognito support** - Private client support with CLIENT_SECRET
- **Comprehensive examples** - Complete working examples with different integration levels

### 🔐 Authentication Enhancements
- **SECRET_HASH calculation** for AWS Cognito private clients
- **Token verification** with comprehensive error handling
- **User management** - Auto-create users from Cognito authentication
- **Session integration** - Seamless Django session handling

### 🏗️ Architecture Improvements
- **SpectacularAuthBackend** - Django authentication backend
- **SpectacularAuthMiddleware** - Automatic authentication middleware
- **Enhanced provider system** - Better extensibility for auth providers
- **Hook system** - Pre/post login/logout hooks for custom logic

### 📦 Package Improvements
- **Comprehensive testing** - Full test suite with Django integration
- **Example projects** - Real-world usage examples
- **Better documentation** - Detailed setup and configuration guides
- **CI/CD improvements** - Enhanced GitHub Actions workflows

### 🐛 Bug Fixes
- Template inheritance issues resolved
- Context propagation problems fixed
- Django compatibility issues addressed
- Code quality improvements (black, isort, flake8)

## [1.0.6] - 2025-08-29

### 🔧 Fixes
- Template inheritance context propagation issues
- Fixed `{% block head %}` and `{% block body %}` rendering problems
- Resolved authentication panel rendering in inherited templates

### 📝 Documentation
- Updated template usage examples
- Enhanced troubleshooting guide

## [1.0.5] - 2025-08-29

### 🐛 Bug Fixes
- HTML rendering issues in Swagger UI template
- Template block inheritance problems
- Authentication panel display issues

### 🔧 Improvements
- Better template context handling
- Improved error handling in template rendering

## [1.0.4] - 2025-08-29

### 🔧 Fixes
- GitHub Actions test failures resolved
- Django compatibility matrix updated
- Dependency conflicts resolved

### ⚙️ CI/CD
- Updated test matrix to avoid Django/DRF compatibility issues
- Removed problematic Django 4.0/4.1 from test matrix
- Enhanced error handling in deployment pipeline

## [1.0.3] - 2025-08-29

### 🔐 Security & Authentication
- **AWS Cognito Client Secret support** - Added support for private clients
- **SECRET_HASH calculation** - Automatic calculation for enhanced security
- **Enhanced authentication flow** - Better error handling and validation

### 🎨 UI Improvements
- **Multi-language support** - Korean, English, Japanese
- **Improved theming** - Better color customization options
- **Enhanced authentication panel** - Better UX and error messaging

### 🐛 Bug Fixes
- Code formatting issues (black, isort, flake8)
- Template inheritance problems
- Authentication provider error handling

### 📦 Package Management
- Automated PyPI deployment via GitHub Actions
- Enhanced testing workflows
- Better version management

## [1.0.2] - 2025-08-29

### 🔧 Maintenance
- Code quality improvements
- Enhanced testing infrastructure
- Better GitHub Actions integration

## [1.0.1] - 2025-08-29

### 🐛 Bug Fixes
- Initial bug fixes and improvements
- Enhanced stability and error handling

## [1.0.0] - 2025-08-29

### 🎉 Initial Release

### ✨ Core Features
- **AWS Cognito Integration** - Full support for AWS Cognito User Pools
- **Beautiful Authentication UI** - Clean, modern panel for Swagger UI
- **Token Management** - Easy token copying with clipboard integration
- **Auto Authorization** - Automatic Swagger UI header population
- **Customizable Theming** - Flexible colors, positioning, and styling
- **Multi-language Support** - Korean, English, Japanese localization
- **Easy Integration** - Minimal setup with sensible defaults

### 🏗️ Architecture
- **Extensible Provider System** - Plugin architecture for auth providers
- **Django Integration** - Seamless integration with Django projects
- **DRF Spectacular Compatibility** - Built specifically for drf-spectacular
- **Configuration Management** - Comprehensive settings system

### 📦 Package Features
- **PyPI Distribution** - Available on Python Package Index
- **Documentation** - Comprehensive README and examples
- **Testing** - Full test suite with pytest
- **Code Quality** - Black, isort, flake8 compliance

---

## Version Support

- **Python**: 3.8, 3.9, 3.10, 3.11, 3.12
- **Django**: 3.2, 4.0, 4.1, 4.2, 5.0
- **Django REST Framework**: 3.12+
- **drf-spectacular**: 0.25.0+

## Migration Guide

### Upgrading to v1.2.0
1. Update package: `pip install --upgrade drf-spectacular-auth`
2. No code changes required - topbar issues automatically resolved
3. Remove any custom workarounds for template conflicts
4. Test your integration to ensure everything works smoothly

### Upgrading to v1.1.0
1. Update package and review new architecture options
2. Consider migrating to middleware or backend integration for enhanced features
3. Update configuration for new settings if needed
4. Test authentication flows thoroughly

### Upgrading from pre-1.0
1. Review breaking changes in configuration format
2. Update URL patterns and view imports
3. Test authentication provider configuration
4. Verify template customizations still work