'use client';

import { useAuth } from '@/store/useAuthStore';

export default function AuthDebug() {
  const { user, isAuthenticated, loading } = useAuth();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Auth Debug Info</h4>
      <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify({
          loading,
          isAuthenticated,
          user: user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company
          } : null
        }, null, 2)}
      </pre>
    </div>
  );
}