import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCategoryEmoji } from "@/lib/design-system/primitives";

// Récupérer les catégories principales
async function getMainCategories() {
  try {
    return await db.category.findMany({
      take: 5, // Limiter aux 5 principales catégories
      orderBy: {
        CategoriesOnTools: {
          _count: 'desc'
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

export default async function Header() {
  const categories = await getMainCategories();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/images/logo.png" 
              alt="Video IA" 
              width={32} 
              height={32} 
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg hidden sm:inline-block">Video IA</span>
          </Link>
        </div>
        
        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Accueil
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-auto p-0 text-sm font-medium hover:text-primary"
              >
                Catégories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categories.map(category => (
                <DropdownMenuItem key={category.id}>
                  <Link 
                    href={`/categories/${category.slug}`} 
                    className="flex items-center w-full"
                  >
                    <span className="mr-2">{getCategoryEmoji(category.slug)}</span>
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem>
                <Link href="/categories" className="flex items-center w-full">
                  <span className="mr-2">🔍</span>
                  Toutes les catégories
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link 
            href="/tools" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Tous les outils
          </Link>
        </nav>
        
        {/* Barre de recherche */}
        <div className="flex-1 flex justify-center px-2">
          <form 
            action="/" 
            method="GET" 
            className="w-full max-w-sm lg:max-w-md"
          >
            <div className="relative">
              <Input 
                type="search"
                name="search"
                placeholder="Rechercher un outil..."
                className="h-9 w-full md:w-[300px] lg:w-[360px] pl-8 rounded-full"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </form>
        </div>
        
        {/* Menu mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Link 
                href="/" 
                className="py-2 text-base font-medium"
              >
                Accueil
              </Link>
              <div className="py-2">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Catégories
                </h3>
                <div className="grid gap-2">
                  {categories.map(category => (
                    <Link 
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="flex items-center text-sm"
                    >
                      <span className="mr-2">{getCategoryEmoji(category.slug)}</span>
                      {category.name}
                    </Link>
                  ))}
                  <Link 
                    href="/categories"
                    className="flex items-center text-sm text-primary"
                  >
                    Toutes les catégories →
                  </Link>
                </div>
              </div>
              <Link 
                href="/tools" 
                className="py-2 text-base font-medium"
              >
                Tous les outils
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
} 