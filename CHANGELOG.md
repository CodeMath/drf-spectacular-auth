# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-29

### Added
- Initial release of DRF Spectacular Auth
- AWS Cognito authentication provider with comprehensive error handling
- Beautiful authentication panel for Swagger UI with modern design
- Multi-language support (Korean, English, Japanese)
- Token management with clipboard integration and manual fallback
- Automatic Swagger UI authorization header population
- Configurable themes and positioning options
- Comprehensive test suite with 100% coverage
- Plugin architecture for extensible authentication providers
- TypeScript-compatible JavaScript implementation
- CSRF protection and security best practices

### Features
- **Authentication Panel**: Fixed position panel with login form, status indicator, and user info
- **Token Copy**: One-click token copying with fallback for manual copying
- **Auto-Authorization**: Automatic population of Swagger UI authorization fields
- **Theming**: Customizable colors, fonts, and styling options
- **i18n**: Built-in translations for Korean, English, and Japanese
- **Security**: CSRF protection, secure token storage, and input validation
- **Extensibility**: Provider-based architecture for multiple authentication methods
- **Testing**: Comprehensive test suite with mocking and integration tests

### Technical Details
- Compatible with Django 3.2+ and DRF Spectacular 0.25+
- AWS Cognito User Pool integration with boto3
- Modern JavaScript with clipboard API and fallback methods
- Responsive design with mobile-friendly interface
- Template override system for seamless integration
- Settings-based configuration with sensible defaults