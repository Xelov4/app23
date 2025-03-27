#!/bin/bash

# Script de déploiement pour video-ia.net
set -e

echo "=== Déploiement de video-ia.net ==="
echo "$(date)"
echo

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "Erreur: Vous devez être dans le répertoire du projet"
  exit 1
fi

# Créer le répertoire pour les logs
echo "Création du répertoire de logs..."
mkdir -p /root/logs

# Mise à jour du code (si utilisation de git)
if [ -d ".git" ]; then
  echo "Mise à jour du code depuis le dépôt git..."
  git pull
fi

# Installation des dépendances
echo "Installation des dépendances..."
npm ci

# Génération Prisma
echo "Génération des types Prisma..."
npx prisma generate

# Construction de l'application
echo "Construction de l'application..."
npm run build

# Copie de la configuration Nginx
echo "Copie de la configuration Nginx..."
if [ -f "/root/nginx-configs/video-ia.net.conf" ]; then
  sudo cp /root/nginx-configs/video-ia.net.conf /etc/nginx/sites-available/video-ia.net
  
  # Vérifier si le lien symbolique existe déjà
  if [ ! -f "/etc/nginx/sites-enabled/video-ia.net" ]; then
    sudo ln -s /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
  fi
  
  # Tester la configuration Nginx
  echo "Test de la configuration Nginx..."
  sudo nginx -t
  
  # Redémarrer Nginx
  echo "Redémarrage de Nginx..."
  sudo systemctl restart nginx
fi

# Démarrer l'application avec PM2
echo "Démarrage de l'application avec PM2..."
if pm2 list | grep -q 'video-ia.net'; then
  pm2 reload video-ia.net
else
  pm2 start ecosystem.config.js
fi

# Sauvegarde de la configuration PM2
echo "Sauvegarde de la configuration PM2..."
pm2 save

echo
echo "=== Déploiement terminé avec succès ==="
echo "Application accessible sur: http://video-ia.net"
echo
echo "Pour activer le SSL, exécutez:"
echo "sudo certbot --nginx -d video-ia.net -d www.video-ia.net"
echo 