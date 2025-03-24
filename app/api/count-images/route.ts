import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/count-images - Compte le nombre d'images dans le dossier public/images/tools
export async function GET(request: NextRequest) {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'tools');
    
    // Vérifier si le dossier existe
    try {
      await fs.access(imagesDir);
    } catch (error) {
      // Si le dossier n'existe pas, retourner 0
      return NextResponse.json({ count: 0 });
    }
    
    // Lire le contenu du dossier
    const files = await fs.readdir(imagesDir);
    
    // Filtrer uniquement les fichiers image
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    });
    
    return NextResponse.json({ count: imageFiles.length });
  } catch (error) {
    console.error('Erreur lors du comptage des images:', error);
    return NextResponse.json(
      { message: 'Erreur lors du comptage des images' },
      { status: 500 }
    );
  }
} 