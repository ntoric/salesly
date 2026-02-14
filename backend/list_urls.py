import os
import django
from django.conf import settings
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

resolver = get_resolver()
for pattern in resolver.url_patterns:
    if hasattr(pattern, 'url_patterns'):
        for sub_pattern in pattern.url_patterns:
            print(sub_pattern)
    else:
        print(pattern)
