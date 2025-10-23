#!/bin/sh
set -e

# default to development
DJANGO_ENV=${DJANGO_ENV:-development}

echo "Entrypoint: DJANGO_ENV=$DJANGO_ENV"

echo "Waiting for database..."
until python manage.py migrate --noinput; do
  >&2 echo "postgres is unavailable - sleeping"
  sleep 2
done
>&2 echo "Postgres up - continuing"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# create superuser non-interactively if env vars provided
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  echo "Creating superuser if it does not exist..."
  python manage.py shell <<'PY'
from django.contrib.auth import get_user_model, models
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
else:
    print("Superuser exists")
PY
fi

# if production you might start gunicorn; for now we keep dev server to match your request
if [ "${DJANGO_ENV}" = "production" ]; then
  echo "Starting gunicorn..."
  exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
else
  echo "Starting Django dev server on 0.0.0.0:8000"
  exec python manage.py runserver 0.0.0.0:8000
fi
