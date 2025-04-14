import { test, expect } from '@playwright/test';

// Tests end-to-end pour le système de recherche
test.describe('Fonctionnalité de recherche', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil avant chaque test
    await page.goto('/');
  });

  test('doit permettre de rechercher un terme et rediriger vers la page de résultats', async ({ page }) => {
    // Trouver le champ de recherche sur la page d'accueil
    const searchInput = await page.getByPlaceholderText('Rechercher un outil...');
    
    // Vérifier que le champ de recherche est visible
    await expect(searchInput).toBeVisible();
    
    // Entrer un terme de recherche
    await searchInput.fill('vidéo');
    
    // Soumettre le formulaire de recherche
    await searchInput.press('Enter');
    
    // Vérifier que la page a été redirigée vers la page de résultats
    await expect(page).toHaveURL(/\/tools\?search=vid%C3%A9o/);
    
    // Vérifier que les résultats sont affichés
    await expect(page.getByRole('heading', { name: /Outils/i })).toBeVisible();
  });

  test('doit fonctionner avec la barre de recherche du header', async ({ page }) => {
    // Trouver le champ de recherche dans le header
    const headerSearchButton = await page.getByRole('button').filter({ has: page.locator('svg[data-testid="search-icon"]') });
    
    // Cliquer sur le bouton de recherche pour ouvrir le formulaire
    await headerSearchButton.click();
    
    // Entrer un terme de recherche dans le champ qui apparaît
    const searchInput = await page.getByPlaceholderText('Rechercher un outil...');
    await searchInput.fill('intelligence artificielle');
    
    // Soumettre le formulaire
    await searchInput.press('Enter');
    
    // Vérifier que la page a été redirigée vers la page de résultats
    await expect(page).toHaveURL(/\/tools\?search=intelligence\+artificielle/);
  });

  test('doit permettre de filtrer les résultats de recherche', async ({ page }) => {
    // Naviguer directement vers la page des outils
    await page.goto('/tools');
    
    // Vérifier que les filtres sont disponibles
    await expect(page.getByText('Filtres')).toBeVisible();
    
    // Ouvrir le panneau des filtres
    await page.getByText('Filtres').click();
    
    // Sélectionner un type de tarification
    await page.getByLabel('Gratuit').click();
    
    // Appliquer les filtres
    await page.getByRole('button', { name: 'Appliquer les filtres' }).click();
    
    // Vérifier que l'URL reflète les filtres appliqués
    await expect(page).toHaveURL(/\/tools\?pricing=FREE/);
    
    // Vérifier que les résultats sont filtrés
    // (Nous pourrions vérifier qu'un badge "Gratuit" est visible sur tous les résultats)
    await expect(page.locator('.tool-card').first()).toBeVisible();
  });

  test('doit permettre de naviguer entre les pages de résultats', async ({ page }) => {
    // Naviguer vers la page des outils
    await page.goto('/tools');
    
    // Vérifier qu'il y a au moins quelques résultats
    await expect(page.locator('.tool-card')).toHaveCount({ atLeast: 1 });
    
    // S'il y a une pagination
    const pagination = page.locator('nav').filter({ has: page.getByRole('link', { name: 'Page suivante' }) });
    
    if (await pagination.count() > 0) {
      // Cliquer sur le lien vers la page 2
      await page.getByRole('link', { name: '2' }).click();
      
      // Vérifier que l'URL reflète la page 2
      await expect(page).toHaveURL(/\/tools\?page=2/);
      
      // Vérifier que de nouveaux résultats sont affichés
      await expect(page.locator('.tool-card').first()).toBeVisible();
    }
  });

  test('doit afficher un message approprié quand aucun résultat n\'est trouvé', async ({ page }) => {
    // Naviguer vers la page des outils avec un terme de recherche qui ne donnera pas de résultats
    await page.goto('/tools?search=xyzxyzxyz123456789');
    
    // Vérifier qu'un message "Aucun résultat" est affiché
    await expect(page.getByText(/Aucun (outil|résultat) (trouvé|disponible)/i)).toBeVisible();
  });
});

// Tests pour l'interface d'administration de recherche
test.describe('Admin - Gestion des recherches', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de login
    await page.goto('/login');
    
    // Remplir le formulaire de connexion (à adapter selon l'implémentation réelle)
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    
    // Se connecter
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Vérifier que la connexion a réussi
    await expect(page).toHaveURL(/\/admin/);
  });

  test('doit afficher les statistiques de recherche dans le tableau de bord admin', async ({ page }) => {
    // Naviguer vers la page des statistiques de recherche
    await page.goto('/admin/search/data');
    
    // Vérifier que les éléments clés sont présents
    await expect(page.getByRole('heading', { name: /Données de recherche/i })).toBeVisible();
    await expect(page.getByText(/Termes les plus recherchés/i)).toBeVisible();
    
    // Vérifier qu'il y a au moins une entrée dans le tableau des termes de recherche
    await expect(page.locator('table tr')).toHaveCount({ atLeast: 2 }); // En-tête + au moins une ligne
  });

  test('doit permettre d\'exporter les données de recherche', async ({ page }) => {
    // Naviguer vers la page des statistiques de recherche
    await page.goto('/admin/search/data');
    
    // Cliquer sur le bouton d'export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Exporter/i }).click();
    
    // Attendre que le téléchargement commence
    const download = await downloadPromise;
    
    // Vérifier que le fichier a bien été téléchargé
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('doit permettre de gérer les pages de recherche personnalisées', async ({ page }) => {
    // Naviguer vers la page de gestion des pages de recherche
    await page.goto('/admin/search/pages');
    
    // Vérifier que les éléments clés sont présents
    await expect(page.getByRole('heading', { name: /Pages de recherche/i })).toBeVisible();
    
    // Cliquer sur le bouton pour créer une nouvelle page
    await page.getByRole('link', { name: /Nouvelle page/i }).click();
    
    // Vérifier que le formulaire de création est affiché
    await expect(page.getByRole('heading', { name: /Créer une page/i })).toBeVisible();
    
    // Remplir le formulaire
    await page.getByLabel('Terme de recherche').fill('test playwright');
    await page.getByLabel('Titre SEO').fill('Test Playwright Automatisé');
    await page.getByLabel('Description').fill('Page de test créée par Playwright');
    
    // Enregistrer la page
    await page.getByRole('button', { name: /Enregistrer/i }).click();
    
    // Vérifier que la création a réussi
    await expect(page.getByText(/Page créée avec succès/i)).toBeVisible();
  });
}); 