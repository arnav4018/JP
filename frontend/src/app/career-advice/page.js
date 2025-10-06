'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function CareerAdvicePage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Career Advice
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-6">
                Get expert advice to accelerate your career growth and land your dream job.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Resume Writing Tips
                  </h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Tailor your resume for each job application</li>
                    <li>Use action verbs to describe your achievements</li>
                    <li>Keep it concise and relevant (1-2 pages max)</li>
                    <li>Include quantifiable results where possible</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Interview Preparation
                  </h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Research the company and role thoroughly</li>
                    <li>Practice common interview questions</li>
                    <li>Prepare specific examples using the STAR method</li>
                    <li>Ask thoughtful questions about the role and company</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Networking Strategies
                  </h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Attend industry events and conferences</li>
                    <li>Engage with professionals on LinkedIn</li>
                    <li>Join relevant professional associations</li>
                    <li>Offer value before asking for favors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}