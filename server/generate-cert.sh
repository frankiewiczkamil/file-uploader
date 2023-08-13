#!/bin/bash

CERT_FOLDER=${1:-certs}

if [ ! -d "$CERT_FOLDER" ]; then
  mkdir "$CERT_FOLDER"
fi

if [ ! -f "$CERT_FOLDER/key.pem" ] || [ ! -f "$CERT_FOLDER/cert.pem" ]; then
  echo "Generating self-signed SSL certificate..."
  openssl req -x509 -newkey rsa:4096 -keyout "$CERT_FOLDER/key.pem" -out "$CERT_FOLDER/cert.pem" -days 365 \
    -nodes -subj "/O=bytd/CN=localhost"
  echo "Certificate generated."
else
  echo "Certificates already exist."
fi
