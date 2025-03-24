import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// POST /api/purge-images - Supprime toutes les images du dossier public/images/tools
export async function POST(request: NextRequest) {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'tools');
    
    // Vérifier si le dossier existe
    try {
      await fs.access(imagesDir);
    } catch (error) {
      // Si le dossier n'existe pas, le créer et retourner succès
      await fs.mkdir(imagesDir, { recursive: true });
      return NextResponse.json({ success: true, message: 'Aucune image à supprimer' });
    }
    
    // Lire le contenu du dossier
    const files = await fs.readdir(imagesDir);
    
    // Supprimer chaque fichier
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const stat = await fs.stat(filePath);
      
      // S'assurer que c'est un fichier et non un répertoire
      if (stat.isFile()) {
        await fs.unlink(filePath);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${files.length} images supprimées avec succès` 
    });
  } catch (error) {
    console.error('Erreur lors de la purge des images:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la purge des images' },
      { status: 500 }
    );
  }
} 