import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/design-system/primitives";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: URLSearchParams | string;
  className?: string;
  maxDisplayed?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = "",
  className = "",
  maxDisplayed = 5
}: PaginationProps) {
  // Vérifier si les paramètres sont une chaîne ou un objet URLSearchParams
  const queryString = typeof searchParams === "string" 
    ? searchParams 
    : searchParams.toString();
  
  // Formater l'URL avec les paramètres de recherche existants
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(queryString);
    params.set("page", page.toString());
    return `${basePath}?${params.toString()}`;
  };
  
  // Déterminer les numéros de page à afficher
  let pageNumbers: (number | null)[] = [];
  
  if (totalPages <= maxDisplayed) {
    // Afficher toutes les pages si leur nombre est inférieur ou égal à maxDisplayed
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Toujours afficher la première page
    pageNumbers.push(1);
    
    // Calculer le début et la fin des pages à afficher
    let startPage = Math.max(2, currentPage - Math.floor((maxDisplayed - 3) / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxDisplayed - 4);
    
    // Ajuster si on est proche du début
    if (startPage > 2) {
      pageNumbers.push(null); // Ajouter des points de suspension
    }
    
    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Ajuster si on est proche de la fin
    if (endPage < totalPages - 1) {
      pageNumbers.push(null); // Ajouter des points de suspension
    }
    
    // Toujours afficher la dernière page
    pageNumbers.push(totalPages);
  }
  
  if (totalPages <= 1) {
    return null; // Ne pas afficher la pagination s'il n'y a qu'une seule page
  }
  
  return (
    <nav className={cn("flex justify-center items-center space-x-1", className)}>
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage <= 1}
      >
        <Link href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}>
          <span className="sr-only">Page précédente</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      </Button>
      
      {pageNumbers.map((page, index) => {
        if (page === null) {
          // Afficher des points de suspension pour les pages omises
          return (
            <span 
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          );
        }
        
        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={getPageUrl(page)}>
              <span>{page}</span>
            </Link>
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage >= totalPages}
      >
        <Link href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}>
          <span className="sr-only">Page suivante</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </Button>
    </nav>
  );
} 