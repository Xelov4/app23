#!/bin/bash
# Script pour le renouvellement automatique des certificats SSL

# Renouveler les certificats avec Certbot
sudo certbot renew --quiet --no-self-upgrade

# Copier les certificats renouvelés
cp /etc/letsencrypt/live/video-ia.net/fullchain.pem /root/app23/certs/
cp /etc/letsencrypt/live/video-ia.net/privkey.pem /root/app23/certs/
chmod 644 /root/app23/certs/fullchain.pem
chmod 600 /root/app23/certs/privkey.pem

# Redémarrer Nginx
systemctl reload nginx
