"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getImageWithFallback,
  formatDate,
  truncateText,
  formatPricingType,
} from "@/lib/design-system/primitives";
import {
  Globe,
  ExternalLink,
  Tag,
  Clock,
  Calendar,
  Star,
  Info,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Type minimal pour le composant
type ClientTabsProps = {
  tool: any;
  similarTools: any[];
};

export default function ClientTabs({ tool, similarTools }: ClientTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
        {tool.reviews && tool.reviews.length > 0 && (
          <TabsTrigger value="reviews">Avis ({tool._count.reviews})</TabsTrigger>
        )}
        {similarTools.length > 0 && (
          <TabsTrigger value="similar">Outils similaires</TabsTrigger>
        )}
      </TabsList>

      {/* Aperçu */}
      <TabsContent value="overview" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-8">
            {/* Description complète */}
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">À propos de {tool.name}</h2>
              <div className="text-foreground/90 whitespace-pre-line">
                {tool.description}
              </div>
            </div>

            {/* Cas d'utilisation */}
            {tool.useCases.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Cas d'utilisation</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tool.useCases.map((useCase: string, index: number) => (
                    <li key={index} className="flex items-start p-3 bg-muted/50 rounded-lg">
                      <CheckCircle size={16} className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar avec métadonnées */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-5">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Informations</h3>
              <dl className="space-y-3">
                <div className="flex items-start">
                  <dt className="w-8 flex-shrink-0">
                    <Globe size={16} className="text-muted-foreground" />
                  </dt>
                  <dd>
                    <a 
                      href={tool.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      {new URL(tool.websiteUrl).hostname}
                      <ExternalLink size={12} className="ml-1 opacity-70" />
                    </a>
                  </dd>
                </div>
                
                {tool.pricingDetails && (
                  <div className="flex items-start">
                    <dt className="w-8 flex-shrink-0">
                      <Tag size={16} className="text-muted-foreground" />
                    </dt>
                    <dd className="text-sm">{tool.pricingDetails}</dd>
                  </div>
                )}
                
                <div className="flex items-start">
                  <dt className="w-8 flex-shrink-0">
                    <Calendar size={16} className="text-muted-foreground" />
                  </dt>
                  <dd className="text-sm">
                    Ajouté le {formatDate(tool.createdAt)}
                  </dd>
                </div>
                
                <div className="flex items-start">
                  <dt className="w-8 flex-shrink-0">
                    <Clock size={16} className="text-muted-foreground" />
                  </dt>
                  <dd className="text-sm">
                    Mis à jour le {formatDate(tool.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Réseaux sociaux */}
            {tool.socialLinks && tool.socialLinks.length > 0 && (
              <div className="bg-card border rounded-lg p-5">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Réseaux sociaux</h3>
                <div className="space-y-2">
                  {tool.socialLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span>{link.name}</span>
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      
      {/* Fonctionnalités */}
      <TabsContent value="features" className="mt-0">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités principales</h2>
          
          {tool.features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.features.map((feature: string, index: number) => (
                <div key={index} className="bg-card border rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <CheckCircle size={14} className="text-primary" />
                    </div>
                    <div>
                      <p>{feature}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted p-6 rounded-lg text-center">
              <Info size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p>Aucune fonctionnalité spécifique n'a été répertoriée pour cet outil.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      {/* Avis */}
      {tool.reviews && tool.reviews.length > 0 && (
        <TabsContent value="reviews" className="mt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Avis des utilisateurs</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tools/${tool.slug}/reviews`}>
                  Voir tous les avis
                </Link>
              </Button>
            </div>
            
            <div className="space-y-6">
              {tool.reviews.map((review: any) => (
                <div key={review.id} className="bg-card border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                        {review.userName?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-medium">{review.userName || "Utilisateur"}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h3 className="font-medium mb-2">{review.title}</h3>
                  )}
                  <p className="text-foreground/80">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      )}
      
      {/* Outils similaires */}
      {similarTools.length > 0 && (
        <TabsContent value="similar" className="mt-0">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Outils similaires à {tool.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarTools.map((similarTool) => (
                <Link
                  key={similarTool.id}
                  href={`/tools/${similarTool.slug}`}
                  className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="p-5 flex items-center">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-white">
                      <Image
                        src={getImageWithFallback(similarTool.logoUrl)}
                        alt={similarTool.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{similarTool.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatPricingType(similarTool.pricingType || "").label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncateText(similarTool.description, 120)}
                    </p>
                  </div>
                  <div className="mt-auto px-5 pb-5 pt-2">
                    <div className="text-primary text-sm flex items-center">
                      Voir les détails
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
} 