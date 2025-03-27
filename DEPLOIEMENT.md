# Déploiement de video-ia.net

Ce document détaille la configuration pour déployer l'application video-ia.net sur un VPS avec Nginx et SSL.

## Architecture de déploiement

```
Client <---> Nginx (port 80/443) <---> Next.js (port 3000)
```

## Étapes de déploiement

### 1. Scripts de déploiement automatisé

Pour faciliter le déploiement, nous avons préparé des scripts automatisés:

```bash
# Déploiement complet (installation, build, configuration et démarrage)
./deploy.sh

# Vérification de santé du serveur
./health-check.sh
```

Pour un déploiement manuel, suivez les étapes ci-dessous:

### 2. Construction de l'application

```bash
# Se placer dans le répertoire du projet
cd /root/video-ia.net

# Installer les dépendances
npm ci

# Générer les types Prisma
npx prisma generate

# Construire l'application Next.js
npm run build
```

### 3. Installation et configuration de Nginx

```bash
# Installation des packages nécessaires
apt update && apt install -y nginx certbot python3-certbot-nginx

# Création de la configuration Nginx
nano /etc/nginx/sites-available/video-ia.net
```

Configuration Nginx (après installation du certificat SSL):

```nginx
server {
    listen 80;
    server_name video-ia.net www.video-ia.net;
    
    # Redirection HTTP vers HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name video-ia.net www.video-ia.net;
    
    # Les certificats SSL sont configurés automatiquement par Certbot
    ssl_certificate /etc/letsencrypt/live/video-ia.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/video-ia.net/privkey.pem;
    
    # Paramètres SSL recommandés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Dossier racine pour les fichiers statiques
    root /root/video-ia.net/public;
    
    # Taille max des uploads
    client_max_body_size 20M;
    
    # Compression gzip
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        application/xml+rss
        text/css
        text/javascript
        text/plain
        text/xml;
        
    # Cache pour les fichiers statiques générés par Next.js
    location /_next/static/ {
        alias /root/video-ia.net/.next/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Mise en cache des fichiers statiques
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy vers l'application Next.js
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
        
        # Protection contre les attaques XSS
        add_header X-XSS-Protection "1; mode=block";
        
        # Protection contre le clickjacking
        add_header X-Frame-Options "SAMEORIGIN";
        
        # Protection contre le MIME-sniffing
        add_header X-Content-Type-Options "nosniff";
        
        # Timeout plus élevé pour les requêtes longues
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Activation de la configuration:

```bash
# Créer un lien symbolique vers sites-enabled
ln -s /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/

# Vérifier la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 4. Gestion du processus avec PM2

```bash
# Créer le répertoire pour les logs
mkdir -p /root/logs

# Installation de PM2
npm install -g pm2

# Création du fichier de configuration PM2
nano /root/video-ia.net/ecosystem.config.js
```

Contenu de ecosystem.config.js:

```javascript
module.exports = {
  apps: [
    {
      name: 'video-ia.net',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/video-ia.net',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configuration des logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/logs/video-ia-err.log',
      out_file: '/root/logs/video-ia-out.log',
      merge_logs: true,
      // Gestion des erreurs
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      listen_timeout: 10000
    }
  ]
};
```

Démarrage et configuration de PM2:

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Configurer le démarrage automatique au redémarrage du serveur
pm2 startup
pm2 save
```

### 5. Installation du certificat SSL avec Certbot

```bash
# Obtention et configuration automatique du certificat SSL
certbot --nginx -d video-ia.net -d www.video-ia.net
```

### 6. Surveillance et maintenance

#### Surveillance proactive

Utilisez le script de vérification de santé pour surveiller proactivement le service:

```bash
# Exécution manuelle
./health-check.sh

# Configuration dans cron pour une exécution toutes les 15 minutes
crontab -e
# Ajoutez la ligne suivante:
*/15 * * * * /root/video-ia.net/health-check.sh >> /root/logs/health-check.log 2>&1
```

#### Vérifications manuelles

```bash
# Vérifier l'état de l'application
pm2 status

# Consulter les logs de l'application
pm2 logs video-ia.net

# Vérifier les logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Redémarrage après des mises à jour

```bash
cd /root/video-ia.net
git pull  # Si vous utilisez git pour gérer votre code
npm install
npm run build
pm2 restart video-ia.net
```

## Renouvellement automatique du certificat SSL

Certbot installe automatiquement un timer systemd qui renouvelle les certificats avant leur expiration.

## Sauvegarde du système

### Sauvegarde de la base de données

La base de données SQLite est située dans `prisma/dev.db`. Elle peut être sauvegardée facilement:

```bash
cp /root/video-ia.net/prisma/dev.db /chemin/vers/sauvegarde/video-ia-db-$(date +%Y%m%d).db
```

### Sauvegarde complète du site

```bash
tar -czf /chemin/vers/sauvegarde/video-ia-backup-$(date +%Y%m%d).tar.gz /root/video-ia.net
```

## Optimisations futures

1. Configurer un cache Nginx pour améliorer les performances
2. Ajouter des en-têtes de sécurité supplémentaires (HSTS, CSP, etc.)
3. Mettre en place une surveillance des performances du serveur
4. Configurer des sauvegardes automatiques de la base de données 