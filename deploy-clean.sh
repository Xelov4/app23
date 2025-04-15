#!/bin/bash

# Script de déploiement propre pour video-ia.net
set -e

echo "=== Déploiement propre de video-ia.net ==="
echo "$(date)"
echo

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "Erreur: Vous devez être dans le répertoire du projet"
  exit 1
fi

# Nettoyage complet
echo "Nettoyage des caches et répertoires temporaires..."
rm -rf .next node_modules .cache public/images/.cache

# S'assurer que les répertoires nécessaires existent
mkdir -p logs nginx-config certs

# Arrêter les anciens processus PM2
echo "Arrêt des processus PM2 existants..."
pm2 stop video-ia.net || true
pm2 delete video-ia.net || true

# Installation des dépendances
echo "Installation des dépendances..."
npm install

# Vérification des permissions de la base de données
echo "Vérification des permissions de la base de données..."
chmod 644 prisma/dev.db || true
ls -la prisma/dev.db

# Génération Prisma
echo "Génération des types Prisma..."
npx prisma generate

# Configuration HTTP simple pour Nginx (sans SSL) pendant le développement
echo "Configuration de Nginx en mode HTTP simple..."
cat > nginx-config/video-ia.net << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name video-ia.net www.video-ia.net localhost;
    
    # Racine du site
    root /root/app23/public;
    
    # Journaux
    access_log /root/app23/logs/video-ia.access.log;
    error_log /root/app23/logs/video-ia.error.log;
    
    # Configuration du proxy vers l'application Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
    
    # Configuration du cache pour les ressources statiques
    location /_next/static/ {
        proxy_pass http://localhost:3000/_next/static/;
        proxy_cache_valid 200 302 60d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static/ {
        proxy_pass http://localhost:3000/static/;
        proxy_cache_valid 200 302 60d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

# Mettre à jour les liens symboliques Nginx
echo "Mise à jour des liens symboliques Nginx..."
if [ -f "/etc/nginx/sites-enabled/video-ia.net" ]; then
  sudo rm -f /etc/nginx/sites-enabled/video-ia.net
fi
sudo ln -sf $(pwd)/nginx-config/video-ia.net /etc/nginx/sites-available/video-ia.net
sudo ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/

# Tester la configuration Nginx
echo "Test de la configuration Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Construction de l'application
echo "Construction de l'application..."
NODE_ENV=production npm run build

# Démarrer l'application avec PM2
echo "Démarrage de l'application avec PM2..."
pm2 start ecosystem.config.js

# Sauvegarde de la configuration PM2
echo "Sauvegarde de la configuration PM2..."
pm2 save

echo
echo "=== Déploiement terminé avec succès ==="
echo "Application accessible sur: http://video-ia.net"
echo "Pour configurer SSL plus tard, utilisez: ./setup-ssl.sh"
echo 