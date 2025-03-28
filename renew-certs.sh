#!/bin/bash

# Script pour renouveler les certificats SSL et les copier dans le dossier de l'application
set -e

echo "=== Renouvellement des certificats SSL pour video-ia.net ==="
echo "$(date)"
echo

# Répertoire courant
APP_DIR=$(pwd)

# Renouveler les certificats avec Certbot
echo "Renouvellement des certificats avec Certbot..."
sudo certbot renew --quiet

# Copier les certificats renouvelés dans le dossier de l'application
echo "Copie des certificats renouvelés..."
sudo cp /etc/letsencrypt/live/video-ia.net*/fullchain.pem $APP_DIR/certs/ 2>/dev/null || \
sudo cp /etc/letsencrypt/live/video-ia.net/fullchain.pem $APP_DIR/certs/
sudo cp /etc/letsencrypt/live/video-ia.net*/privkey.pem $APP_DIR/certs/ 2>/dev/null || \
sudo cp /etc/letsencrypt/live/video-ia.net/privkey.pem $APP_DIR/certs/

# Ajuster les permissions
echo "Ajustement des permissions..."
sudo chmod 644 $APP_DIR/certs/fullchain.pem
sudo chmod 600 $APP_DIR/certs/privkey.pem

# Redémarrer Nginx
echo "Redémarrage de Nginx..."
sudo systemctl restart nginx

echo "=== Renouvellement des certificats terminé avec succès ==="
echo "Certificats valides jusqu'à: $(openssl x509 -in $APP_DIR/certs/fullchain.pem -noout -enddate | cut -d= -f2)"
echo 