#!/bin/bash

# Mode d'exécution (validate par défaut)
VALIDATE=true

# Liste des fichiers de configuration à consolider
declare -A CONFIG_PAIRS=(
    ["postcss.config.js"]="postcss.config.mjs"
)

# Fonction pour logger les actions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction pour comparer les configurations
compare_configs() {
    local old_file=$1
    local new_file=$2
    
    if [ -f "$old_file" ] && [ -f "$new_file" ]; then
        log "Comparing $old_file with $new_file"
        diff -u "$old_file" "$new_file"
        return $?
    else
        if [ ! -f "$old_file" ]; then
            log "File not found: $old_file"
        fi
        if [ ! -f "$new_file" ]; then
            log "File not found: $new_file"
        fi
        return 1
    fi
}

# Fonction pour consolider les configurations
consolidate_configs() {
    local old_file=$1
    local new_file=$2
    
    if [ -f "$old_file" ]; then
        if [ "$VALIDATE" = true ]; then
            log "Would remove: $old_file (keeping $new_file)"
        else
            rm "$old_file"
            log "Removed: $old_file (keeping $new_file)"
        fi
    else
        log "File not found: $old_file"
    fi
}

# Traitement des arguments
if [ "$1" = "--apply" ]; then
    VALIDATE=false
    log "Running in apply mode"
else
    log "Running in validate mode"
fi

# Traitement des paires de configuration
for old_file in "${!CONFIG_PAIRS[@]}"; do
    new_file="${CONFIG_PAIRS[$old_file]}"
    
    # Comparer les configurations
    if compare_configs "$old_file" "$new_file"; then
        log "Configurations are identical: $old_file and $new_file"
        consolidate_configs "$old_file" "$new_file"
    else
        log "Warning: Configurations differ between $old_file and $new_file"
        if [ "$VALIDATE" = false ]; then
            log "Proceeding with consolidation anyway..."
            consolidate_configs "$old_file" "$new_file"
        fi
    fi
done

log "Configuration consolidation completed" 