#!/bin/bash

# Script pour configurer SSL proprement
set -e

echo "=== Configuration SSL pour video-ia.net ==="
echo "$(date)"
echo

# Répertoire courant
APP_DIR=$(pwd)

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "Erreur: Vous devez être dans le répertoire du projet"
  exit 1
fi

# S'assurer que les répertoires nécessaires existent
mkdir -p certs nginx-config

# 1. Vérifier si Certbot est installé
if ! command -v certbot &> /dev/null; then
    echo "Certbot n'est pas installé. Installation en cours..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 2. Basculer temporairement vers la configuration HTTP pour la validation
echo "Configuration temporaire en HTTP pour validation de domaine..."
cat > nginx-config/video-ia.net << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name video-ia.net www.video-ia.net;
    
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

# Appliquer la configuration temporaire
echo "Application de la configuration temporaire..."
sudo ln -sf $APP_DIR/nginx-config/video-ia.net /etc/nginx/sites-available/video-ia.net
if [ ! -f "/etc/nginx/sites-enabled/video-ia.net" ]; then
    sudo ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
fi
sudo nginx -t && sudo systemctl reload nginx

# 3. Obtenir le certificat avec Certbot
echo "Obtention du certificat SSL avec Certbot..."
sudo certbot certonly --webroot -w /root/app23/public -d video-ia.net -d www.video-ia.net --agree-tos --email admin@video-ia.net --non-interactive

# 4. Copier les certificats dans le dossier local
echo "Copie des certificats SSL..."
sudo cp /etc/letsencrypt/live/video-ia.net/fullchain.pem $APP_DIR/certs/
sudo cp /etc/letsencrypt/live/video-ia.net/privkey.pem $APP_DIR/certs/
sudo chmod 644 $APP_DIR/certs/fullchain.pem
sudo chmod 600 $APP_DIR/certs/privkey.pem

# 5. Reconfigurer Nginx avec HTTPS
echo "Configuration de Nginx avec HTTPS..."
cat > nginx-config/video-ia.net << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name video-ia.net www.video-ia.net;
    
    # Redirection de HTTP vers HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name video-ia.net www.video-ia.net;
    
    # Configuration SSL avec les certificats locaux
    ssl_certificate /root/app23/certs/fullchain.pem;
    ssl_certificate_key /root/app23/certs/privkey.pem;
    
    # Paramètres SSL recommandés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1h;
    ssl_session_tickets off;
    
    # Entêtes HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Autres entêtes de sécurité
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
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

# Appliquer la nouvelle configuration
echo "Application de la configuration HTTPS..."
sudo nginx -t && sudo systemctl reload nginx

# 6. Configurer le renouvellement automatique
echo "Configuration du renouvellement automatique des certificats..."
cat > $APP_DIR/cron-renew-ssl.sh << 'EOF'
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
EOF

chmod +x $APP_DIR/cron-renew-ssl.sh

# Ajouter la tâche cron pour le renouvellement automatique (sans dupliquer)
if ! (crontab -l 2>/dev/null | grep -q "cron-renew-ssl.sh"); then
    (crontab -l 2>/dev/null; echo "15 3 * * * $APP_DIR/cron-renew-ssl.sh >> $APP_DIR/logs/renew-ssl.log 2>&1") | crontab -
    echo "Tâche cron ajoutée pour le renouvellement automatique des certificats."
else
    echo "Tâche cron pour le renouvellement des certificats déjà configurée."
fi

echo
echo "=== Configuration SSL terminée avec succès ==="
echo "Le site est maintenant accessible en HTTPS: https://video-ia.net"
echo "Les certificats seront renouvelés automatiquement avant leur expiration."
echo "Certificats valides jusqu'à: $(openssl x509 -in $APP_DIR/certs/fullchain.pem -noout -enddate | cut -d= -f2)"
echo 