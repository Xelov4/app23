"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tool, Category, Tag, UseCase } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

// Type personnalisé pour l'outil avec relations
type ToolWithRelations = Tool & {
  CategoriesOnTools: {
    categoryId: string;
    Category: Category;
  }[];
  TagsOnTools: {
    tagId: string;
    Tag: Tag;
  }[];
  UseCasesOnTools: {
    useCaseId: string;
    UseCase: UseCase;
  }[];
};

interface EnrichToolFormProps {
  tool: ToolWithRelations;
  categories: Category[];
  tags: Tag[];
  useCases: UseCase[];
  selectedCategoryIds: string[];
  selectedTagIds: string[];
  selectedUseCaseIds: string[];
}

export default function EnrichToolForm({
  tool,
  categories,
  tags,
  useCases,
  selectedCategoryIds,
  selectedTagIds,
  selectedUseCaseIds,
}: EnrichToolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [crawlContent, setCrawlContent] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: tool.name,
    description: tool.description,
    pricingType: tool.pricingType,
    pricingDetails: tool.pricingDetails || "",
    features: tool.features,
    websiteUrl: tool.websiteUrl,
    logoUrl: tool.logoUrl || "",
    twitterUrl: tool.twitterUrl || "",
    instagramUrl: tool.instagramUrl || "",
    facebookUrl: tool.facebookUrl || "",
    linkedinUrl: tool.linkedinUrl || "",
    githubUrl: tool.githubUrl || "",
    selectedCategories: selectedCategoryIds,
    selectedTags: selectedTagIds,
    selectedUseCases: selectedUseCaseIds,
  });

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer les changements de checkbox pour les catégories
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          selectedCategories: [...prev.selectedCategories, categoryId],
        };
      } else {
        return {
          ...prev,
          selectedCategories: prev.selectedCategories.filter((id) => id !== categoryId),
        };
      }
    });
  };

  // Gérer les changements de checkbox pour les tags
  const handleTagChange = (tagId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          selectedTags: [...prev.selectedTags, tagId],
        };
      } else {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter((id) => id !== tagId),
        };
      }
    });
  };

  // Gérer les changements de checkbox pour les cas d'usage
  const handleUseCaseChange = (useCaseId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          selectedUseCases: [...prev.selectedUseCases, useCaseId],
        };
      } else {
        return {
          ...prev,
          selectedUseCases: prev.selectedUseCases.filter((id) => id !== useCaseId),
        };
      }
    });
  };

  // Crawler le site web de l'outil
  const handleCrawlWebsite = async () => {
    if (!formData.websiteUrl) {
      toast.error("L'URL du site web est requise pour le crawling");
      return;
    }

    try {
      setIsCrawling(true);
      setCrawlStatus("Démarrage du crawler...");

      const response = await fetch("/api/admin/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.websiteUrl,
          depth: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du crawling: ${response.statusText}`);
      }

      const data = await response.json();
      
      setCrawlContent(data.content);
      setCrawlStatus(`Crawling terminé: ${data.content.length} caractères récupérés`);
      
      // Lancer automatiquement l'enrichissement après le crawl
      if (data.content) {
        await handleEnrichWithAI(data.content);
      }
    } catch (error) {
      console.error("Erreur lors du crawling:", error);
      setCrawlStatus("Échec du crawling: " + (error as Error).message);
      toast.error("Échec du crawling");
    } finally {
      setIsCrawling(false);
    }
  };

  // Enrichir l'outil avec Gemini AI
  const handleEnrichWithAI = async (content: string) => {
    try {
      setIsEnriching(true);
      setCrawlStatus("Analyse en cours avec Gemini AI...");

      const prompt = `
Tu es un assistant spécialisé dans l'analyse d'outils d'IA pour la vidéo. Je vais te fournir le contenu texte d'un site web d'un outil IA qui aide à créer, éditer ou manipuler des vidéos.

Ta mission est d'analyser ce contenu et d'extraire des informations structurées pour compléter une fiche produit.

Voici les informations que tu dois retrouver dans le contenu fourni:

1. Nom de l'outil: Extrais le nom officiel de l'outil
2. Description détaillée: Rédige une description complète en français (environ 200-300 mots) expliquant ce que fait l'outil, ses fonctionnalités principales, et comment il utilise l'IA pour la vidéo
3. Type de prix ("FREE", "FREEMIUM", "PAID", "CONTACT"): Détermine le modèle de tarification
4. Détails de prix: Si disponible, extrais les informations détaillées sur les différents plans (en français)
5. Fonctionnalités: Liste les 3 à 8 fonctionnalités principales de l'outil au format texte simple, séparées par des points-virgules (;)
6. Liens sociaux: Trouve les liens vers Twitter/X, Instagram, Facebook, LinkedIn et GitHub si présents

Réponds en format JSON structuré comme suit:
{
  "name": "Nom de l'outil",
  "description": "Description détaillée en français...",
  "pricingType": "FREE/FREEMIUM/PAID/CONTACT",
  "pricingDetails": "Détails des prix en français...",
  "features": "Fonctionnalité 1; Fonctionnalité 2; Fonctionnalité 3",
  "twitterUrl": "url ou vide",
  "instagramUrl": "url ou vide",
  "facebookUrl": "url ou vide",
  "linkedinUrl": "url ou vide",
  "githubUrl": "url ou vide"
}

Voici le contenu du site web à analyser:
${content}
      `;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Gemini API: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      
      // Extraire le JSON de la réponse de Gemini
      const responseText = aiResponse.candidates[0].content.parts[0].text;
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const enrichedData = JSON.parse(jsonMatch[0]);
        
        // Mettre à jour le formulaire avec les données enrichies
        setFormData((prev) => ({
          ...prev,
          name: enrichedData.name || prev.name,
          description: enrichedData.description || prev.description,
          pricingType: enrichedData.pricingType || prev.pricingType,
          pricingDetails: enrichedData.pricingDetails || prev.pricingDetails,
          features: enrichedData.features || prev.features,
          twitterUrl: enrichedData.twitterUrl || prev.twitterUrl,
          instagramUrl: enrichedData.instagramUrl || prev.instagramUrl,
          facebookUrl: enrichedData.facebookUrl || prev.facebookUrl,
          linkedinUrl: enrichedData.linkedinUrl || prev.linkedinUrl,
          githubUrl: enrichedData.githubUrl || prev.githubUrl,
        }));
        
        setCrawlStatus("Enrichissement terminé avec succès!");
        toast.success("Données enrichies avec succès!");
      } else {
        throw new Error("Impossible d'extraire les données JSON de la réponse de l'IA");
      }
    } catch (error) {
      console.error("Erreur lors de l'enrichissement avec l'IA:", error);
      setCrawlStatus("Échec de l'enrichissement: " + (error as Error).message);
      toast.error("Échec de l'enrichissement avec l'IA");
    } finally {
      setIsEnriching(false);
    }
  };

  // Sauvegarder les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/tools/${tool.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoryIds: formData.selectedCategories,
          tagIds: formData.selectedTags,
          useCaseIds: formData.selectedUseCases,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.statusText}`);
      }

      toast.success("Outil mis à jour avec succès!");
      router.push("/admin/enrichir");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'outil:", error);
      toast.error("Échec de la mise à jour: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Informations de l'outil</h2>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCrawlWebsite}
              disabled={isCrawling || !formData.websiteUrl || isEnriching}
            >
              {isCrawling ? "Crawling en cours..." : "Crawl & Enrichir"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>

        {crawlStatus && (
          <div className="mb-6 p-4 border rounded-md bg-muted">
            <p className="font-medium">Statut: {crawlStatus}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nom de l'outil</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="websiteUrl">URL du site web</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">URL du logo</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pricingType">Type de tarification</Label>
            <select
              id="pricingType"
              name="pricingType"
              value={formData.pricingType}
              onChange={(e) => setFormData((prev) => ({ ...prev, pricingType: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors mt-1"
            >
              <option value="FREE">Gratuit</option>
              <option value="FREEMIUM">Freemium</option>
              <option value="PAID">Payant</option>
              <option value="CONTACT">Sur devis</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 min-h-[200px]"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="features">Fonctionnalités (séparées par ";")</Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="Fonction 1; Fonction 2; Fonction 3"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="pricingDetails">Détails de tarification</Label>
            <Textarea
              id="pricingDetails"
              name="pricingDetails"
              value={formData.pricingDetails}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-medium mb-4">Réseaux Sociaux</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="twitterUrl">Twitter/X</Label>
            <Input
              id="twitterUrl"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input
              id="facebookUrl"
              name="facebookUrl"
              value={formData.facebookUrl}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div>
            <Label htmlFor="githubUrl">GitHub</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6">Catégories, Tags et Cas d'Usage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-medium mb-3">Catégories</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto p-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={formData.selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Tags</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto p-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={formData.selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) =>
                      handleTagChange(tag.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="cursor-pointer"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Cas d'usage</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto p-2">
              {useCases.map((useCase) => (
                <div key={useCase.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`useCase-${useCase.id}`}
                    checked={formData.selectedUseCases.includes(useCase.id)}
                    onCheckedChange={(checked) =>
                      handleUseCaseChange(useCase.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`useCase-${useCase.id}`}
                    className="cursor-pointer"
                  >
                    {useCase.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 