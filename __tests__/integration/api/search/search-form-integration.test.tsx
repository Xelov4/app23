import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchForm } from '@/components/ui/search-form';
import { 
  setupSearchFormMocks, 
  renderSearchForm, 
  submitSearchForm, 
  expectUrlToBe,
  encodeSearchParam 
} from '@/__tests__/helpers/search-form-test-helper';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SearchForm Integration Tests', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockPush,
    }));
  });

  it('should update URL correctly upon form submission', async () => {
    // Arrange
    renderSearchForm();
    
    // Act
    await submitSearchForm('test search');
    
    // Assert
    expectUrlToBe(mockPush, encodeSearchParam('test search'));
  });

  it('should keep default value and update URL correctly', async () => {
    // Arrange
    renderSearchForm({ defaultValue: 'default search' });
    
    // Act
    await submitSearchForm(); // Submit without changing the value
    
    // Assert
    expectUrlToBe(mockPush, encodeSearchParam('default search'));
  });

  it('should handle special characters in search term', async () => {
    // Arrange
    renderSearchForm();
    
    // Act
    await submitSearchForm('AI & ML tools');
    
    // Assert
    expectUrlToBe(mockPush, encodeSearchParam('AI & ML tools'));
  });
}); 