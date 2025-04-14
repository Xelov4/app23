import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchForm } from '@/components/ui/search-form';

const mockPush = jest.fn();

// Mock pour next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SearchForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('doit rendre correctement le champ de recherche', () => {
    render(<SearchForm />);
    
    // Vérification que le champ de recherche est présent
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    expect(searchInput).toBeInTheDocument();
    
    // Vérification que le bouton de recherche est présent
    const searchButton = screen.getByRole('button');
    expect(searchButton).toBeInTheDocument();
  });

  it('doit initialiser le champ avec la valeur par défaut si fournie', () => {
    render(<SearchForm defaultValue="test" />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    expect(searchInput).toHaveValue('test');
  });

  it('doit mettre à jour la valeur lorsque l\'utilisateur tape', () => {
    render(<SearchForm />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    fireEvent.change(searchInput, { target: { value: 'nouveau test' } });
    
    expect(searchInput).toHaveValue('nouveau test');
  });

  it('doit naviguer vers la page des outils avec le paramètre de recherche lors de la soumission', () => {
    const { container } = render(<SearchForm />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    fireEvent.change(searchInput, { target: { value: 'test recherche' } });
    
    const searchForm = container.querySelector('form');
    fireEvent.submit(searchForm);
    
    expect(mockPush).toHaveBeenCalledWith('/tools?search=test+recherche');
  });

  it('doit naviguer vers la page des outils sans paramètre de recherche si le champ est vide', () => {
    const { container } = render(<SearchForm />);
    
    const searchForm = container.querySelector('form');
    fireEvent.submit(searchForm);
    
    expect(mockPush).toHaveBeenCalledWith('/tools?');
  });

  it('doit appliquer les classes CSS personnalisées si fournies', () => {
    const { container } = render(<SearchForm className="custom-class" />);
    
    const searchForm = container.querySelector('form');
    expect(searchForm).toHaveClass('custom-class');
  });
}); 