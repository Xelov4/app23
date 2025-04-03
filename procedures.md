# Procédures de maintenance pour video-ia.net

## Procédure 1 : Clean du server et des app Next

Cette procédure permet de nettoyer complètement le serveur et l'application Next.js :

### Préparation
1. Vérifier l'espace disque avant le nettoyage :
   ```bash
   df -h
   ```

2. Sauvegarder les fichiers de configuration importants :
   ```bash
   # Créer un dossier de backup avec date
   mkdir -p backups/$(date +%Y%m%d)
   
   # Sauvegarder les fichiers de configuration essentiels
   cp .env* backups/$(date +%Y%m%d)/ 2>/dev/null
   cp next.config.js backups/$(date +%Y%m%d)/ 2>/dev/null
   cp ecosystem.config.js backups/$(date +%Y%m%d)/ 2>/dev/null
   cp package.json backups/$(date +%Y%m%d)/ 2>/dev/null
   ```

### Arrêt et nettoyage des processus
1. Lister les processus Node.js en cours d'exécution :
   ```bash
   ps aux | grep node
   ```

2. Arrêter toutes les applications PM2 :
   ```bash
   pm2 stop all
   ```

3. Supprimer toutes les applications PM2 :
   ```bash
   pm2 delete all
   ```

4. Tuer le daemon PM2 :
   ```bash
   pm2 kill
   ```

5. Vérifier et tuer les processus Node.js restants (si nécessaire) :
   ```bash
   # Identifier les processus Node.js restants
   ps aux | grep node
   
   # Tuer les processus restants
   pkill -f node
   ```
   
   > Note: Vous pouvez également utiliser le script `cleanup.sh` qui automatise cette partie du nettoyage.

### Nettoyage des fichiers
1. Nettoyer le cache npm :
   ```bash
   npm cache clean --force
   ```

2. Supprimer les dépendances Node.js :
   ```bash
   rm -rf node_modules
   ```

3. Supprimer le dossier de build Next.js :
   ```bash
   rm -rf .next
   ```

4. Supprimer les fichiers temporaires :
   ```bash
   rm -rf .cache tmp
   ```

5. Nettoyer les journaux :
   ```bash
   # Vider les journaux PM2
   pm2 flush
   
   # Optionnel : Nettoyer les anciens fichiers de logs
   find logs/ -type f -name "*.log" -mtime +30 -delete
   ```

6. Vider les caches système (si vous avez les droits administrateur) :
   ```bash
   # Nettoyer le cache système (Ubuntu/Debian)
   apt-get clean
   ```

### Vérification
1. Vérifier l'espace disque après nettoyage :
   ```bash
   df -h
   ```

## Procédure 2 : Reconstruction de l'application

Cette procédure permet de reconstruire l'application après le nettoyage :

1. Installer les dépendances :
   ```bash
   npm install
   # ou avec un verrouillage plus strict des versions
   npm ci
   ```

2. Générer les types Prisma si nécessaire :
   ```bash
   npm run db:generate
   ```

3. Construire l'application :
   ```bash
   npm run build
   ```

4. Redémarrer l'application avec PM2 en utilisant la configuration définie :
   ```bash
   # Utiliser le fichier de configuration ecosystem.config.js
   pm2 start ecosystem.config.js
   ```

5. Vérifier que l'application est bien démarrée :
   ```bash
   pm2 status
   ```

6. Sauvegarder la configuration PM2 :
   ```bash
   pm2 save
   ```

7. Configurer le démarrage automatique de PM2 (si ce n'est pas déjà fait) :
   ```bash
   pm2 startup
   ```

## Notes importantes
- Exécutez ces commandes depuis le répertoire racine de l'application (`/root/app23`)
- Vérifiez toujours que vous êtes dans le bon répertoire avant d'exécuter les commandes de suppression
- Les scripts de maintenance comme `health-check.sh`, `restart.sh` et `cleanup.sh` sont disponibles pour automatiser certaines tâches
- Pour redéployer complètement, vous pouvez utiliser le script `deploy.sh` ou `deploy-local.sh`