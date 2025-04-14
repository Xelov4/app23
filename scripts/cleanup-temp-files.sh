#!/bin/bash

# Mode d'exécution (dry-run par défaut)
DRY_RUN=true

# Liste des fichiers temporaires à supprimer
TEMP_FILES=(
    "temp.js"
    "temp2.js"
    "test-file.txt"
    "app/admin/sequencage/page.tsx.bak"
    "ecosystem.config.js.disabled"
    "tools.json"
    "tools_data.json"
    "tools_extract.json"
)

# Liste des fichiers CSV à archiver
CSV_FILES=(
    "testons.csv"
    "testons-clean.csv"
)

# Fonction pour logger les actions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction pour supprimer un fichier
remove_file() {
    local file=$1
    if [ -f "$file" ]; then
        if [ "$DRY_RUN" = true ]; then
            log "Would remove: $file"
        else
            rm "$file"
            log "Removed: $file"
        fi
    else
        log "File not found: $file"
    fi
}

# Fonction pour archiver un fichier
archive_file() {
    local file=$1
    if [ -f "$file" ]; then
        local archive_name="archives/$(basename "$file").$(date '+%Y%m%d').bak"
        if [ "$DRY_RUN" = true ]; then
            log "Would archive: $file to $archive_name"
        else
            mkdir -p archives
            cp "$file" "$archive_name"
            log "Archived: $file to $archive_name"
            rm "$file"
            log "Removed original: $file"
        fi
    else
        log "File not found: $file"
    fi
}

# Traitement des arguments
if [ "$1" = "--execute" ]; then
    DRY_RUN=false
    log "Running in execute mode"
else
    log "Running in dry-run mode"
fi

# Création du répertoire d'archives si nécessaire
if [ "$DRY_RUN" = false ]; then
    mkdir -p archives
fi

# Suppression des fichiers temporaires
for file in "${TEMP_FILES[@]}"; do
    remove_file "$file"
done

# Archivage des fichiers CSV
for file in "${CSV_FILES[@]}"; do
    archive_file "$file"
done

log "Cleanup process completed" 