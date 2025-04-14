import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilters } from '@/components/ui/search-filters';
import { mockFilterOptions, mockSearchParamsString } from '../../../mocks/filterOptions';

const mockPush = jest.fn();
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

// Mock pour next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => ({
    get: (param: string) => {
      const params = new URLSearchParams(mockSearchParamsString);
      return params.get(param);
    },
    toString: () => mockSearchParamsString
  }),
}));

describe('SearchFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUsePathname.mockReturnValue('/tools');
  });

  it('doit rendre correctement les options de filtrage', () => {
    render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Vérification de la présence du champ de recherche
    expect(screen.getByPlaceholderText('Rechercher un outil...')).toBeInTheDocument();
    
    // Vérification des options de tarification (utilise getAllByText pour gérer les duplications)
    expect(screen.getAllByText('Gratuit')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Freemium')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Payant')[0]).toBeInTheDocument();
    
    // Vérification des catégories (utilise getAllByText pour éviter les duplications)
    expect(screen.getAllByText(/Génération de vidéo/)[0]).toBeInTheDocument();
    
    // Vérification des tags (utilise getAllByText pour éviter les duplications)
    expect(screen.getAllByText(/Intelligence artificielle/)[0]).toBeInTheDocument();
  });

  it('doit initialiser les filtres à partir des paramètres de recherche', () => {
    const { container } = render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Vérification de la valeur initiale du champ de recherche
    expect(screen.getByPlaceholderText('Rechercher un outil...')).toHaveValue('test');
    
    // Vérification des filtres actifs
    const activeFilters = screen.getByText('Filtres actifs').nextElementSibling;
    expect(activeFilters).toBeInTheDocument();
    expect(activeFilters.textContent).toContain('Gratuit');
    expect(activeFilters.textContent).toContain('Freemium');
  });

  it('doit mettre à jour les filtres quand l\'utilisateur change les sélections', () => {
    const { container } = render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Changement du terme de recherche
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    fireEvent.change(searchInput, { target: { value: 'nouveau test' } });
    
    // Cliquer sur un badge de filtre existant pour le désélectionner
    const gratuitBadge = screen.getAllByText('Gratuit')[0];
    fireEvent.click(gratuitBadge);
    
    // Application des filtres
    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);
    
    // Vérification que la navigation a été appelée avec les bons paramètres
    expect(mockPush).toHaveBeenCalled();
  });

  it('doit réinitialiser tous les filtres', () => {
    render(<SearchFilters filterOptions={mockFilterOptions} />);
    
    // Clic sur le bouton de réinitialisation
    const resetButton = screen.getByText('Réinitialiser');
    fireEvent.click(resetButton);
    
    // Vérification que la navigation a été appelée vers la page sans paramètres
    expect(mockPush).toHaveBeenCalledWith('/tools');
  });

  it('doit appliquer les classes CSS personnalisées si fournies', () => {
    const { container } = render(<SearchFilters filterOptions={mockFilterOptions} className="custom-class" />);
    
    // Vérification que la classe est appliquée au conteneur principal (premier div)
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('custom-class');
  });
}); 