"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  defaultValue?: string;
  className?: string;
}

export function SearchForm({ defaultValue = "", className = "" }: SearchFormProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    
    router.push(`/tools?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative flex w-full max-w-sm mx-auto items-center ${className}`}
    >
      <Input
        type="text"
        placeholder="Rechercher un outil..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pr-16 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="sm"
        className="absolute right-0 h-full px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="sr-only">Rechercher</span>
      </Button>
    </form>
  );
} 