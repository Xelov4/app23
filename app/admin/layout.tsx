'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Menu, Home, Plus, Layers, Edit, Settings, LogOut, Database, Image, TrendingUp, Zap } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        setAuthenticated(data.authenticated);
        
        // Si l'utilisateur n'est pas connecté et qu'il n'est pas sur la page de connexion
        if (!data.authenticated && pathname !== '/admin') {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        setAuthenticated(false);
      }
    };
    
    checkSession();
  }, [pathname, router]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  // Si on vérifie encore l'authentification
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Si non authentifié et sur la page de connexion, afficher le contenu sans layout
  if (!authenticated && pathname === '/admin') {
    return <>{children}</>;
  }

  // Navigation items
  const navItems = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Ajouter un outil', href: '/admin/add/tools', icon: <Plus className="h-5 w-5" /> },
    { name: 'Ajouter une catégorie', href: '/admin/add/categories', icon: <Plus className="h-5 w-5" /> },
    { name: 'Traitement par lots', href: '/admin/bulk', icon: <Layers className="h-5 w-5" /> },
    { name: 'Mettre à jour les images', href: '/admin/update-screenshots', icon: <Image className="h-5 w-5" /> },
    { name: 'Crawl & Import', href: '/admin/crawl', icon: <TrendingUp className="h-5 w-5" /> },
    { name: 'Enrichir les outils', href: '/admin/enrichir', icon: <Edit className="h-5 w-5" /> },
    { name: 'Outil V2', href: '/admin/tool-v2', icon: <Zap className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        {/* Bouton mobile pour ouvrir/fermer la sidebar */}
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full bg-white shadow-md text-gray-600"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Contenu de la page */}
        <div className="p-4">
          {children}
        </div>
      </div>
      
      {/* Sidebar à droite */}
      <div className={`
         fixed top-0 right-0 z-40 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out
         ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
         md:relative md:translate-x-0
       `}>
         <div className="h-full flex flex-col overflow-y-auto p-4">
           <div className="border-b pb-4 mb-4">
             <h2 className="text-xl font-bold text-gray-800">Administration</h2>
             <p className="text-sm text-gray-500">video-ia.net</p>
           </div>
           
           <div className="flex-1">
             <nav className="space-y-1">
               {navItems.map((item) => {
                 const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                 return (
                   <Link 
                     key={item.href}
                     href={item.href}
                     className={`
                       flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                       ${isActive 
                         ? 'bg-blue-50 text-blue-700' 
                         : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                     `}
                   >
                     <span className="mr-3">{item.icon}</span>
                     {item.name}
                   </Link>
                 );
               })}
             </nav>
           </div>
           
           <div className="border-t pt-4 mt-4">
             <button
               onClick={handleLogout}
               className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
             >
               <LogOut className="h-5 w-5 mr-3" />
               Déconnexion
             </button>
           </div>
         </div>
       </div>
    </div>
  );
}