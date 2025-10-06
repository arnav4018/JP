'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function SalaryPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Salary Guide
            </h1>
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-lg mb-6">
                Explore salary information across different roles and industries to make informed career decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-deep)' }}>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Software Engineering
                  </h3>
                  <p className="mb-2">Junior: ₹3-8 LPA</p>
                  <p className="mb-2">Mid-Level: ₹8-18 LPA</p>
                  <p>Senior: ₹18-35 LPA</p>
                </div>
                
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-deep)' }}>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Data Science
                  </h3>
                  <p className="mb-2">Junior: ₹4-10 LPA</p>
                  <p className="mb-2">Mid-Level: ₹10-20 LPA</p>
                  <p>Senior: ₹20-40 LPA</p>
                </div>
                
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-deep)' }}>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Product Management
                  </h3>
                  <p className="mb-2">Junior: ₹6-12 LPA</p>
                  <p className="mb-2">Mid-Level: ₹12-25 LPA</p>
                  <p>Senior: ₹25-50 LPA</p>
                </div>
              </div>
              
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                * Salary ranges are approximate and may vary based on location, company size, and individual experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}