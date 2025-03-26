"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  MagnifyingGlassIcon, 
  HamburgerMenuIcon, 
  Cross1Icon,
  ChevronDownIcon
} from "@radix-ui/react-icons";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Liste des catégories à afficher dans le menu
const categories = [
  { name: "Génération de vidéos", slug: "generation-videos", emoji: "🎬" },
  { name: "Édition vidéo", slug: "edition-videos", emoji: "✂️" },
  { name: "Animation", slug: "animation", emoji: "🎭" },
  { name: "Audio", slug: "audio", emoji: "🎵" },
  { name: "Voix", slug: "voix", emoji: "🗣️" },
  { name: "Transcription", slug: "transcription", emoji: "📝" },
  { name: "Sous-titres", slug: "sous-titres", emoji: "💬" },
  { name: "Effets spéciaux", slug: "effets-speciaux", emoji: "✨" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Effet pour détecter le défilement et changer l'apparence de la navigation
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Gestion de la soumission du formulaire de recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-white",
        scrolled ? "shadow-md border-b py-2" : "py-4"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl md:text-2xl text-primary-600">Video-IA.net</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Catégories</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 grid grid-cols-2 gap-1 p-2">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link 
                      href={`/categories/${category.slug}`}
                      className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-100"
                    >
                      <span className="text-lg">{category.emoji}</span>
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/tools" className="text-gray-600 hover:text-primary-600">
              Tous les outils
            </Link>
          </nav>

          {/* Barre de recherche - Desktop */}
          <div className="hidden md:flex relative w-full max-w-md">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher un outil IA..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pr-10 border-gray-300 rounded-full focus:ring-primary-500 focus:border-primary-500"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-700 rounded-full">
                  <HamburgerMenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>
                  
                  {/* Recherche mobile */}
                  <form onSubmit={handleSearchSubmit} className="mb-6">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Rechercher un outil IA..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        variant="ghost"
                        className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                  
                  {/* Navigation mobile */}
                  <div className="space-y-4">
                    <div className="border-b pb-2 mb-2">
                      <h3 className="text-sm font-semibold mb-2 text-gray-500">Catégories</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {categories.map((category) => (
                          <Link 
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className="flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-100"
                          >
                            <span className="text-lg">{category.emoji}</span>
                            <span>{category.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <Link 
                      href="/tools"
                      className="flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-100"
                    >
                      <span>Tous les outils</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 