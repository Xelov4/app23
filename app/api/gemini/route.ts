import { NextRequest, NextResponse } from 'next/server';

// Regex pour valider une clé API Google
const API_KEY_REGEX = /^AIza[0-9A-Za-z_-]{35}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, prompt, temperature, maxOutputTokens, files } = body;

    // Validation
    if (!apiKey || !API_KEY_REGEX.test(apiKey)) {
      return NextResponse.json(
        { error: 'Clé API invalide' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Modèle requis' },
        { status: 400 }
      );
    }

    if (!prompt && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt ou fichiers requis' },
        { status: 400 }
      );
    }

    // Construction de la requête en fonction du modèle
    let endpoint = '';
    let requestBody = {};

    if (model.startsWith('gemini')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
              // Les fichiers seraient intégrés ici dans une implémentation complète
            ]
          }
        ],
        generationConfig: {
          temperature: temperature || 0.7,
          maxOutputTokens: maxOutputTokens || 2048,
        }
      };
    } else if (model.startsWith('imagen')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature || 0.4,
        }
      };
    } else {
      return NextResponse.json(
        { error: 'Modèle non supporté' },
        { status: 400 }
      );
    }

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
      console.error('Erreur API Gemini:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'appel à l\'API Gemini', 
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