#!/bin/bash

# Variables
BACKUP_DIR="/root/www.video-ia.net/backups"
DB_FILE="/root/www.video-ia.net/prisma/dev.db"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
MAX_BACKUPS=7
LOG_FILE="/var/log/video-ia-backup.log"

# Fonction de journalisation
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

# Journaliser le début de la sauvegarde
log "Début de la sauvegarde de la base de données"

# Vérifier si le fichier de base de données existe
if [ ! -f "$DB_FILE" ]; then
    log "ERREUR: Le fichier de base de données $DB_FILE n'existe pas"
    exit 1
fi

# Créer la sauvegarde
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.db"
cp "$DB_FILE" "$BACKUP_FILE"

# Vérifier si la sauvegarde a réussi
if [ $? -eq 0 ]; then
    log "Sauvegarde réussie: $BACKUP_FILE"
else
    log "ERREUR: Échec de la sauvegarde"
    exit 1
fi

# Compresser la sauvegarde
gzip "$BACKUP_FILE"
if [ $? -eq 0 ]; then
    log "Compression réussie: $BACKUP_FILE.gz"
else
    log "ERREUR: Échec de la compression"
fi

# Supprimer les anciennes sauvegardes si nécessaire
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/db_backup_*.gz 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
    OLD_BACKUPS=$(ls -1t $BACKUP_DIR/db_backup_*.gz | tail -n $(($BACKUP_COUNT - $MAX_BACKUPS)))
    for OLD_BACKUP in $OLD_BACKUPS; do
        rm "$OLD_BACKUP"
        log "Suppression d'une ancienne sauvegarde: $OLD_BACKUP"
    done
fi

# Journaliser la fin de la sauvegarde
log "Fin de la sauvegarde de la base de données"
log "------------------------------------"

exit 0 