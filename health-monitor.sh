#!/bin/bash

# Variables
LOG_FILE="/var/log/video-ia-health.log"
MAX_RESTART=3
RESTART_COUNT=0
COOLDOWN_PERIOD=1800  # 30 minutes in seconds

# Fonction de journalisation
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Vérifier si le service est actif
check_service() {
    systemctl is-active --quiet video-ia.service
    return $?
}

# Vérifier si le site répond
check_website() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [[ $HTTP_CODE -eq 200 ]]; then
        return 0
    else
        return 1
    fi
}

# Vérifier si les sitemaps sont accessibles
check_sitemaps() {
    SITEMAP_INDEX_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.video-ia.net/sitemap-index.xml)
    if [[ $SITEMAP_INDEX_CODE -ne 200 ]]; then
        log "Sitemap index n'est pas accessible (code HTTP: $SITEMAP_INDEX_CODE)"
        return 1
    fi
    
    # Vérifier un exemple de sitemap fils
    SITEMAP_PAGES_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.video-ia.net/sitemap-pages.xml)
    if [[ $SITEMAP_PAGES_CODE -ne 200 ]]; then
        log "Sitemap pages n'est pas accessible (code HTTP: $SITEMAP_PAGES_CODE)"
        return 1
    fi
    
    return 0
}

# Redémarrer le service
restart_service() {
    log "Tentative de redémarrage du service video-ia..."
    systemctl restart video-ia.service
    sleep 10  # Attendre que le service démarre
    
    if check_service && check_website; then
        log "Service redémarré avec succès"
        return 0
    else
        log "Échec du redémarrage du service"
        return 1
    fi
}

# Boucle principale de surveillance
while true; do
    if ! check_service || ! check_website; then
        log "Problème détecté avec le service video-ia"
        
        # Vérifier si nous avons dépassé le nombre maximum de redémarrages
        if [[ $RESTART_COUNT -ge $MAX_RESTART ]]; then
            log "Nombre maximum de redémarrages atteint ($MAX_RESTART). Attente de $COOLDOWN_PERIOD secondes avant la prochaine tentative."
            sleep $COOLDOWN_PERIOD
            RESTART_COUNT=0
        fi
        
        # Tentative de redémarrage
        if restart_service; then
            log "Service restauré avec succès"
        else
            log "Échec de la restauration du service après redémarrage"
            RESTART_COUNT=$((RESTART_COUNT+1))
        fi
    fi
    
    # Vérifier les sitemaps (toutes les 10 itérations)
    if [[ $((SECONDS % 600)) -lt 60 ]]; then
        if ! check_sitemaps; then
            log "Problème détecté avec les sitemaps, redémarrage du service nginx"
            systemctl restart nginx
        fi
    fi
    
    # Attente avant la prochaine vérification
    sleep 60
done 