#!/bin/bash

# Script pour mettre à jour les liens symboliques de Nginx
set -e

echo "=== Mise à jour des liens symboliques Nginx pour video-ia.net ==="

# Répertoire courant
APP_DIR=$(pwd)

# Vérifier que le fichier de configuration existe
if [ ! -f "$APP_DIR/nginx-config/video-ia.net" ]; then
  echo "Erreur: Le fichier de configuration Nginx n'existe pas: $APP_DIR/nginx-config/video-ia.net"
  exit 1
fi

# Supprimer les anciens liens s'ils existent
echo "Suppression des anciens liens symboliques..."
if [ -f "/etc/nginx/sites-enabled/video-ia.net" ]; then
  sudo rm -f /etc/nginx/sites-enabled/video-ia.net
fi

if [ -f "/etc/nginx/sites-available/video-ia.net" ] && [ ! -L "/etc/nginx/sites-available/video-ia.net" ]; then
  sudo rm -f /etc/nginx/sites-available/video-ia.net
fi

# Créer de nouveaux liens symboliques
echo "Création des nouveaux liens symboliques..."
sudo ln -sf "$APP_DIR/nginx-config/video-ia.net" /etc/nginx/sites-available/video-ia.net
sudo ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/

# Tester la configuration Nginx
echo "Test de la configuration Nginx..."
if sudo nginx -t; then
  echo "Configuration Nginx valide."
  
  # Redémarrer Nginx
  echo "Redémarrage de Nginx..."
  sudo systemctl restart nginx
  echo "Nginx redémarré avec succès."
else
  echo "Erreur dans la configuration Nginx. Nginx n'a pas été redémarré."
  exit 1
fi

echo "=== Mise à jour des liens symboliques terminée avec succès ===" 