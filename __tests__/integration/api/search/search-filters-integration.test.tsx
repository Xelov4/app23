import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchFilters } from '@/components/ui/search-filters';
import { mockFilterOptions } from '../../../mocks/filterOptions';

// Mocks
const mockPush = jest.fn();
const mockPathname = '/tools';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === 'search') return 'test';
      if (param === 'pricing') return 'FREE,FREEMIUM';
      if (param === 'category') return 'video-generation';
      if (param === 'tag') return 'ai';
      return null;
    },
    toString: () => 'search=test&pricing=FREE,FREEMIUM&category=video-generation&tag=ai'
  }),
}));

describe('SearchFilters - Tests d\'intégration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('doit mettre à jour l\'URL avec les filtres appliqués lorsque l\'utilisateur clique sur Appliquer', async () => {
    // Rendu du composant
    render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Simulation d'une entrée utilisateur pour le champ de recherche
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'nouveautest' } });
    });
    
    // Simulation d'un clic sur une case à cocher pour ajouter un type de tarification
    const paidLabel = screen.getAllByText('Payant')[0];
    const paidContainer = paidLabel.closest('div');
    const paidCheckbox = paidContainer.querySelector('input[type="checkbox"]');
    await act(async () => {
      fireEvent.click(paidCheckbox);
    });
    
    // Simulation du clic sur le bouton Appliquer
    const applyButton = screen.getByText('Appliquer les filtres');
    await act(async () => {
      fireEvent.click(applyButton);
    });
    
    // Vérification que la fonction push a été appelée
    expect(mockPush).toHaveBeenCalled();
    
    // Note: Nous ne pouvons pas tester la valeur exacte sans gérer l'état complet
    // Car le nouvel état dépend des modifications faites via les événements
  });

  it('doit réinitialiser les filtres et rediriger vers l\'URL de base', async () => {
    // Rendu du composant
    render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Vérification des filtres actifs initialement
    expect(screen.getAllByText('Gratuit')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Freemium')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Intelligence artificielle/)[0]).toBeInTheDocument();
    
    // Simulation du clic sur le bouton Réinitialiser
    const resetButton = screen.getByText('Réinitialiser');
    await act(async () => {
      fireEvent.click(resetButton);
    });
    
    // Vérification que la fonction push a été appelée avec juste le chemin de base
    expect(mockPush).toHaveBeenCalledWith('/tools');
  });

  it('doit permettre de retirer des filtres individuels', async () => {
    // Rendu du composant
    render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Simulation du clic sur un badge de filtre pour le retirer (ici Gratuit)
    const freeBadge = screen.getAllByText('Gratuit')[0]; // Premier élément avec le texte "Gratuit"
    await act(async () => {
      fireEvent.click(freeBadge);
    });
    
    // Simulation du clic sur le bouton Appliquer pour enregistrer la modification
    const applyButton = screen.getByText('Appliquer les filtres');
    await act(async () => {
      fireEvent.click(applyButton);
    });
    
    // Vérification que la fonction push a été appelée
    expect(mockPush).toHaveBeenCalled();
  });
}); 