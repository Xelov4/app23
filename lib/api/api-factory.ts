import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export type ModelConfig = {
  model: string;  // Nom du modèle Prisma (ex: 'tool', 'category')
  includes?: Record<string, any>; // Relations à inclure
  orderBy?: Record<string, 'asc' | 'desc'>; // Tri par défaut
  formatResponse?: (data: any) => any;  // Formatage de réponse personnalisé
  uniqueFields?: string[]; // Champs uniques à vérifier lors de la création/mise à jour
};

/**
 * Factory pour créer un gestionnaire CRUD pour n'importe quel modèle
 */
export function createCRUDHandler(config: ModelConfig) {
  const { model, includes = {}, orderBy = {}, formatResponse, uniqueFields = [] } = config;
  
  // Vérifier que le modèle existe dans l'instance Prisma
  if (!(model in db)) {
    throw new Error(`Le modèle '${model}' n'existe pas dans l'instance Prisma`);
  }

  // Récupérer tous les éléments (GET)
  async function handleGetAll(request: NextRequest) {
    try {
      // Récupérer les paramètres de requête
      const url = new URL(request.url);
      const limit = url.searchParams.get('limit') 
        ? parseInt(url.searchParams.get('limit') as string) 
        : undefined;
      const offset = url.searchParams.get('offset') 
        ? parseInt(url.searchParams.get('offset') as string) 
        : undefined;
      
      // Construire les options de requête
      const options: any = {
        include: includes,
        orderBy: Object.keys(orderBy).length ? orderBy : undefined,
      };
      
      // Ajouter la pagination si nécessaire
      if (limit !== undefined) {
        options.take = limit;
        
        if (offset !== undefined) {
          options.skip = offset;
        }
      }
      
      // Exécuter la requête
      const items = await (db as any)[model].findMany(options);
      
      // Formater la réponse si nécessaire
      const formattedItems = formatResponse ? items.map(formatResponse) : items;
      
      return NextResponse.json(formattedItems);
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${model}:`, error);
      return NextResponse.json(
        { message: `Erreur lors de la récupération des ${model}` },
        { status: 500 }
      );
    }
  }
  
  // Récupérer un élément par ID (GET /:id)
  async function handleGetById(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      
      const item = await (db as any)[model].findUnique({
        where: { id },
        include: includes,
      });
      
      if (!item) {
        return NextResponse.json(
          { message: `${model} non trouvé` },
          { status: 404 }
        );
      }
      
      const formattedItem = formatResponse ? formatResponse(item) : item;
      
      return NextResponse.json(formattedItem);
    } catch (error) {
      console.error(`Erreur lors de la récupération du ${model}:`, error);
      return NextResponse.json(
        { message: `Erreur lors de la récupération du ${model}` },
        { status: 500 }
      );
    }
  }
  
  // Créer un nouvel élément (POST)
  async function handleCreate(request: NextRequest) {
    try {
      const body = await request.json();
      
      // Vérifier les champs uniques
      for (const field of uniqueFields) {
        if (body[field]) {
          const exists = await (db as any)[model].findUnique({
            where: { [field]: body[field] },
          });
          
          if (exists) {
            return NextResponse.json(
              { message: `Un ${model} avec ce ${field} existe déjà` },
              { status: 400 }
            );
          }
        }
      }
      
      // Créer l'élément
      const newItem = await (db as any)[model].create({
        data: body,
        include: includes,
      });
      
      const formattedItem = formatResponse ? formatResponse(newItem) : newItem;
      
      return NextResponse.json(formattedItem, { status: 201 });
    } catch (error) {
      console.error(`Erreur lors de la création du ${model}:`, error);
      return NextResponse.json(
        { message: `Erreur lors de la création du ${model}` },
        { status: 500 }
      );
    }
  }
  
  // Mettre à jour un élément (PUT /:id)
  async function handleUpdate(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const body = await request.json();
      
      // Vérifier que l'élément existe
      const exists = await (db as any)[model].findUnique({
        where: { id },
      });
      
      if (!exists) {
        return NextResponse.json(
          { message: `${model} non trouvé` },
          { status: 404 }
        );
      }
      
      // Vérifier les champs uniques
      for (const field of uniqueFields) {
        if (body[field] && body[field] !== exists[field]) {
          const fieldExists = await (db as any)[model].findUnique({
            where: { [field]: body[field] },
          });
          
          if (fieldExists) {
            return NextResponse.json(
              { message: `Un ${model} avec ce ${field} existe déjà` },
              { status: 400 }
            );
          }
        }
      }
      
      // Mettre à jour l'élément
      const updatedItem = await (db as any)[model].update({
        where: { id },
        data: body,
        include: includes,
      });
      
      const formattedItem = formatResponse ? formatResponse(updatedItem) : updatedItem;
      
      return NextResponse.json(formattedItem);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du ${model}:`, error);
      return NextResponse.json(
        { message: `Erreur lors de la mise à jour du ${model}` },
        { status: 500 }
      );
    }
  }
  
  // Supprimer un élément (DELETE /:id)
  async function handleDelete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      
      // Vérifier que l'élément existe
      const exists = await (db as any)[model].findUnique({
        where: { id },
      });
      
      if (!exists) {
        return NextResponse.json(
          { message: `${model} non trouvé` },
          { status: 404 }
        );
      }
      
      // Supprimer l'élément
      await (db as any)[model].delete({
        where: { id },
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`Erreur lors de la suppression du ${model}:`, error);
      return NextResponse.json(
        { message: `Erreur lors de la suppression du ${model}` },
        { status: 500 }
      );
    }
  }
  
  return {
    GET: handleGetAll,
    getById: handleGetById,
    POST: handleCreate,
    PUT: handleUpdate,
    DELETE: handleDelete,
  };
} 