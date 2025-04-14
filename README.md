# video-ia.net

Site de référencement des outils d'intelligence artificielle pour la vidéo.

## À propos du projet

video-ia.net est un site catalogue qui répertorie et présente les différents outils d'IA spécialisés dans la création, l'édition et la production vidéo. Il permet aux utilisateurs de découvrir, comparer et choisir les meilleurs outils adaptés à leurs besoins.

## Technologies utilisées

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Base de données**: SQLite avec [Prisma ORM](https://www.prisma.io/)
- **UI/UX**: [Tailwind CSS](https://tailwindcss.com/) et [Shadcn/UI](https://ui.shadcn.com/)
- **Déploiement**: Nginx, PM2, Certbot pour SSL

## Prérequis

- Node.js 18+ et npm
- Nginx
- PM2 (`npm install -g pm2`)
- Certbot (pour le SSL)

## Installation et démarrage local

```bash
# Cloner le dépôt (si vous utilisez git)
git clone https://github.com/votre-compte/video-ia.net.git
cd video-ia.net

# Installer les dépendances
npm install

# Générer les types Prisma
npx prisma generate

# Appliquer les migrations à la base de données
npx prisma db push

# Charger les données initiales
npm run db:seed

# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

## Déploiement en production

Nous fournissons des scripts pour faciliter le déploiement:

```bash
# Script de déploiement complet
./deploy.sh

# Vérification de santé 
./health-check.sh
```

Pour plus de détails sur le déploiement, consultez le fichier [DEPLOIEMENT.md](./DEPLOIEMENT.md).

### Configuration des certificats SSL

Une fois le déploiement initial terminé, vous pouvez configurer SSL:

```bash
sudo certbot --nginx -d video-ia.net -d www.video-ia.net
```

## Structure du projet

- `app/` - Code source de l'application Next.js
  - `api/` - Routes API
  - `components/` - Composants spécifiques à l'application
  - `tools/` - Pages pour les outils
  - `categories/` - Pages pour les catégories
  - `admin/` - Interface d'administration
- `components/` - Composants UI réutilisables
- `lib/` - Utilitaires et configurations partagées
- `prisma/` - Schéma et seed de la base de données
- `public/` - Fichiers statiques

## Maintenance

### Mise à jour de l'application

```bash
# Mettre à jour le code source (si vous utilisez git)
git pull

# Installer les dépendances
npm install

# Reconstruire l'application
npm run build

# Redémarrer l'application
pm2 reload video-ia.net
```

### Sauvegarde de la base de données

La base de données SQLite est située dans `prisma/dev.db`. Vous pouvez la sauvegarder simplement en copiant ce fichier.

### Surveillance et logs

- Logs PM2: `pm2 logs video-ia.net`
- Logs Nginx: `/var/log/nginx/access.log` et `/var/log/nginx/error.log`
- Logs de l'application: `/root/logs/video-ia-err.log` et `/root/logs/video-ia-out.log`

## Licence

[MIT](https://opensource.org/licenses/MIT)

## Structure des dossiers

Le projet est entièrement contenu dans le répertoire `/root/app23` :

```
/root/app23/
│
├── app/                  # Code source de l'application Next.js
├── components/           # Composants React partagés
├── prisma/               # Schéma et migrations Prisma
├── public/               # Fichiers statiques
├── nginx-config/         # Configuration Nginx
├── certs/                # Certificats SSL
├── logs/                 # Fichiers de logs
│
├── ecosystem.config.js   # Configuration PM2
├── deploy-local.sh       # Script de déploiement complet
├── restart.sh            # Script de redémarrage rapide
├── renew-certs.sh        # Script de renouvellement des certificats SSL
├── update-nginx-links.sh # Script de mise à jour des liens symboliques Nginx
├── setup-ssl.sh          # Script complet pour la configuration SSL
├── cron-renew-ssl.sh     # Script de renouvellement SSL pour cron
└── ...
```

## Scripts

- `./deploy-local.sh` - Script de déploiement complet qui configure tout dans le dossier local
- `./restart.sh` - Redémarre rapidement les services sans reconstruire l'application
- `./renew-certs.sh` - Renouvelle les certificats SSL et les copie dans le dossier local
- `./update-nginx-links.sh` - Met à jour les liens symboliques pour la configuration Nginx
- `./setup-ssl.sh` - Configure complètement SSL avec Let's Encrypt/Certbot

## Déploiement

Pour déployer l'application :

```bash
cd /root/app23
./deploy-local.sh
```

Pour redémarrer rapidement après des modifications mineures :

```bash
cd /root/app23
./restart.sh
```

Pour configurer SSL avec Let's Encrypt :

```bash
cd /root/app23
./setup-ssl.sh
```

Pour renouveler manuellement les certificats SSL :

```bash
cd /root/app23
./renew-certs.sh
```

## Tests

### Tests unitaires et d'intégration

Le projet utilise Jest pour les tests unitaires et d'intégration. Pour exécuter les tests :

```bash
# Installer les dépendances
npm install

# Exécuter tous les tests
npm test

# Exécuter les tests unitaires seulement
npm run test:unit

# Exécuter les tests d'intégration seulement
npm run test:integration

# Exécuter les tests avec couverture
npm run test:coverage
```

### Tests end-to-end (E2E)

Les tests E2E utilisent Playwright. Pour les exécuter :

```bash
# Installer les navigateurs pour Playwright (à faire une seule fois)
npx playwright install

# Exécuter les tests E2E
npm run test:e2e

# Exécuter les tests E2E avec interface graphique
npm run test:e2e:ui

# Exécuter les tests E2E en mode débogage
npm run test:e2e:debug
```

### Documentation des tests

La documentation complète des tests est disponible dans :
- `docs/development/tests-search.md` : Guide général des tests
- `docs/api/search/api-test-plan.md` : Plan de tests des API
