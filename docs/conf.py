# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

import os
import sys

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
sys.path.insert(0, os.path.abspath('..'))

# Django setup for autodoc - disabled for now to avoid missing settings.py
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tests.settings')
# django.setup()

# -- Project information -----------------------------------------------------

project = 'DRF Spectacular Auth'
copyright = '2024, CodeMath'
author = 'CodeMath'
release = '1.4.2'
version = '1.4.2'

# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
    'sphinx.ext.intersphinx',
    'sphinx.ext.coverage',
    'sphinx.ext.todo',
    'sphinx.ext.githubpages',
    'myst_parser',
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# The suffix(es) of source filenames.
source_suffix = {
    '.rst': None,
    '.md': None,
}

# The master document (index file)
master_doc = 'index'

# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

# Theme options
html_theme_options = {
    'canonical_url': 'https://drf-spectacular-auth.readthedocs.io/',
    'analytics_id': '',
    'logo_only': False,
    'display_version': True,
    'prev_next_buttons_location': 'bottom',
    'style_external_links': True,
    'vcs_pageview_mode': '',
    'style_nav_header_background': '#2980B9',
    # Toc options
    'collapse_navigation': True,
    'sticky_navigation': True,
    'navigation_depth': 4,
    'includehidden': True,
    'titles_only': False
}

# Custom sidebar
html_sidebars = {
    '**': [
        'relations.html',  # needs 'show_related': True theme option to display
        'searchbox.html',
    ]
}

# -- Extension configuration -------------------------------------------------

# Napoleon settings
napoleon_google_docstring = True
napoleon_numpy_docstring = True
napoleon_include_init_with_doc = False
napoleon_include_private_with_doc = False
napoleon_include_special_with_doc = True
napoleon_use_admonition_for_examples = False
napoleon_use_admonition_for_notes = False
napoleon_use_admonition_for_references = False
napoleon_use_ivar = False
napoleon_use_param = True
napoleon_use_rtype = True
napoleon_type_aliases = None
napoleon_attr_annotations = True

# Autodoc settings
autodoc_default_options = {
    'members': True,
    'member-order': 'bysource',
    'special-members': '__init__',
    'undoc-members': True,
    'exclude-members': '__weakref__'
}

# Intersphinx configuration
intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'django': ('https://docs.djangoproject.com/en/5.2/', None),
    'boto3': ('https://boto3.amazonaws.com/v1/documentation/api/latest/', None),
}

# Todo extension
todo_include_todos = True

# MyST Parser configuration
myst_enable_extensions = [
    "deflist",
    "tasklist",
    "colon_fence",
    "attrs_inline",
    "attrs_block",
]

# GitHub Pages
html_baseurl = 'https://drf-spectacular-auth.readthedocs.io/'

# HTML context
html_context = {
    "display_github": True,
    "github_user": "CodeMath",
    "github_repo": "drf-spectacular-auth",
    "github_version": "main",
    "conf_py_path": "/docs/",
}

# Output file base name for HTML help builder.
htmlhelp_basename = 'drfspectacularauthdoc'

# -- Options for LaTeX output ------------------------------------------------

latex_elements = {
    # The paper size ('letterpaper' or 'a4paper').
    'papersize': 'letterpaper',
    # The font size ('10pt', '11pt' or '12pt').
    'pointsize': '10pt',
    # Additional stuff for the LaTeX preamble.
    'preamble': '',
    # Latex figure (float) alignment
    'figure_align': 'htbp',
}

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
latex_documents = [
    (master_doc, 'drf-spectacular-auth.tex', 'DRF Spectacular Auth Documentation',
     'CodeMath', 'manual'),
]

# -- Options for manual page output ------------------------------------------

# One entry per manual page. List of tuples
# (source start file, name, description, authors, manual section).
man_pages = [
    (master_doc, 'drf-spectacular-auth', 'DRF Spectacular Auth Documentation',
     [author], 1)
]

# -- Options for Texinfo output ----------------------------------------------

# Grouping the document tree into Texinfo files. List of tuples
# (source start file, target name, title, author,
#  dir menu entry, description, category)
texinfo_documents = [
    (master_doc, 'DRFSpectacularAuth', 'DRF Spectacular Auth Documentation',
     author, 'DRFSpectacularAuth', 'Simple Authentication UI for DRF Spectacular with AWS Cognito integration.',
     'Miscellaneous'),
]