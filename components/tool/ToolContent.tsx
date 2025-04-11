"use client";

import React from "react";
import Link from "next/link";
import { formatDate, formatPricingType } from "@/lib/design-system/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, CheckCircle, Users, Tag, PieChart, Search, MessageSquare } from "lucide-react";

type ToolContentProps = {
  tool: any;
  relatedSearches?: any[];
};

export default function ToolContent({ tool, relatedSearches = [] }: ToolContentProps) {
  return (
    <div className="space-y-10">
      {/* Qu'est-ce que [Tool Name] */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Qu'est-ce que {tool.name} ?</h2>
        <div className="prose prose-blue max-w-none dark:prose-invert">
          <div className="whitespace-pre-line">
            {tool.detailedDescription || tool.description}
          </div>
        </div>
      </section>
      
      <Separator />
      
      {/* Fonctionnalités clés */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Fonctionnalités clés</h2>
        
        {tool.features && tool.features.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.features.map((feature: string, index: number) => (
              <div key={index} className="bg-muted/40 rounded-lg p-4">
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
          <p className="text-muted-foreground">Aucune fonctionnalité spécifique n'a été répertoriée pour cet outil.</p>
        )}
      </section>
      
      <Separator />
      
      {/* Cas d'utilisation */}
      {tool.useCases && tool.useCases.length > 0 && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">Cas d'utilisation</h2>
            <div className="grid grid-cols-1 gap-3">
              {tool.useCases.map((useCase: string, index: number) => (
                <div key={index} className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <p>{useCase}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <Separator />
        </>
      )}
      
      {/* Types d'utilisateurs */}
      {tool.userTypes && tool.userTypes.length > 0 && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">Pour qui est conçu {tool.name} ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tool.userTypes.map((userType: any, index: number) => (
                <div key={index} className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{userType.name}</p>
                      {userType.description && (
                        <p className="text-sm text-muted-foreground mt-1">{userType.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <Separator />
        </>
      )}
      
      {/* Informations tarifaires */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tarification</h2>
        
        <div className="bg-muted/40 rounded-lg p-5">
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <PieChart size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="font-medium">{formatPricingType(tool.pricingType).label}</p>
              {tool.pricingDetails && (
                <p className="text-muted-foreground mt-1 whitespace-pre-line">{tool.pricingDetails}</p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Recherches liées */}
      {relatedSearches && relatedSearches.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Recherches liées à {tool.name}</h2>
            
            <div className="bg-muted/40 rounded-lg p-5">
              <div className="flex items-start mb-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <Search size={14} className="text-purple-600" />
                </div>
                <p>Ces termes de recherche sont souvent associés à {tool.name} :</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {relatedSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/search?q=${encodeURIComponent(search.keyword)}`}
                  >
                    <Badge variant="secondary" className="hover:bg-secondary/80">
                      {search.keyword}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      
      {/* Avis d'utilisateurs */}
      {tool.reviews && tool.reviews.length > 0 && (
        <>
          <Separator id="reviews" />
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Avis des utilisateurs</h2>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= Math.round(tool.rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {tool.rating ? tool.rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({tool._count?.reviews || 0})
                  </span>
                </div>
                
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/tools/${tool.slug}/reviews/new`}>
                    Donner mon avis
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
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
            
            {tool._count?.reviews > 3 && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" asChild>
                  <Link href={`/tools/${tool.slug}/reviews`} className="flex items-center">
                    <MessageSquare size={16} className="mr-2" />
                    Voir tous les avis ({tool._count.reviews})
                  </Link>
                </Button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
} 