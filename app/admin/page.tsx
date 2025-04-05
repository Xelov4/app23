'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/tool-v2';

  // Vérifier si déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (data.authenticated) {
          router.push(redirectPath);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
      }
    };
    
    checkSession();
  }, [router, redirectPath]);

  // Gestion de la connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }
      
      // Redirection vers la page demandée ou le tableau de bord par défaut
      router.push(redirectPath);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de la connexion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu du formulaire de connexion
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Administration</h1>
          </div>
          <p className="text-center text-blue-100 mt-1">video-ia.net</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-start text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                disabled={isLoading}
                placeholder="Entrez votre nom d'utilisateur"
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 pr-10"
                  required
                  disabled={isLoading}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-500" /> : 
                    <Eye className="h-5 w-5 text-gray-500" />
                  }
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Connexion
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1 font-medium">Informations de connexion :</p>
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
              <p className="mb-1"><span className="font-semibold">Nom d'utilisateur :</span> video-admin</p>
              <p><span className="font-semibold">Mot de passe :</span> VideoIA2024!</p>
              <p className="mt-2 text-xxs italic">Note: Ces informations sont généralement masquées en production.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 