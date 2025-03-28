#!/bin/bash

# Script de redémarrage rapide pour video-ia.net
set -e

echo "=== Redémarrage rapide de video-ia.net ==="

# Redémarrer PM2
echo "Redémarrage des processus PM2..."
pm2 restart video-ia.net

# Redémarrer Nginx
echo "Redémarrage de Nginx..."
sudo systemctl restart nginx

echo "=== Redémarrage terminé ===" 