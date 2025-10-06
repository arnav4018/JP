'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Terms of Service
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-4">
                Welcome to JobPortal. By using our services, you agree to these terms and conditions.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using JobPortal, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                User Responsibilities
              </h2>
              <p className="mb-4">
                Users are responsible for maintaining the confidentiality of their account information and for all activities under their account.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Contact Information
              </h2>
              <p>
                For questions about these Terms of Service, please contact us at legal@jobportal.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}