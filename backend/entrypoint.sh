#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "
import psycopg, os
psycopg.connect(
    dbname=os.environ.get('POSTGRES_DB', 'fpvcompass'),
    user=os.environ.get('POSTGRES_USER', 'fpvcompass'),
    password=os.environ.get('POSTGRES_PASSWORD', ''),
    host=os.environ.get('POSTGRES_HOST', 'postgres'),
    port=os.environ.get('POSTGRES_PORT', '5432'),
)
" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

# Create superuser if env vars are set and user doesn't exist
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '${DJANGO_SUPERUSER_EMAIL:-}', '$DJANGO_SUPERUSER_PASSWORD')
    print('Superuser created.')
else:
    print('Superuser already exists.')
"
fi

exec "$@"
