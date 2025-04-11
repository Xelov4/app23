"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Database, Tag, Star } from "lucide-react";

type HeroSectionProps = {
  totalTools: number;
  totalCategories: number;
  totalReviews: number;
};

export default function HeroSection({ totalTools, totalCategories, totalReviews }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const stats = [
    {
      title: "Outils",
      value: totalTools,
      icon: <Database className="h-5 w-5 text-primary/80" />,
      description: "Outils d'IA répertoriés",
    },
    {
      title: "Catégories",
      value: totalCategories,
      icon: <Tag className="h-5 w-5 text-primary/80" />,
      description: "Catégories d'outils",
    },
    {
      title: "Avis",
      value: totalReviews,
      icon: <Star className="h-5 w-5 text-primary/80" />,
      description: "Avis d'utilisateurs",
    },
  ];

  return (
    <section className="relative">
      {/* Gradient d'arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
      
      <div className="container max-w-screen-xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Les meilleurs outils d'IA
            </span>{" "}
            pour la vidéo
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 md:mb-10">
            Découvrez, comparez et utilisez les outils d'intelligence artificielle qui transforment la création vidéo.
          </p>
          
          {/* Barre de recherche principale */}
          <form 
            onSubmit={handleSearch} 
            className="relative max-w-2xl mx-auto mb-10 md:mb-12"
          >
            <div className="relative flex rounded-full overflow-hidden border shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="flex items-center pl-4">
                <Search className="h-5 w-5 text-muted-foreground" />
              </span>
              <Input 
                type="search"
                placeholder="Rechercher un outil d'IA pour la vidéo..."
                className="border-0 flex-grow py-6 pl-3 pr-20 shadow-none focus-visible:ring-0 bg-transparent text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-5"
              >
                Rechercher
              </Button>
            </div>
          </form>
          
          {/* Liens d'accès rapide */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Button variant="outline" asChild>
              <Link href="/categories" className="rounded-full">
                Explorer par catégorie
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tags" className="rounded-full">
                Explorer par tag
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/popular" className="rounded-full">
                Outils populaires
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-lg font-medium mb-1">{stat.title}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 