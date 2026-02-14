import os
import django
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'merchant@salesly.com'
password = 'password123'

try:
    user = User.objects.get(email=email)
    print(f"User {email} already exists. Updating password...")
    user.set_password(password)
    user.role = 'MERCHANT'
    user.is_staff = False
    user.is_active = True
    user.save()
    print(f"Updated {email} to MERCHANT role with password '{password}'")
except User.DoesNotExist:
    print(f"Creating new merchant user {email}...")
    User.objects.create_user(
        email=email,
        password=password,
        first_name='Merchant',
        last_name='User',
        role='MERCHANT',
        is_active=True
    )
    print(f"Created {email} with password '{password}'")
