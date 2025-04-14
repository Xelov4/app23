#!/bin/bash

# Mode d'exécution (dry-run par défaut)
DRY_RUN=true

# Fonction pour logger les actions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction pour analyser les dépendances
analyze_dependencies() {
    log "Analyzing dependencies..."
    
    # Liste des dépendances à vérifier
    DEPENDENCIES=(
        "@types/tailwindcss"
        "@types/marked"
        "inflight"
        "npmlog"
        "lodash.isequal"
        "rimraf"
        "are-we-there-yet"
        "gauge"
    )
    
    for dep in "${DEPENDENCIES[@]}"; do
        if grep -q "$dep" package.json; then
            if [ "$DRY_RUN" = true ]; then
                log "Would remove deprecated dependency: $dep"
            else
                npm uninstall "$dep"
                log "Removed deprecated dependency: $dep"
            fi
        fi
    done
}

# Fonction pour vérifier les dépendances non utilisées
check_unused_dependencies() {
    log "Checking for unused dependencies..."
    
    if [ "$DRY_RUN" = true ]; then
        npx depcheck
    else
        npx depcheck --json > unused-deps.json
        log "Unused dependencies report saved to unused-deps.json"
    fi
}

# Traitement des arguments
if [ "$1" = "--execute" ]; then
    DRY_RUN=false
    log "Running in execute mode"
else
    log "Running in dry-run mode"
fi

# Exécution des analyses
analyze_dependencies
check_unused_dependencies

log "Dependency cleanup process completed" 