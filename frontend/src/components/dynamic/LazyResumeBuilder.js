'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the Resume Builder component
const ResumeBuilderComponent = dynamic(
  () => import('../../app/resume-builder/page'), 
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-interactive)' }}></div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Loading Resume Builder...</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            This may take a moment as we load the advanced editor tools.
          </p>
        </div>
      </div>
    ),
    ssr: false // Resume Builder is client-side heavy, so disable SSR
  }
);

export default function LazyResumeBuilder(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
      </div>
    }>
      <ResumeBuilderComponent {...props} />
    </Suspense>
  );
}