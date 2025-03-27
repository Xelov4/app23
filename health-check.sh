#!/bin/bash

# Script de vérification de santé pour video-ia.net
# À exécuter périodiquement via cron, par exemple:
# */15 * * * * /root/video-ia.net/health-check.sh >> /root/logs/health-check.log 2>&1

DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "Vérification de santé: $DATE"

# Vérifier si le processus PM2 est en cours d'exécution
if ! pm2 list | grep -q 'video-ia.net'; then
  echo "ERREUR: Le processus PM2 n'est pas en cours d'exécution"
  echo "Tentative de redémarrage..."
  cd /root/video-ia.net
  pm2 start ecosystem.config.js
  pm2 save
else
  echo "PM2: OK"
fi

# Vérifier si Nginx est en cours d'exécution
if ! systemctl is-active --quiet nginx; then
  echo "ERREUR: Nginx n'est pas en cours d'exécution"
  echo "Tentative de redémarrage..."
  systemctl start nginx
else
  echo "Nginx: OK"
fi

# Vérifier si le site est accessible
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "ERREUR: Le site n'est pas accessible (code HTTP: $HTTP_CODE)"
  echo "Tentative de redémarrage de l'application..."
  pm2 reload video-ia.net
else
  echo "Site accessible: OK (code HTTP: $HTTP_CODE)"
fi

# Vérifier l'espace disque disponible
DISK_SPACE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_SPACE" -gt 90 ]; then
  echo "ALERTE: Espace disque critique: $DISK_SPACE%"
else
  echo "Espace disque: OK ($DISK_SPACE%)"
fi

# Vérifier l'utilisation de la mémoire
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEM_USAGE" -gt 90 ]; then
  echo "ALERTE: Utilisation de la mémoire critique: $MEM_USAGE%"
else
  echo "Utilisation de la mémoire: OK ($MEM_USAGE%)"
fi

echo "Vérification terminée"
echo "-----------------------------------" 