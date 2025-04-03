'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, Home, Plus, Layers, Edit, Settings, LogOut, 
  Database, Image, TrendingUp, Zap, ChevronRight,
  Users, FileText, BarChart
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // Navigation items avec catégories
  const navItems = [
    {
      category: "Général",
      items: [
        { name: 'Tableau de bord', href: '/admin/dashboard', icon: <Home className="h-5 w-5" /> },
      ]
    },
    {
      category: "Gestion du contenu",
      items: [
        { name: 'Ajouter un outil', href: '/admin/add/tools', icon: <Plus className="h-5 w-5" /> },
        { name: 'Ajouter une catégorie', href: '/admin/add/categories', icon: <Plus className="h-5 w-5" /> },
        { name: 'Enrichir les outils', href: '/admin/enrichir', icon: <Edit className="h-5 w-5" /> },
        { name: 'Outil V2', href: '/admin/tool-v2', icon: <Zap className="h-5 w-5" /> },
      ]
    },
    {
      category: "Maintenance",
      items: [
        { name: 'Traitement par lots', href: '/admin/bulk', icon: <Layers className="h-5 w-5" /> },
        { name: 'Mettre à jour les images', href: '/admin/update-screenshots', icon: <Image className="h-5 w-5" /> },
        { name: 'Crawl & Import', href: '/admin/crawl', icon: <TrendingUp className="h-5 w-5" /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop - Statique à gauche */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Administration</h2>
          <p className="text-sm text-gray-500">video-ia.net</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((category, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                {category.category}
              </h3>
              <nav className="space-y-1">
                {category.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'}
                      `}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>
      
      {/* Sidebar Mobile - Overlay à gauche */}
      <div className={`
        fixed inset-0 z-40 lg:hidden
        ${mobileSidebarOpen ? 'block' : 'hidden'}
      `}>
        {/* Overlay fond sombre */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
        
        {/* Sidebar mobile */}
        <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-[80vw] bg-white overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Administration</h2>
              <p className="text-sm text-gray-500">video-ia.net</p>
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {navItems.map((category, idx) => (
              <div key={idx} className="mb-6 px-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {category.category}
                </h3>
                <nav className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`
                          flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'}
                        `}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
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
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {/* Header mobile */}
        <div className="sticky top-0 z-30 flex items-center justify-between lg:hidden bg-white px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-gray-800">Administration</h1>
          </div>
          <div className="w-6">{/* Espace pour équilibrer */}</div>
        </div>
        
        {/* Contenu de la page */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}