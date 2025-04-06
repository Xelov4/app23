import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

// Définition des types pour éviter les problèmes
interface ToolWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  features: string;
  pricingType: string;
  pricingDetails: string | null;
  rating: number | null;
  reviewCount: number | null;
  httpCode: number | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  affiliateUrl: string | null;
  hasAffiliateProgram: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  httpChain: string | null;
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    }
  }>;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    }
  }>;
  FeaturesOnTools: Array<{
    feature: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }
  }>;
}

// GET /api/tools/[slug]
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    
    const tool = await db.tool.findUnique({
      where: { slug },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        },
        TagsOnTools: {
          include: {
            Tag: true
          }
        },
        FeaturesOnTools: {
          include: {
            Feature: true
          }
        },
        UserTypesOnTools: {
          include: {
            UserType: true
          }
        }
      }
    });

    if (!tool) {
      return NextResponse.json(
        { message: 'Outil non trouvé' },
        { status: 404 }
      );
    }
    
    // Transformer les relations en objets pour l'interface
    const categories = tool.CategoriesOnTools.map(cat => cat.Category);
    const tags = tool.TagsOnTools.map(t => t.Tag);
    const features = tool.FeaturesOnTools.map(f => f.Feature);
    const userTypes = tool.UserTypesOnTools.map(ut => ut.UserType);
    
    // Supprimer les relations directes pour éviter la duplication
    const { CategoriesOnTools, TagsOnTools, FeaturesOnTools, UserTypesOnTools, ...toolData } = tool;
    
    // Renvoyer l'outil avec les relations formatées
    return NextResponse.json({
      ...toolData,
      categories,
      tags,
      features,
      userTypes
    });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/tools/[slug]
export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    const data = await request.json();
    
    console.log('Mise à jour de l\'outil:', slug, data);
    
    // Vérifier si l'outil existe
    const existingTool = await db.tool.findUnique({
      where: { slug },
    });

    if (!existingTool) {
      return NextResponse.json(
        { error: "Outil non trouvé" },
        { status: 404 }
      );
    }

    // Créer un objet avec uniquement les champs fournis
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
    if (data.pricingType !== undefined) updateData.pricingType = data.pricingType;
    if (data.pricingDetails !== undefined) updateData.pricingDetails = data.pricingDetails;
    
    // Gestion améliorée des features (fonctionnalités personnalisées stockées en JSON)
    if (data.features !== undefined) {
      // Si c'est déjà une chaîne, la conserver
      if (typeof data.features === 'string') {
        // Si la chaîne contient des caractères ';', on la traite comme une liste de fonctionnalités
        if (data.features.includes(';')) {
          // Convertir en tableau puis en JSON
          const featuresArray = data.features.split(';').map((item: string) => item.trim()).filter((item: string) => item);
          updateData.features = JSON.stringify(featuresArray);
        } else {
          // Sinon, on vérifie si c'est déjà un JSON valide
          try {
            JSON.parse(data.features);
            // Si pas d'erreur, c'est un JSON valide, on le garde tel quel
            updateData.features = data.features;
          } catch (e) {
            // Ce n'est pas un JSON valide, on le convertit en tableau d'un seul élément
            updateData.features = JSON.stringify([data.features]);
          }
        }
      } else if (Array.isArray(data.features)) {
        // Si c'est un tableau, le convertir en JSON
        updateData.features = JSON.stringify(data.features);
      } else {
        // Fallback: si c'est autre chose, essayez de le transformer en chaîne
        updateData.features = JSON.stringify([String(data.features)]);
      }
    }
    
    if (data.httpCode !== undefined) updateData.httpCode = data.httpCode;
    if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl;
    if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl;
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl;
    if (data.appStoreUrl !== undefined) updateData.appStoreUrl = data.appStoreUrl;
    if (data.playStoreUrl !== undefined) updateData.playStoreUrl = data.playStoreUrl;
    if (data.affiliateUrl !== undefined) updateData.affiliateUrl = data.affiliateUrl;
    if (data.hasAffiliateProgram !== undefined) updateData.hasAffiliateProgram = data.hasAffiliateProgram;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    
    console.log('Données de mise à jour:', updateData);

    // Mettre à jour l'outil
    const updatedTool = await db.tool.update({
      where: { id: existingTool.id },
      data: {
        ...updateData,
        // Mettre à jour les relations avec les fonctionnalités prédéfinies
        ...(data.featuresIds ? {
          FeaturesOnTools: {
            deleteMany: {},
            create: data.featuresIds.map((featureId: string) => ({
              Feature: {
                connect: { id: featureId }
              }
            }))
          }
        } : {}),
        // Mettre à jour les relations avec les tags
        ...(data.tagsIds ? {
          TagsOnTools: {
            deleteMany: {},
            create: data.tagsIds.map((tagId: string) => ({
              Tag: {
                connect: { id: tagId }
              }
            }))
          }
        } : {}),
        // Mettre à jour les relations avec les types d'utilisateurs
        ...(data.userTypesIds ? {
          UserTypesOnTools: {
            deleteMany: {},
            create: data.userTypesIds.map((userTypeId: string) => ({
              UserType: {
                connect: { id: userTypeId }
              }
            }))
          }
        } : {}),
        // Utiliser customFeatures comme liste de fonctionnalités si fourni
        ...(data.customFeatures ? { features: JSON.stringify(data.customFeatures) } : {})
      },
      include: {
        TagsOnTools: {
          include: {
            Tag: true
          }
        },
        FeaturesOnTools: {
          include: {
            Feature: true
          }
        },
        UserTypesOnTools: {
          include: {
            UserType: true
          }
        }
      }
    });

    console.log('Outil mis à jour avec succès:', updatedTool);

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'outil:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'outil" },
      { status: 500 }
    );
  }
}

