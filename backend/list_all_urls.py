import os
import django
from django.conf import settings
from django.urls import get_resolver, URLResolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

resolver = get_resolver()

def print_urls(resolver, prefix=''):
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLResolver):
             print_urls(pattern, prefix + str(pattern.pattern))
        else:
            print(prefix + str(pattern.pattern))

print_urls(resolver)
