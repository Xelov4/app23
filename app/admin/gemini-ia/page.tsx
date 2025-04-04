'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  Bot, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Loader2,
  Settings,
  Download,
  Upload,
  Trash,
  Plus,
  Mic,
  Video,
  Search,
  Code,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Pencil
} from 'lucide-react';
import Image from 'next/image';

// Types pour les fonctionnalités disponibles
type FeatureType = 
  | 'text-generation'
  | 'image-generation'
  | 'image-editing'
  | 'multimodal-qa'
  | 'search-grounding';

interface Feature {
  id: FeatureType;
  name: string;
  description: string;
  icon: React.ReactNode;
  compatibleModels: string[];
}

// Types pour les différents modèles et leurs capacités
interface ModelCapabilities {
  inputTypes: string[];
  outputTypes: string[];
  maxInputTokens: number;
  maxOutputTokens: number;
  features: string[];
}

interface Model {
  id: string;
  name: string;
  description: string;
  capabilities: ModelCapabilities;
}

// Type pour les messages dans la conversation
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    pdfUrl?: string;
  };
  timestamp: Date;
}

export default function GeminiIAPage() {
  // Fonctionnalité sélectionnée
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>('text-generation');
  
  // API Key
  const [apiKey, setApiKey] = useState<string>('AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA');
  
  // Modèle sélectionné
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');
  
  // État pour le prompt et les fichiers
  const [prompt, setPrompt] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Conversation
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Options de configuration
  const [useGrounding, setUseGrounding] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(2048);
  const [streaming, setStreaming] = useState<boolean>(true);
  
  // Options de génération d'image
  const [imageCount, setImageCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  
  // UI state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Liste des fonctionnalités disponibles
  const features: Feature[] = [
    {
      id: 'text-generation',
      name: 'Génération de texte',
      description: 'Générer du texte à partir de prompts textuels, compatible avec les grands contextes',
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      compatibleModels: ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro']
    },
    {
      id: 'image-generation',
      name: 'Génération d\'images',
      description: 'Créer des images à partir de descriptions textuelles',
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      compatibleModels: ['gemini-2.0-flash-exp-image-generation', 'imagen-3.0-generate-002']
    },
    {
      id: 'image-editing',
      name: 'Édition d\'images',
      description: 'Modifier des images existantes avec des instructions textuelles',
      icon: <Pencil className="h-5 w-5 text-green-500" />,
      compatibleModels: ['gemini-2.0-flash-exp-image-generation']
    },
    {
      id: 'multimodal-qa',
      name: 'Questions sur contenu multimodal',
      description: 'Analyser et répondre à des questions sur des images, vidéos ou audios',
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      compatibleModels: ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro']
    },
    {
      id: 'search-grounding',
      name: 'Ancrage avec Google Search',
      description: 'Utiliser Google Search pour obtenir des réponses factuelles et à jour',
      icon: <Search className="h-5 w-5 text-red-500" />,
      compatibleModels: ['gemini-2.0-flash', 'gemini-1.5-flash']
    }
  ];

  // Liste des modèles disponibles
  const models: Model[] = [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Notre modèle le plus puissant en matière de réflexion, avec une précision de réponse maximale',
      capabilities: {
        inputTypes: ['audio', 'image', 'video', 'text'],
        outputTypes: ['text'],
        maxInputTokens: 1048576,
        maxOutputTokens: 65536,
        features: ['structured-output', 'function-calling', 'code-execution', 'search-grounding', 'thinking']
      }
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Notre modèle multimodal le plus récent, avec des fonctionnalités de nouvelle génération',
      capabilities: {
        inputTypes: ['audio', 'image', 'video', 'text'],
        outputTypes: ['text', 'image'],
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        features: ['structured-output', 'function-calling', 'code-execution', 'search-grounding', 'image-generation', 'thinking']
      }
    },
    {
      id: 'gemini-2.0-flash-exp-image-generation',
      name: 'Gemini 2.0 Flash (Image Gen)',
      description: 'Version expérimentale optimisée pour la génération d\'images',
      capabilities: {
        inputTypes: ['image', 'text'],
        outputTypes: ['text', 'image'],
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        features: ['image-generation', 'image-editing']
      }
    },
    {
      id: 'gemini-2.0-flash-lite',
      name: 'Gemini 2.0 Flash-Lite',
      description: 'Un modèle Gemini 2.0 Flash optimisé pour l\'efficacité et la faible latence',
      capabilities: {
        inputTypes: ['audio', 'image', 'video', 'text'],
        outputTypes: ['text'],
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        features: ['structured-output']
      }
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Optimisé pour les tâches de raisonnement complexes nécessitant plus d\'intelligence',
      capabilities: {
        inputTypes: ['audio', 'image', 'video', 'text'],
        outputTypes: ['text'],
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        features: ['structured-output', 'function-calling', 'code-execution']
      }
    },
    {
      id: 'imagen-3.0-generate-002',
      name: 'Imagen 3',
      description: 'Notre modèle de génération d\'images le plus avancé',
      capabilities: {
        inputTypes: ['text'],
        outputTypes: ['image'],
        maxInputTokens: 200,
        maxOutputTokens: 0,
        features: ['image-generation']
      }
    }
  ];

  // Obtenir les modèles compatibles avec la fonctionnalité sélectionnée
  const compatibleModels = models.filter(model => 
    features.find(f => f.id === selectedFeature)?.compatibleModels.includes(model.id)
  );

  // Mettre à jour le modèle sélectionné lorsque la fonctionnalité change
  useEffect(() => {
    const featuresWithCompatibleModels = features.find(f => f.id === selectedFeature);
    if (featuresWithCompatibleModels && featuresWithCompatibleModels.compatibleModels.length > 0) {
      // Vérifier si le modèle actuel est compatible avec la nouvelle fonctionnalité
      if (!featuresWithCompatibleModels.compatibleModels.includes(selectedModel)) {
        // Si non, sélectionner le premier modèle compatible
        setSelectedModel(featuresWithCompatibleModels.compatibleModels[0]);
      }
    }
  }, [selectedFeature, selectedModel]);

  // Initialisation
  useEffect(() => {
    // Scroll automatique vers le bas de la conversation
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Trouver le modèle sélectionné
  const currentModel = models.find(model => model.id === selectedModel) || models[0];
  const currentFeature = features.find(feature => feature.id === selectedFeature) || features[0];
  
  // Fonctions pour gérer les entrées utilisateur
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!prompt.trim() && files.length === 0) return;
    
    const newUserMessage: Message = {
      role: 'user',
      content: {
        text: prompt
      },
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Configuration de l'API en fonction de la fonctionnalité et du modèle
      let apiEndpoint = '/api/gemini';
      let requestBody: any = {};
      
      switch (selectedFeature) {
        case 'text-generation':
          requestBody = {
            apiKey,
            model: selectedModel,
            prompt: newUserMessage.content.text,
            temperature,
            maxOutputTokens,
            files: [] // Pour une version future avec support des fichiers
          };
          break;
          
        case 'image-generation':
          if (selectedModel === 'imagen-3.0-generate-002') {
            // Imagen 3 utilise un format différent
            apiEndpoint = '/api/gemini/image';
            requestBody = {
              apiKey,
              model: selectedModel,
              instances: [{ prompt: newUserMessage.content.text }],
              parameters: {
                sampleCount: imageCount,
                aspectRatio: aspectRatio
              }
            };
          } else {
            // Gemini pour génération d'images
            apiEndpoint = '/api/gemini';
            requestBody = {
              apiKey,
              model: selectedModel,
              prompt: newUserMessage.content.text,
              temperature,
              generationConfig: {
                responseModalities: ["Text", "Image"]
              }
            };
          }
          break;
          
        case 'image-editing':
          // Convertir les fichiers images en base64
          const filePromises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          });
          
          const base64Images = await Promise.all(filePromises);
          
          apiEndpoint = '/api/gemini';
          requestBody = {
            apiKey,
            model: selectedModel,
            prompt: newUserMessage.content.text,
            images: base64Images.map(img => ({ 
              mimeType: files[0].type,
              data: img
            })),
            temperature,
            generationConfig: {
              responseModalities: ["Text", "Image"]
            }
          };
          break;
          
        case 'multimodal-qa':
          apiEndpoint = '/api/gemini';
          requestBody = {
            apiKey,
            model: selectedModel,
            prompt: newUserMessage.content.text,
            temperature,
            maxOutputTokens,
            files: [] // Pour une version future avec support multimodal
          };
          break;
          
        case 'search-grounding':
          apiEndpoint = '/api/gemini';
          requestBody = {
            apiKey,
            model: selectedModel,
            prompt: newUserMessage.content.text,
            temperature,
            maxOutputTokens,
            tools: [{ google_search: {} }]
          };
          break;
      }
      
      // Appel à notre API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la communication avec l\'API');
      }
      
      const data = await response.json();
      
      // Extraire le texte de la réponse
      let responseText = "Aucun contenu généré";
      let responseImageUrl = "";
      
      try {
        if (selectedFeature === 'image-generation' && selectedModel === 'imagen-3.0-generate-002') {
          // Format de réponse pour Imagen
          if (data.predictions && data.predictions.length > 0) {
            responseText = "Image générée avec succès";
            responseImageUrl = `data:image/png;base64,${data.predictions[0].imageBytes}`;
          }
        } else {
          // Format standard Gemini
          if (data.candidates && data.candidates[0]?.content?.parts) {
            const textParts = data.candidates[0].content.parts
              .filter((part: any) => part.text)
              .map((part: any) => part.text);
            
            const imageParts = data.candidates[0].content.parts
              .filter((part: any) => part.inlineData?.mimeType?.startsWith('image/'));
              
            if (textParts.length > 0) {
              responseText = textParts.join("\n");
            }
            
            if (imageParts.length > 0) {
              responseImageUrl = `data:${imageParts[0].inlineData.mimeType};base64,${imageParts[0].inlineData.data}`;
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du traitement de la réponse:', err);
        responseText = "Erreur lors du traitement de la réponse";
      }
      
      const assistantResponse: Message = {
        role: 'assistant',
        content: {
          text: responseText,
          imageUrl: responseImageUrl || undefined
        },
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      
      // Réinitialiser les fichiers après l'envoi
      setFiles([]);
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour gérer le raccourci clavier pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Fonction pour afficher l'icône appropriée pour chaque type de fichier
  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'audio':
        return <Mic className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'application':
        if (file.type === 'application/pdf') {
          return <FileText className="h-5 w-5 text-orange-500" />;
        }
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <h1 className="text-2xl font-bold mb-2 flex items-center">
        <Bot className="mr-2 h-6 w-6 text-primary" />
        Gemini IA
      </h1>
      <p className="text-gray-500 mb-6">
        Interface d'interaction avec l'API Gemini de Google
      </p>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Interface principale */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-lg shadow">
          {/* Sélection de fonctionnalité et modèle */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Sélecteur de fonctionnalité */}
              <div>
                <label htmlFor="feature-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Fonctionnalité
                </label>
                <select
                  id="feature-select"
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value as FeatureType)}
                  className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  {currentFeature.description}
                </p>
              </div>
              
              {/* Sélecteur de modèle */}
              <div>
                <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {compatibleModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  {currentModel.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center"
                aria-label="Paramètres"
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres avancés
              </button>
            </div>
            
            {/* Paramètres avancés */}
            {showSettings && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Paramètres avancés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="temperature" className="block text-xs font-medium text-gray-500 mb-1">
                      Température ({temperature})
                    </label>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valeurs basses = plus déterministe, valeurs hautes = plus créatif
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="tokens" className="block text-xs font-medium text-gray-500 mb-1">
                      Tokens maximum ({maxOutputTokens})
                    </label>
                    <input
                      type="range"
                      id="tokens"
                      min="100"
                      max={currentModel.capabilities.maxOutputTokens || 8192}
                      step="100"
                      value={maxOutputTokens}
                      onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {selectedFeature === 'image-generation' && selectedModel === 'imagen-3.0-generate-002' && (
                    <>
                      <div>
                        <label htmlFor="imageCount" className="block text-xs font-medium text-gray-500 mb-1">
                          Nombre d'images ({imageCount})
                        </label>
                        <input
                          type="range"
                          id="imageCount"
                          min="1"
                          max="4"
                          step="1"
                          value={imageCount}
                          onChange={(e) => setImageCount(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="aspectRatio" className="block text-xs font-medium text-gray-500 mb-1">
                          Ratio d'aspect
                        </label>
                        <select
                          id="aspectRatio"
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value)}
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="1:1">Carré (1:1)</option>
                          <option value="3:4">Portrait (3:4)</option>
                          <option value="4:3">Paysage (4:3)</option>
                          <option value="9:16">Vertical (9:16)</option>
                          <option value="16:9">Panoramique (16:9)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
                
                {selectedFeature === 'search-grounding' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="grounding"
                        checked={useGrounding}
                        onChange={(e) => setUseGrounding(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="grounding" className="ml-2 block text-sm text-gray-700">
                        Utiliser Google Search pour l'ancrage
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <label htmlFor="api-key" className="block text-xs font-medium text-gray-500 mb-1">
                    Clé API Gemini
                  </label>
                  <input
                    type="text"
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Entrez votre clé API Gemini"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Zone de conversation */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                <div className="flex items-center mb-4">
                  {currentFeature.icon}
                  <span className="text-lg font-medium ml-2">{currentFeature.name}</span>
                </div>
                <p className="max-w-md mt-2">
                  {selectedFeature === 'text-generation' && "Posez une question pour générer du texte avec le modèle " + currentModel.name}
                  {selectedFeature === 'image-generation' && "Décrivez l'image que vous souhaitez générer"}
                  {selectedFeature === 'image-editing' && "Téléchargez une image et décrivez les modifications souhaitées"}
                  {selectedFeature === 'multimodal-qa' && "Téléchargez une image, audio ou vidéo et posez une question à son sujet"}
                  {selectedFeature === 'search-grounding' && "Posez une question factuelle qui nécessite des informations récentes ou précises"}
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {message.content.text && <p className="whitespace-pre-wrap">{message.content.text}</p>}
                    {message.content.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={message.content.imageUrl} 
                          alt="Contenu de l'image" 
                          className="max-w-full rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-lg p-4 border border-gray-200 flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                  Génération de la réponse...
                </div>
              </div>
            )}
          </div>
          
          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {/* Affichage des fichiers téléchargés */}
            {files.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full pl-2 pr-1 py-1 text-sm"
                  >
                    {getFileIcon(file)}
                    <span className="mx-2 max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="h-5 w-5 rounded-full hover:bg-gray-200 flex items-center justify-center"
                      aria-label="Supprimer le fichier"
                    >
                      <Trash className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-start">
              <textarea 
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedFeature === 'text-generation' ? "Posez une question..." :
                  selectedFeature === 'image-generation' ? "Décrivez l'image à générer..." :
                  selectedFeature === 'image-editing' ? "Décrivez les modifications à apporter..." :
                  selectedFeature === 'multimodal-qa' ? "Posez une question sur le fichier téléchargé..." :
                  "Posez une question ou décrivez votre tâche..."
                }
                className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[80px]"
                rows={3}
              />
              
              <div className="flex flex-col border-t border-r border-b border-gray-300 rounded-r-md">
                {/* Bouton upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 ${
                    ['image-editing', 'multimodal-qa'].includes(selectedFeature) 
                      ? 'hover:bg-gray-100 text-gray-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } border-b border-gray-300`}
                  aria-label="Télécharger un fichier"
                  disabled={!['image-editing', 'multimodal-qa'].includes(selectedFeature)}
                >
                  <Upload className="h-5 w-5" />
                </button>
                
                {/* Bouton d'envoi */}
                <button
                  onClick={sendMessage}
                  disabled={
                    ((!prompt.trim() && files.length === 0) || isLoading) ||
                    (selectedFeature === 'image-editing' && files.length === 0)
                  }
                  className={`p-3 ${
                    ((!prompt.trim() && files.length === 0) || isLoading) ||
                    (selectedFeature === 'image-editing' && files.length === 0)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  } transition-colors`}
                  aria-label="Envoyer"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept={
                  selectedFeature === 'image-editing' 
                    ? 'image/*' 
                    : selectedFeature === 'multimodal-qa'
                      ? 'image/*,audio/*,video/*,application/pdf'
                      : ''
                }
              />
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne
            </p>
          </div>
        </div>
        
        {/* Panneau d'information sur le modèle */}
        <div className="hidden lg:block w-80 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Informations
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Fonctionnalité active</h3>
              <div className="mt-1 flex items-center">
                {currentFeature.icon}
                <span className="ml-2 text-sm text-gray-600">{currentFeature.name}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{currentFeature.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Entrées supportées</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {currentModel.capabilities.inputTypes.map(type => (
                  <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Sorties supportées</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {currentModel.capabilities.outputTypes.map(type => (
                  <span key={type} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Fonctionnalités</h3>
              <div className="mt-1 space-y-2">
                {currentModel.capabilities.features.map(feature => (
                  <div key={feature} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Limites de tokens</h3>
              <div className="mt-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entrée maximale:</span>
                  <span className="text-sm font-medium">
                    {(currentModel.capabilities.maxInputTokens / 1000).toFixed(0)}K tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sortie maximale:</span>
                  <span className="text-sm font-medium">
                    {currentModel.capabilities.maxOutputTokens >= 1000 
                      ? (currentModel.capabilities.maxOutputTokens / 1000).toFixed(0) + 'K' 
                      : currentModel.capabilities.maxOutputTokens} tokens
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <a 
                href="https://ai.google.dev/docs/gemini_api_overview" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center"
              >
                Documentation Gemini API
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 