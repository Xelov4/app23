#!/bin/bash

# Script de déploiement pour video-ia.net (version localisée)
set -e

echo "=== Déploiement de video-ia.net (version localisée) ==="
echo "$(date)"
echo

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "Erreur: Vous devez être dans le répertoire du projet"
  exit 1
fi

# S'assurer que les répertoires nécessaires existent
mkdir -p logs nginx-config certs

# Arrêter les anciens processus PM2
echo "Arrêt des processus PM2 existants..."
pm2 stop video-ia.net || true
pm2 delete video-ia.net || true

# Installation des dépendances
echo "Installation des dépendances..."
npm ci

# Génération Prisma
echo "Génération des types Prisma..."
npx prisma generate

# Construction de l'application
echo "Construction de l'application..."
rm -rf .next
npm run build

# Appliquer les certificats SSL
echo "Vérification des certificats SSL..."
if [ ! -f "certs/fullchain.pem" ] || [ ! -f "certs/privkey.pem" ]; then
  echo "Attention: Certificats SSL manquants. Utilisation de certificats auto-signés..."
  mkdir -p certs
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/privkey.pem \
    -out certs/fullchain.pem \
    -subj "/CN=video-ia.net" \
    -addext "subjectAltName=DNS:video-ia.net,DNS:www.video-ia.net"
fi

# Lien symbolique Nginx (nécessite des droits root)
echo "Configuration de Nginx..."
if [ -f "/etc/nginx/sites-enabled/video-ia.net" ]; then
  sudo rm -f /etc/nginx/sites-enabled/video-ia.net
fi
sudo ln -sf $(pwd)/nginx-config/video-ia.net /etc/nginx/sites-available/video-ia.net
sudo ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/

# Tester la configuration Nginx
echo "Test de la configuration Nginx..."
sudo nginx -t

# Redémarrer Nginx
echo "Redémarrage de Nginx..."
sudo systemctl restart nginx

# Démarrer l'application avec PM2
echo "Démarrage de l'application avec PM2..."
pm2 start ecosystem.config.js

# Sauvegarde de la configuration PM2
echo "Sauvegarde de la configuration PM2..."
pm2 save

echo
echo "=== Déploiement terminé avec succès ==="
echo "Application accessible sur: https://video-ia.net"
echo 