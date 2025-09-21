'use client';

import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--background-deep)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                <Briefcase className="h-6 w-6" style={{ color: 'var(--background-deep)' }} />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>JobPortal</span>
            </div>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your gateway to finding the perfect job. Connect with top employers and discover opportunities that match your skills and aspirations.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <SocialLink href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </SocialLink>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/jobs">Find Jobs</FooterLink>
              <FooterLink href="/companies">Browse Companies</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/blog">Career Blog</FooterLink>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>For Job Seekers</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/signup">Create Account</FooterLink>
              <FooterLink href="/profile">Build Profile</FooterLink>
              <FooterLink href="/resume">Resume Builder</FooterLink>
              <FooterLink href="/career-advice">Career Advice</FooterLink>
              <FooterLink href="/salary">Salary Guide</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Contact Info</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3" style={{ color: 'var(--text-secondary)' }}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@jobportal.com</span>
              </li>
              <li className="flex items-center space-x-3" style={{ color: 'var(--text-secondary)' }}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3" style={{ color: 'var(--text-secondary)' }}>
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  123 Business Street<br />
                  Suite 100<br />
                  City, State 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t py-8" style={{ borderColor: 'var(--accent-subtle)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              © {currentYear} JobPortal. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex space-x-8 text-sm">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components
const FooterLink = ({ href, children }) => (
  <li>
    <Link 
      href={href} 
      className="transition-colors hover:opacity-80"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
      onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, children, 'aria-label': ariaLabel }) => (
  <a 
    href={href} 
    className="p-2 rounded-lg transition-colors hover:opacity-80"
    style={{ color: 'var(--text-secondary)' }}
    aria-label={ariaLabel}
    onMouseEnter={(e) => {
      e.target.style.color = 'var(--accent-interactive)';
      e.target.style.backgroundColor = 'var(--accent-subtle)';
    }}
    onMouseLeave={(e) => {
      e.target.style.color = 'var(--text-secondary)';
      e.target.style.backgroundColor = 'transparent';
    }}
  >
    {children}
  </a>
);