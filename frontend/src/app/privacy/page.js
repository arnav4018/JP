'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Privacy Policy
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-4">
                At JobPortal, we are committed to protecting your privacy and ensuring the security of your personal information.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Information We Collect
              </h2>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, apply for jobs, or contact us for support.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                How We Use Your Information
              </h2>
              <p className="mb-4">
                We use your information to provide and improve our services, match you with relevant job opportunities, and communicate with you about your account.
              </p>
              <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@jobportal.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}