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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

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

// Clé API Gemini (idéalement à stocker comme variable d'environnement)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA";

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
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("form");
  const logsEndRef = React.useRef<HTMLDivElement>(null);

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

  // Fonction pour ajouter un log au processus
  const addProcessLog = (message: string) => {
    setProcessLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
    
    // Faire défiler automatiquement vers le bas pour voir les nouveaux logs
    setTimeout(() => {
      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

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
      setProcessLogs([]);
      addProcessLog("Démarrage du crawling...");
      setActiveTab("logs");

      const response = await fetch("/api/admin/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.websiteUrl,
          depth: 2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du crawling: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error === 'DNS_ERROR') {
        setCrawlStatus("Erreur : Le domaine n'est pas résolvable");
        addProcessLog("❌ Erreur : Le domaine n'est pas résolvable");
        toast.error("Le domaine n'est pas résolvable. Vérifiez l'URL et réessayez.");
        return;
      }

      if (data.error === 'CRAWL_ERROR') {
        setCrawlStatus("Erreur lors du crawling : " + data.message);
        addProcessLog(`❌ Erreur lors du crawling : ${data.message}`);
        toast.error("Échec du crawling. Vérifiez l'URL et réessayez.");
        return;
      }
      
      setCrawlContent(data.content);
      addProcessLog(`✅ Crawling terminé : ${data.content.length} caractères récupérés`);
      
      // Analyser les détails du processus dans le contenu (les premières lignes)
      if (data.content) {
        const contentLines = data.content.split('\n');
        let processSummaryLines = [];
        
        // Extraire les premières lignes qui contiennent les détails du processus
        for (let i = 0; i < Math.min(50, contentLines.length); i++) {
          const line = contentLines[i].trim();
          if (line.startsWith('[Profondeur') || line.includes('URLs visitées') || line.includes('liens sociaux')) {
            processSummaryLines.push(line);
            addProcessLog(line);
          }
        }
      }
      
      // Mettre à jour automatiquement les liens des réseaux sociaux si trouvés
      if (data.externalLinks && Array.isArray(data.externalLinks)) {
        let updatedForm = { ...formData };
        let linksFound = 0;
        
        data.externalLinks.forEach(link => {
          try {
            const url = new URL(link);
            const hostname = url.hostname.toLowerCase();
            
            if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
              updatedForm.twitterUrl = link;
              addProcessLog(`✅ Lien Twitter trouvé : ${link}`);
              linksFound++;
            } else if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
              updatedForm.facebookUrl = link;
              addProcessLog(`✅ Lien Facebook trouvé : ${link}`);
              linksFound++;
            } else if (hostname.includes('instagram.com')) {
              updatedForm.instagramUrl = link;
              addProcessLog(`✅ Lien Instagram trouvé : ${link}`);
              linksFound++;
            } else if (hostname.includes('linkedin.com')) {
              updatedForm.linkedinUrl = link;
              addProcessLog(`✅ Lien LinkedIn trouvé : ${link}`);
              linksFound++;
            } else if (hostname.includes('github.com')) {
              updatedForm.githubUrl = link;
              addProcessLog(`✅ Lien GitHub trouvé : ${link}`);
              linksFound++;
            }
          } catch (error) {
            // Ignorer les URLs invalides
          }
        });
        
        if (linksFound > 0) {
          setFormData(updatedForm);
          setCrawlStatus(`Crawling terminé : ${data.content.length} caractères récupérés, ${linksFound} liens sociaux détectés et mis à jour`);
          toast.success(`${linksFound} liens sociaux ont été mis à jour automatiquement`);
        } else {
          setCrawlStatus(`Crawling terminé : ${data.content.length} caractères récupérés`);
        }
      } else {
        setCrawlStatus(`Crawling terminé : ${data.content.length} caractères récupérés`);
      }
      
      // Lancer automatiquement l'enrichissement après le crawl
      if (data.content) {
        addProcessLog("🤖 Démarrage de l'analyse avec Gemini AI...");
        await handleEnrichWithAI(data.content, data.externalLinks || []);
      }
    } catch (error) {
      console.error("Erreur lors du crawling:", error);
      setCrawlStatus("Échec du crawling : " + (error as Error).message);
      addProcessLog(`❌ Échec du crawling : ${(error as Error).message}`);
      toast.error("Échec du crawling");
    } finally {
      setIsCrawling(false);
    }
  };

  // Enrichir l'outil avec Gemini AI
  const handleEnrichWithAI = async (content: string, externalLinks: string[] = []) => {
    try {
      setIsEnriching(true);
      setCrawlStatus("Analyse en cours avec Gemini AI...");
      addProcessLog("📝 Préparation des données pour l'analyse IA...");

      // Préparation des données de catégories pour l'IA
      const selectedCategoriesInfo = categories
        .filter(cat => formData.selectedCategories.includes(cat.id))
        .map(cat => cat.name);
      
      const allCategoriesNames = categories.map(cat => cat.name);
      addProcessLog(`📋 Catégories actuelles : ${selectedCategoriesInfo.length > 0 ? selectedCategoriesInfo.join(', ') : 'Aucune'}`);
      
      // Préparation des données de tags pour l'IA
      const selectedTagsInfo = tags
        .filter(tag => formData.selectedTags.includes(tag.id))
        .map(tag => tag.name);
      
      const allTagsNames = tags.map(tag => tag.name);
      addProcessLog(`🏷️ Tags actuels : ${selectedTagsInfo.length > 0 ? selectedTagsInfo.join(', ') : 'Aucun'}`);
      
      // Préparation des données de cas d'usage pour l'IA
      const selectedUseCasesInfo = useCases
        .filter(uc => formData.selectedUseCases.includes(uc.id))
        .map(uc => uc.name);
      
      const allUseCasesNames = useCases.map(uc => uc.name);
      addProcessLog(`📋 Cas d'usage actuels : ${selectedUseCasesInfo.length > 0 ? selectedUseCasesInfo.join(', ') : 'Aucun'}`);
      
      // Formatage des liens externes pour le prompt
      const socialLinksSection = externalLinks.length > 0 
        ? `\nLiens externes trouvés pendant le crawling (probablement des réseaux sociaux):\n${externalLinks.join('\n')}`
        : '';

      addProcessLog(`🔍 Envoi de la requête à Gemini AI (${Math.round(content.length / 1000)}K caractères)...`);

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

IMPORTANT - Catégorisation:
Tu dois également analyser et proposer la meilleure catégorisation pour cet outil.

Catégories actuellement sélectionnées: ${selectedCategoriesInfo.length > 0 ? selectedCategoriesInfo.join(', ') : 'Aucune'}
Liste de toutes les catégories disponibles: ${allCategoriesNames.join(', ')}

Tags actuellement sélectionnés: ${selectedTagsInfo.length > 0 ? selectedTagsInfo.join(', ') : 'Aucun'}
Liste de tous les tags disponibles: ${allTagsNames.join(', ')}

Cas d'usage actuellement sélectionnés: ${selectedUseCasesInfo.length > 0 ? selectedUseCasesInfo.join(', ') : 'Aucun'}
Liste de tous les cas d'usage disponibles: ${allUseCasesNames.join(', ')}

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
  "githubUrl": "url ou vide",
  "recommendedCategories": ["nom de la catégorie 1", "nom de la catégorie 2"],
  "recommendedTags": ["nom du tag 1", "nom du tag 2", "nom du tag 3"],
  "recommendedUseCases": ["nom du cas d'usage 1", "nom du cas d'usage 2"]
}

Voici le contenu du site web à analyser:${socialLinksSection}

${content}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

      addProcessLog("✅ Réponse reçue de Gemini AI");
      const aiResponse = await response.json();
      
      // Extraire le JSON de la réponse de Gemini
      const responseText = aiResponse.candidates[0].content.parts[0].text;
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        addProcessLog("🔍 Analyse des données extraites par l'IA...");
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
        
        addProcessLog("✅ Données de base mises à jour");
        
        // Mise à jour des catégories recommandées
        if (enrichedData.recommendedCategories && Array.isArray(enrichedData.recommendedCategories)) {
          const recommendedCategoryIds: string[] = [];
          
          addProcessLog(`🤖 L'IA recommande les catégories : ${enrichedData.recommendedCategories.join(', ')}`);
          
          enrichedData.recommendedCategories.forEach((categoryName: string) => {
            const category = categories.find(c => 
              c.name.toLowerCase() === categoryName.toLowerCase() ||
              c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
              categoryName.toLowerCase().includes(c.name.toLowerCase())
            );
            
            if (category) {
              recommendedCategoryIds.push(category.id);
              addProcessLog(`  ✓ Correspondance trouvée : "${categoryName}" → "${category.name}"`);
            } else {
              addProcessLog(`  ✗ Aucune correspondance trouvée pour la catégorie "${categoryName}"`);
            }
          });
          
          if (recommendedCategoryIds.length > 0) {
            setFormData(prev => ({
              ...prev,
              selectedCategories: [...new Set([...prev.selectedCategories, ...recommendedCategoryIds])]
            }));
            
            toast.success(`${recommendedCategoryIds.length} catégorie(s) mise(s) à jour selon l'analyse AI`);
          }
        }
        
        // Mise à jour des tags recommandés
        if (enrichedData.recommendedTags && Array.isArray(enrichedData.recommendedTags)) {
          const recommendedTagIds: string[] = [];
          
          addProcessLog(`🤖 L'IA recommande les tags : ${enrichedData.recommendedTags.join(', ')}`);
          
          enrichedData.recommendedTags.forEach((tagName: string) => {
            const tag = tags.find(t => 
              t.name.toLowerCase() === tagName.toLowerCase() ||
              t.name.toLowerCase().includes(tagName.toLowerCase()) ||
              tagName.toLowerCase().includes(t.name.toLowerCase())
            );
            
            if (tag) {
              recommendedTagIds.push(tag.id);
              addProcessLog(`  ✓ Correspondance trouvée : "${tagName}" → "${tag.name}"`);
            } else {
              addProcessLog(`  ✗ Aucune correspondance trouvée pour le tag "${tagName}"`);
            }
          });
          
          if (recommendedTagIds.length > 0) {
            setFormData(prev => ({
              ...prev,
              selectedTags: [...new Set([...prev.selectedTags, ...recommendedTagIds])]
            }));
            
            toast.success(`${recommendedTagIds.length} tag(s) mis à jour selon l'analyse AI`);
          }
        }
        
        // Mise à jour des cas d'usage recommandés
        if (enrichedData.recommendedUseCases && Array.isArray(enrichedData.recommendedUseCases)) {
          const recommendedUseCaseIds: string[] = [];
          
          addProcessLog(`🤖 L'IA recommande les cas d'usage : ${enrichedData.recommendedUseCases.join(', ')}`);
          
          enrichedData.recommendedUseCases.forEach((useCaseName: string) => {
            const useCase = useCases.find(uc => 
              uc.name.toLowerCase() === useCaseName.toLowerCase() ||
              uc.name.toLowerCase().includes(useCaseName.toLowerCase()) ||
              useCaseName.toLowerCase().includes(uc.name.toLowerCase())
            );
            
            if (useCase) {
              recommendedUseCaseIds.push(useCase.id);
              addProcessLog(`  ✓ Correspondance trouvée : "${useCaseName}" → "${useCase.name}"`);
            } else {
              addProcessLog(`  ✗ Aucune correspondance trouvée pour le cas d'usage "${useCaseName}"`);
            }
          });
          
          if (recommendedUseCaseIds.length > 0) {
            setFormData(prev => ({
              ...prev,
              selectedUseCases: [...new Set([...prev.selectedUseCases, ...recommendedUseCaseIds])]
            }));
            
            toast.success(`${recommendedUseCaseIds.length} cas d'usage mis à jour selon l'analyse AI`);
          }
        }
        
        setCrawlStatus("Enrichissement terminé avec succès!");
        addProcessLog("✅ Enrichissement terminé avec succès!");
        addProcessLog("🎉 Vous pouvez maintenant revoir et enregistrer les modifications");
        toast.success("Données enrichies avec succès!");
        setActiveTab("form");
      } else {
        throw new Error("Impossible d'extraire les données JSON de la réponse de l'IA");
      }
    } catch (error) {
      console.error("Erreur lors de l'enrichissement avec l'IA:", error);
      setCrawlStatus("Échec de l'enrichissement: " + (error as Error).message);
      addProcessLog(`❌ Échec de l'enrichissement: ${(error as Error).message}`);
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
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Informations de l'outil</h2>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCrawlWebsite}
              disabled={isCrawling || !formData.websiteUrl || isEnriching}
              className="gap-2"
            >
              {isCrawling || isEnriching ? (
                <>
                  <Spinner size="sm" />
                  {isCrawling ? "Crawling en cours..." : "Analyse en cours..."}
                </>
              ) : (
                "Crawler & Enrichir"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setActiveTab(activeTab === "logs" ? "form" : "logs")}
            >
              {activeTab === "logs" ? "Voir le formulaire" : "Voir les logs"}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        {crawlStatus && (
          <div className="mb-6 p-4 border rounded-md bg-muted">
            <p className="font-medium">Statut: {crawlStatus}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Formulaire</TabsTrigger>
            <TabsTrigger value="logs">Logs du processus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <form onSubmit={handleSubmit} className="space-y-6">
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
            </form>
          </TabsContent>
          
          <TabsContent value="logs">
            <ScrollArea className="h-[500px] border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
              {processLogs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun log à afficher. Lancez le crawling pour voir le processus en détail.
                </div>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {processLogs.map((log, index) => (
                    <div key={index} className="py-1">
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
    </div>
  );
} 