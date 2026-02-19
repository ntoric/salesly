#!/bin/sh


# echo "Waiting for postgres..."
# while ! nc -z $SQL_HOST $SQL_PORT; do
#   sleep 0.1
# done
# echo "PostgreSQL started"

echo "Running Migrations..."
python manage.py migrate --noinput

echo "Creating Superuser..."
# Idempotent superuser creation
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
email = '$DJANGO_SUPERUSER_EMAIL'
password = '$DJANGO_SUPERUSER_PASSWORD'
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
    print(f"Superuser {email} created.")
else:
    print(f"Superuser {email} already exists.")
EOF

exec "$@"
