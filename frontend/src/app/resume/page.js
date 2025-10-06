'use client';

import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function ResumePage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Resume Resources
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-6">
                Build a professional resume that stands out to employers and gets you interviews.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-deep)' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Resume Builder
                  </h2>
                  <p className="mb-4">
                    Create a professional resume using our easy-to-use builder with modern templates.
                  </p>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                  >
                    Build Resume
                  </Link>
                </div>
                
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-deep)' }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Resume Tips
                  </h2>
                  <p className="mb-4">
                    Learn best practices for writing effective resumes that get results.
                  </p>
                  <Link
                    href="/career-advice"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                  >
                    View Tips
                  </Link>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Resume Writing Best Practices
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      1. Keep it concise and relevant
                    </h3>
                    <p>Limit your resume to 1-2 pages and focus on experiences relevant to the job you're applying for.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      2. Use action verbs and quantify achievements
                    </h3>
                    <p>Start bullet points with strong action verbs and include numbers to demonstrate impact.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      3. Tailor for each application
                    </h3>
                    <p>Customize your resume for each job by highlighting the most relevant skills and experiences.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      4. Use a clean, professional format
                    </h3>
                    <p>Choose a clean layout with consistent formatting, readable fonts, and appropriate white space.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}