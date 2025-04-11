"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { ToolCard } from "@/components/ui/tool-card";

type FeaturedToolsProps = {
  popularTools: any[];
  newTools: any[];
  freeTools: any[];
};

export default function FeaturedTools({ popularTools, newTools, freeTools }: FeaturedToolsProps) {
  const [activeTab, setActiveTab] = useState("popular");
  
  const tabData = [
    { id: "popular", label: "Populaires", tools: popularTools },
    { id: "new", label: "Nouveautés", tools: newTools },
    { id: "free", label: "Gratuits", tools: freeTools }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Outils d'IA pour la vidéo
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Découvrez notre sélection des meilleurs outils d'intelligence artificielle pour transformer votre création vidéo.
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto">
              {tabData.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex-1 md:flex-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Grille d'outils */}
        {tabData.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tab.tools.slice(0, 8).map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  variant="grid"
                  showTags={false}
                />
              ))}
            </div>
            
            {/* Lien "Voir plus" */}
            <div className="flex justify-center mt-10">
              <Button asChild size="lg" variant="outline">
                <Link href={`/${tab.id === "popular" ? "popular" : tab.id === "new" ? "latest" : "free"}`} className="flex items-center">
                  Voir plus d'outils {tab.label.toLowerCase()}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        ))}
      </div>
    </section>
  );
} 