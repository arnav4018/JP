'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/useAuthStore';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const { initializeAuth } = useAuth();

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background-deep)' }}>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
