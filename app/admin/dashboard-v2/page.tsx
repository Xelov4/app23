'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardV2Redirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/tool-v2');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Redirection vers le nouveau dashboard...</p>
      </div>
    </div>
  );
} 