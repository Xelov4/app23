import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    // Récupérer le prompt et la clé API de la requête
    const { prompt, apiKey, model: selectedModel = 'gemini-pro' } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Le prompt est requis' },
        { status: 400 }
      );
    }

    // Utiliser la clé API fournie ou celle de l'environnement
    const actualApiKey = apiKey || process.env.GOOGLE_GEMINI_API_KEY || '';
    
    if (!actualApiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non disponible' },
        { status: 400 }
      );
    }
    
    // Initialiser l'API avec la clé fournie
    const genAI = new GoogleGenerativeAI(actualApiKey);
    const model = genAI.getGenerativeModel({ model: selectedModel });

    // Configuration des paramètres de génération
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Générer du contenu avec Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Essayer de parser le texte en JSON
    try {
      // Chercher des délimiteurs JSON dans la réponse
      const jsonMatch = text.match(/({[\s\S]*})/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const jsonData = JSON.parse(jsonStr);
        return NextResponse.json(jsonData);
      }
      
      // Si aucun JSON n'est trouvé, retourner simplement le texte
      return NextResponse.json({ description: text });
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse JSON:', parseError);
      // Retourner le texte brut si le parsing échoue
      return NextResponse.json({ description: text });
    }
  } catch (error: any) {
    console.error('Erreur lors de la génération de contenu:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la génération de contenu' },
      { status: 500 }
    );
  }
} 