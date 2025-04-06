'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, Home, Layers, Settings, LogOut, 
  ChevronRight, LayoutDashboard, Camera,
  Globe, Bot, Tag, ListChecks, Users, 
  Database, Upload, Link as LinkIcon, Search, BarChart, PlayCircle
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
        if (!data.authenticated && pathname !== '/admin' && pathname !== '/admin/') {
          router.push('/admin');
        }
        
        // Rediriger vers le dashboard si l'utilisateur est connecté et sur la page d'accueil admin
        if (data.authenticated && (pathname === '/admin' || pathname === '/admin/')) {
          router.push('/admin/tool-v2');
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
  if (!authenticated && (pathname === '/admin' || pathname === '/admin/')) {
    return <>{children}</>;
  }

  // Configuration de la navigation
  const navigationItems = [
    {
      category: "Administration",
      items: [
        {
          title: 'Dashboard',
          href: '/admin/tool-v2',
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
      ]
    },
    {
      category: "Contenu",
      items: [
        {
          title: 'Catégories',
          href: '/admin/categories',
          icon: <Layers className="h-5 w-5" />,
        },
        {
          title: 'Outils',
          href: '/admin/tools',
          icon: <Settings className="h-5 w-5" />,
        },
        {
          title: 'Tags',
          href: '/admin/tags',
          icon: <Tag className="h-5 w-5" />,
        },
        {
          title: 'Fonctionnalités',
          href: '/admin/features',
          icon: <ListChecks className="h-5 w-5" />,
        },
        {
          title: 'Types d\'utilisateurs',
          href: '/admin/users',
          icon: <Users className="h-5 w-5" />,
        },
      ]
    },
    {
      category: "Maintenance",
      items: [
        {
          title: 'Séquençage',
          href: '/admin/sequencage',
          icon: <PlayCircle className="h-5 w-5" />,
        },
        {
          title: 'GeminiIA',
          href: '/admin/gemini-ia',
          icon: <Bot className="h-5 w-5" />,
        },
        {
          title: 'Captures d\'écran',
          href: '/admin/update-screenshots',
          icon: <Camera className="h-5 w-5" />,
        },
        {
          title: 'Crawl & Import',
          href: '/admin/crawl',
          icon: <Globe className="h-5 w-5" />,
        },
        {
          title: 'Affiliation',
          href: '/admin/affiliation',
          icon: <LinkIcon className="h-5 w-5" />,
        },
      ]
    },
    {
      category: "Recherche",
      items: [
        {
          title: 'Données de recherche',
          href: '/admin/search/data',
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: 'Pages de recherche',
          href: '/admin/search/pages',
          icon: <Search className="h-5 w-5" />,
        },
      ]
    },
    {
      category: "Base de données",
      items: [
        {
          title: 'Explorer',
          href: '/admin/database/explorer',
          icon: <Database className="h-5 w-5" />,
        },
        {
          title: 'Importer',
          href: '/admin/database/import',
          icon: <Upload className="h-5 w-5" />,
        },
      ],
    },
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
          {navigationItems.map((group, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                {group.category}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${pathname === item.href || pathname.startsWith(item.href + '/') 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'}
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
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
            {navigationItems.map((group, idx) => (
              <div key={idx} className="mb-6 px-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {group.category}
                </h3>
                <nav className="space-y-1">
                  {group.items.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${pathname === item.href || pathname.startsWith(item.href + '/') 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'}
                      `}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.title}
                    </Link>
                  ))}
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