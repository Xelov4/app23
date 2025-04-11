"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getImageWithFallback,
  formatPricingType,
  getCategoryEmoji
} from "@/lib/design-system/primitives";
import { 
  Star, 
  Globe, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Github, 
  Youtube,
  Apple,
  Play
} from "lucide-react";

type ToolHeaderProps = {
  tool: any;
};

export default function ToolHeader({ tool }: ToolHeaderProps) {
  // Format de la date et des réseaux sociaux
  const socialIcons = {
    twitter: <Twitter size={16} />,
    instagram: <Instagram size={16} />,
    facebook: <Facebook size={16} />,
    linkedin: <Linkedin size={16} />,
    github: <Github size={16} />,
    youtube: <Youtube size={16} />,
    appStore: <Apple size={16} />,
    playStore: <Play size={16} />
  };

  // Vérification des réseaux sociaux disponibles
  const socialLinks = [];
  if (tool.twitterUrl) socialLinks.push({ name: "Twitter", url: tool.twitterUrl, icon: socialIcons.twitter });
  if (tool.instagramUrl) socialLinks.push({ name: "Instagram", url: tool.instagramUrl, icon: socialIcons.instagram });
  if (tool.facebookUrl) socialLinks.push({ name: "Facebook", url: tool.facebookUrl, icon: socialIcons.facebook });
  if (tool.linkedinUrl) socialLinks.push({ name: "LinkedIn", url: tool.linkedinUrl, icon: socialIcons.linkedin });
  if (tool.githubUrl) socialLinks.push({ name: "GitHub", url: tool.githubUrl, icon: socialIcons.github });
  if (tool.youtubeUrl) socialLinks.push({ name: "YouTube", url: tool.youtubeUrl, icon: socialIcons.youtube });
  if (tool.appStoreUrl) socialLinks.push({ name: "App Store", url: tool.appStoreUrl, icon: socialIcons.appStore });
  if (tool.playStoreUrl) socialLinks.push({ name: "Play Store", url: tool.playStoreUrl, icon: socialIcons.playStore });

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl overflow-hidden shadow-sm mb-8">
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Logo */}
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <div className="w-28 h-28 md:w-32 md:h-32 relative rounded-lg border overflow-hidden bg-white shadow-sm group hover:shadow-md transition-all duration-300">
              <Image
                src={getImageWithFallback(tool.logoUrl)}
                alt={tool.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 112px, 128px"
                priority
              />
            </div>
          </div>
          
          {/* Informations principales */}
          <div className="md:col-span-7 flex flex-col space-y-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">{tool.name}</h1>
              
              <div className="flex items-center justify-center md:justify-start">
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
                <span className="text-sm text-muted-foreground">
                  ({tool._count?.reviews || 0})
                </span>
              </div>
            </div>
            
            {/* Description courte */}
            <p className="text-muted-foreground">
              {tool.description}
            </p>
            
            {/* Tags et catégories */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className={formatPricingType(tool.pricingType).className}>
                {formatPricingType(tool.pricingType).label}
              </Badge>
              
              {tool.categories?.map((item: any) => (
                <Link
                  key={item.categoryId}
                  href={`/categories/${item.category?.slug}`}
                >
                  <Badge variant="outline" className="flex items-center hover:bg-muted">
                    <span className="mr-1">{getCategoryEmoji(item.category?.slug)}</span>
                    {item.category?.name}
                  </Badge>
                </Link>
              ))}
            </div>
            
            {/* Réseaux sociaux */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted/60 hover:bg-muted transition-colors"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="md:col-span-3 flex flex-col space-y-3 items-center md:items-end">
            <Button asChild size="lg" className="w-full md:w-auto">
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Globe size={16} className="mr-2" />
                Visiter le site
              </a>
            </Button>
            
            {tool.hasAffiliateProgram && tool.affiliateUrl && (
              <Button asChild variant="outline" className="w-full md:w-auto">
                <a href={tool.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Programme d'affiliation
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 