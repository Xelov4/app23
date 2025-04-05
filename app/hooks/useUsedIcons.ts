import { useState, useEffect } from 'react';

interface Category {
  id: string;
  iconName: string | null;
}

export default function useUsedIcons(excludeCategoryId?: string) {
  const [usedIcons, setUsedIcons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsedIcons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        const data = await response.json();
        
        // Filtrer les catégories pour exclure celle en cours d'édition
        const filteredCategories = excludeCategoryId
          ? data.filter((category: Category) => category.id !== excludeCategoryId)
          : data;
        
        // Extraire les noms d'icônes non nulles
        const icons = filteredCategories
          .map((category: Category) => category.iconName)
          .filter((iconName: string | null): iconName is string => iconName !== null);
        
        setUsedIcons(icons);
      } catch (err) {
        setError('Erreur lors du chargement des icônes utilisées');
        console.error('Erreur lors du chargement des icônes utilisées:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsedIcons();
  }, [excludeCategoryId]);

  return { usedIcons, isLoading, error };
} 