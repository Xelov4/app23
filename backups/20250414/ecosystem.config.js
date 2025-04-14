module.exports = {
  apps: [
    {
      name: 'video-ia.net',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/vidéo-ia.net',
      instances: 'max', // Utilise le nombre de CPU disponibles
      exec_mode: 'cluster', // Mode cluster pour plus de robustesse
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configuration des logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/vidéo-ia.net/logs/video-ia-err.log',
      out_file: '/root/vidéo-ia.net/logs/video-ia-out.log',
      merge_logs: true,
      // Gestion des erreurs
      max_restarts: 10,
      restart_delay: 5000, // 5 secondes entre les tentatives de redémarrage
      // Health check
      exp_backoff_restart_delay: 100, // Augmente progressivement le délai entre les redémarrages
      listen_timeout: 10000, // Timeout pour tuer le processus s'il ne répond pas
    }
  ]
}; 