// PATCH /api/tools/[slug]
export async function PATCH(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    // Vérifier l'authentification - rendre facultative mais vérifier si administrateur
    const session = await getServerSession(authOptions);
    
    // Seul un utilisateur connecté peut modifier
    if (!session) {
      // Pour le développement et les tests, autoriser les requêtes sans authentification
      if (process.env.NODE_ENV === 'development') {
        console.log("Mode développement - authentification ignorée");
      } else {
        // En production, exiger l'authentification
        return NextResponse.json(
          { error: "Non autorisé" },
          { status: 401 }
        );
      }
    }

    const slug = params.slug;
    const requestData = await request.json();
    
    console.log("Données reçues pour mise à jour:", requestData);
    
    // Vérifier si le slug est un UUID (ID d'outil) plutôt qu'un slug textuel
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^[a-z0-9]{24,36}$/.test(slug);
    
    // Chercher l'outil par ID ou par slug selon le cas
    let existingTool;
    if (isUuid) {
      existingTool = await db.tool.findUnique({
        where: { id: slug }
      });
      console.log(`Recherche de l'outil par ID: ${slug}`);
    } else {
      existingTool = await db.tool.findUnique({
        where: { slug }
      });
      console.log(`Recherche de l'outil par slug: ${slug}`);
    }
    
    if (!existingTool) {
      console.error(`Outil non trouvé pour ${isUuid ? 'ID' : 'slug'}: ${slug}`);
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 });
    }

    console.log(`Outil trouvé: ${existingTool.id} (${existingTool.name})`);

    // Extraire les champs qui nous intéressent en vérifiant qu'ils sont dans le modèle
    // Commençons par les champs simples (non-relations)
    const validFields = [
      'name', 'description', 'detailedDescription', 'websiteUrl', 'pricingType', 'pricingDetails',
      'logoUrl', 'twitterUrl', 'instagramUrl', 'facebookUrl', 'linkedinUrl',
      'githubUrl', 'youtubeUrl', 'appStoreUrl', 'playStoreUrl', 'affiliateUrl',
      'hasAffiliateProgram', 'isActive', 'httpCode', 'httpChain', 'rating', 'reviewCount', 
      'metaDescription'
    ];
    
    // Extraire les champs de base valides
    const baseData: Record<string, any> = {};
    for (const field of validFields) {
      if (field in requestData && requestData[field] !== undefined) {
        baseData[field] = requestData[field];
      }
    }
    
    // Journaliser les champs détectés pour le débogage
    console.log("Champs détectés dans la requête:", Object.keys(requestData).join(", "));
    console.log("Champs valides pour mise à jour:", Object.keys(baseData).join(", "));
    
    // Vérifier spécifiquement si detailedDescription est présent et correctement traité
    if (requestData.detailedDescription !== undefined) {
      console.log("detailedDescription trouvé:", requestData.detailedDescription.substring(0, 100) + "...");
    }
    
    // Gérer le slug si le nom a changé
    if (requestData.name !== undefined && requestData.name !== existingTool.name) {
      baseData.slug = slugify(requestData.name, { lower: true, strict: true });
    }
    
    // Extraire les relations comme un objet séparé
    const { tags = [], features = [], userTypes = [], categories = [], pros = [], cons = [] } = requestData;
    
    // Préparation des données pour l'update dans Prisma
    const updateData: Record<string, any> = {
      ...baseData
    };
    
    // Ajouter les relations seulement si elles sont présentes dans la requête
    if (tags.length > 0) {
      updateData.TagsOnTools = {
        deleteMany: {},
        create: tags.map((tagId: string) => ({
          tagId
        }))
      };
    }
    
    if (features.length > 0) {
      updateData.FeaturesOnTools = {
        deleteMany: {},
        create: features.map((featureId: string) => ({
          featureId
        }))
      };
    }
    
    if (userTypes.length > 0) {
      updateData.UserTypesOnTools = {
        deleteMany: {},
        create: userTypes.map((userTypeId: string) => ({
          userTypeId
        }))
      };
    }
    
    if (categories.length > 0) {
      updateData.CategoriesOnTools = {
        deleteMany: {},
        create: categories.map((categoryId: string) => ({
          categoryId
        }))
      };
    }
    
    console.log("Données nettoyées pour mise à jour:", updateData);
    
    // Mettre à jour l'outil par son ID pour plus de sécurité
    const updatedTool = await db.tool.update({
      where: { id: existingTool.id },
      data: updateData
    });
    
    console.log(`Outil mis à jour avec succès: ${updatedTool.id} (${updatedTool.name})`);
    
    return NextResponse.json({ 
      message: 'Outil mis à jour avec succès',
      tool: updatedTool 
    });
    
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE /api/tools/[slug]
export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const slug = params.slug;
    
    // Vérifier si l'outil existe
    const existingTool = await db.tool.findUnique({
      where: { slug }
    });
    
    if (!existingTool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 });
    }
    
    // Supprimer l'outil
    await db.tool.delete({
      where: { slug }
    });
    
    return NextResponse.json({ message: 'Outil supprimé avec succès' });
    
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 