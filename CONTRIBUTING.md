# Contributing to DRF Spectacular Auth

We love your input! We want to make contributing to DRF Spectacular Auth as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
git clone https://github.com/yourusername/drf-spectacular-auth.git
cd drf-spectacular-auth
pip install -e ".[dev]"
```

## Testing

Run the test suite:

```bash
DJANGO_SETTINGS_MODULE=tests.settings python -m pytest tests/ -v
```

Run tests with coverage:

```bash
DJANGO_SETTINGS_MODULE=tests.settings python -m pytest tests/ --cov=drf_spectacular_auth
```

## Code Style

We use:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting

Run all checks:

```bash
black .
isort .
flake8
```

## Commit Message Guidelines

We follow the conventional commits specification:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only changes
- `style:` changes that do not affect the meaning of the code
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding missing tests or correcting existing tests
- `chore:` changes to the build process or auxiliary tools

## Adding New Authentication Providers

1. Create a new provider class inheriting from `AuthProvider`
2. Implement required methods: `authenticate()` and `get_user_info()`
3. Add comprehensive tests
4. Update documentation with configuration examples
5. Add to the provider registry system

Example:

```python
from drf_spectacular_auth.providers.base import AuthProvider

class CustomAuthProvider(AuthProvider):
    def authenticate(self, credentials):
        # Your implementation
        pass
    
    def get_user_info(self, token):
        # Your implementation  
        pass
```

## Adding New Languages

1. Add language code to `SUPPORTED_LANGUAGES` in settings
2. Add translations to the JavaScript `MESSAGES` object
3. Test the UI with the new language
4. Update documentation

## Issue Reporting

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.