# Pull official base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev netcat-openbsd postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Copy entrypoint to system path to avoid volume mount overrides
COPY entrypoint.sh /usr/local/bin/
RUN sed -i 's/\r$//g' /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create a non-root user
RUN adduser --disabled-password --no-create-home django-user
USER django-user

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Run gunicorn
# Bind to 0.0.0.0:8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
