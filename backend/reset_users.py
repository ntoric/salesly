import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print("Existing users:")
for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Staff: {u.is_staff}, Active: {u.is_active}")

# Ensure admin@salesly.com exists and has password 'password'
try:
    admin = User.objects.get(email='admin@salesly.com')
    admin.set_password('password')
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.save()
    print("Reset admin@salesly.com password to 'password'")
except User.DoesNotExist:
    User.objects.create_superuser('admin@salesly.com', 'password')
    print("Created admin@salesly.com with password 'password'")

# Ensure user's created account has known password if exists
try:
    user = User.objects.get(email='epsshahid@gmail.com')
    user.set_password('password123')
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print("Reset epsshahid@gmail.com password to 'password123'")
except User.DoesNotExist:
    pass
