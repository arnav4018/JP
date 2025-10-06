'use client';

import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function BlogsPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Interview Questions for Software Engineers",
      excerpt: "Prepare for your next tech interview with these commonly asked questions and sample answers.",
      date: "2024-12-01",
      author: "JobPortal Team"
    },
    {
      id: 2,
      title: "Remote Work Best Practices in 2024",
      excerpt: "Learn how to excel in remote work environments and maintain work-life balance.",
      date: "2024-11-28",
      author: "Career Expert"
    },
    {
      id: 3,
      title: "Salary Negotiation Strategies",
      excerpt: "Master the art of salary negotiation and maximize your earning potential.",
      date: "2024-11-25",
      author: "HR Professional"
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Career Blog
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Insights, tips, and advice to help you succeed in your career journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="rounded-lg p-6 transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {post.title}
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/blogs/${post.id}`}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p style={{ color: 'var(--text-secondary)' }}>
              More blog posts coming soon! Stay tuned for career insights and industry updates.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}