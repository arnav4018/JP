'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, User, Briefcase } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="shadow-lg border-b sticky top-0 z-50" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                <Briefcase className="h-6 w-6" style={{ color: 'var(--background-deep)' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/jobs" 
              className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Find Jobs
            </Link>
            <Link 
              href="/companies" 
              className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Companies
            </Link>
            <Link 
              href="/about" 
              className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--accent-interactive)', 
                color: 'var(--background-deep)'
              }}
            >
              Sign Up
            </Link>
            <Link
              href="/profile"
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title="Profile"
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="px-2 pt-2 pb-3 space-y-1" style={{ backgroundColor: 'var(--background-panel)' }}>
              <Link
                href="/jobs"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Companies
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block mx-3 my-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-base font-medium text-center transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}