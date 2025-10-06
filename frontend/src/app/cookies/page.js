'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function CookiesPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Cookie Policy
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-4">
                This Cookie Policy explains how JobPortal uses cookies and similar technologies.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                What Are Cookies
              </h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your device when you visit our website.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                How We Use Cookies
              </h2>
              <p className="mb-4">
                We use cookies to improve your experience, remember your preferences, and analyze website traffic.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Managing Cookies
              </h2>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}