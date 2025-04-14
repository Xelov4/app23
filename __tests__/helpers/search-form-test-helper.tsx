import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchForm } from '@/components/ui/search-form';

// Configuration des mocks pour les tests
export const setupSearchFormMocks = () => {
  const mockPush = jest.fn();
  
  // Réinitialiser le mock avant chaque test
  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: mockPush,
    }),
  }), { virtual: true });
  
  return { mockPush };
};

// Render le composant SearchForm avec les options
export const renderSearchForm = (props = {}) => {
  return render(<SearchForm {...props} />);
};

// Helper pour soumettre le formulaire avec une valeur
export const submitSearchForm = async (value?: string) => {
  // Si une valeur est fournie, on la saisit dans le champ
  if (value !== undefined) {
    const searchInput = screen.getByPlaceholderText('Rechercher un outil...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value } });
    });
  }
  
  // Trouver le formulaire et le soumettre
  // Utiliser querySelector au lieu de getByRole car le formulaire n'a pas d'attribut role
  const form = document.querySelector('form');
  await act(async () => {
    fireEvent.submit(form);
  });
};

// Helper pour vérifier si l'URL est correctement formée
export const expectUrlToBe = (mockPush: jest.Mock, expectedUrl: string) => {
  expect(mockPush).toHaveBeenCalledWith(expectedUrl);
};

// Helper pour encoder correctement les paramètres de recherche
export const encodeSearchParam = (searchTerm: string) => {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.set("search", searchTerm);
  }
  return `/tools?${params.toString()}`;
}; 