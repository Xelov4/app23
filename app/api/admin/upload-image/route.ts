import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la requête est multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type doit être multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier n\'a été fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }

    // Limiter la taille du fichier (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max: 5 MB)' }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const fileExt = file.type.split('/')[1];
    const fileName = `${nanoid()}.${fileExt}`;
    
    // Créer le répertoire s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Chemin complet du fichier
    const filePath = path.join(uploadDir, fileName);
    
    // Lire le contenu du fichier
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Écrire le fichier
    await writeFile(filePath, fileBuffer);
    
    // URL relative pour stocker en base de données
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image:', error);
    return NextResponse.json({ error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
  }
} 