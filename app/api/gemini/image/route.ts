import { NextRequest, NextResponse } from 'next/server';

// Regex pour valider une clé API Google
const API_KEY_REGEX = /^AIza[0-9A-Za-z_-]{35}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, instances, parameters } = body;

    // Validation
    if (!apiKey || !API_KEY_REGEX.test(apiKey)) {
      return NextResponse.json(
        { error: 'Clé API invalide' },
        { status: 400 }
      );
    }

    if (!model || !model.startsWith('imagen')) {
      return NextResponse.json(
        { error: 'Modèle Imagen requis' },
        { status: 400 }
      );
    }

    if (!instances || !Array.isArray(instances) || instances.length === 0) {
      return NextResponse.json(
        { error: 'Prompt requis pour la génération d\'image' },
        { status: 400 }
      );
    }

    // Vérifier le prompt
    if (!instances[0].prompt || typeof instances[0].prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt invalide' },
        { status: 400 }
      );
    }

    // Construction de la requête pour Imagen
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
    
    // Valider et préparer les paramètres
    const validParameters: any = {};

    if (parameters) {
      // Nombre d'images (1-4)
      if (parameters.sampleCount !== undefined) {
        const sampleCount = Number(parameters.sampleCount);
        if (!isNaN(sampleCount) && sampleCount >= 1 && sampleCount <= 4) {
          validParameters.sampleCount = sampleCount;
        } else {
          validParameters.sampleCount = 1;
        }
      }

      // Ratio d'aspect
      if (parameters.aspectRatio !== undefined) {
        const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
        if (validRatios.includes(parameters.aspectRatio)) {
          validParameters.aspectRatio = parameters.aspectRatio;
        }
      }
    }

    // Corps de la requête
    const requestBody = {
      instances: instances,
      parameters: Object.keys(validParameters).length > 0 ? validParameters : undefined
    };

    // Envoi de la requête à l'API Google
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Imagen:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'appel à l\'API Imagen', 
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur interne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 