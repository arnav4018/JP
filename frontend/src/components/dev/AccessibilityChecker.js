// Development-only accessibility checker component

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Info } from 'lucide-react';

const AccessibilityChecker = () => {
  const [checks, setChecks] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const runAccessibilityChecks = () => {
      const results = [];

      // Check 1: Images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      results.push({
        id: 'images-alt',
        name: 'Images with alt text',
        description: 'All images should have alt text for screen readers',
        status: imagesWithoutAlt.length === 0 ? 'pass' : 'fail',
        issues: imagesWithoutAlt.length,
        details: imagesWithoutAlt.length > 0 ? `Found ${imagesWithoutAlt.length} images without alt text` : null
      });

      // Check 2: Form inputs with labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])');
      const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return !label;
      });
      
      results.push({
        id: 'form-labels',
        name: 'Form inputs have labels',
        description: 'All form inputs should have associated labels',
        status: unlabeledInputs.length === 0 ? 'pass' : 'fail',
        issues: unlabeledInputs.length,
        details: unlabeledInputs.length > 0 ? `Found ${unlabeledInputs.length} inputs without labels` : null
      });

      // Check 3: Buttons with accessible names
      const buttonsWithoutNames = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      const unnamedButtons = Array.from(buttonsWithoutNames).filter(button => 
        !button.textContent?.trim() && !button.querySelector('img[alt]')
      );
      
      results.push({
        id: 'button-names',
        name: 'Buttons have accessible names',
        description: 'All buttons should have text content or aria-label',
        status: unnamedButtons.length === 0 ? 'pass' : 'fail',
        issues: unnamedButtons.length,
        details: unnamedButtons.length > 0 ? `Found ${unnamedButtons.length} buttons without accessible names` : null
      });

      // Check 4: Heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingIssues = 0;
      let previousLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          headingIssues++;
        }
        previousLevel = level;
      });
      
      results.push({
        id: 'heading-hierarchy',
        name: 'Proper heading hierarchy',
        description: 'Headings should follow logical hierarchy (h1 -> h2 -> h3, etc.)',
        status: headingIssues === 0 ? 'pass' : 'warn',
        issues: headingIssues,
        details: headingIssues > 0 ? `Found ${headingIssues} heading hierarchy issues` : null
      });

      // Check 5: Links with meaningful text
      const linksWithGenericText = document.querySelectorAll('a');
      const genericLinkText = ['click here', 'read more', 'here', 'more', 'link'];
      let genericLinks = 0;
      
      linksWithGenericText.forEach(link => {
        const text = link.textContent?.toLowerCase().trim();
        if (genericLinkText.includes(text)) {
          genericLinks++;
        }
      });
      
      results.push({
        id: 'link-text',
        name: 'Links have meaningful text',
        description: 'Links should have descriptive text, not generic phrases',
        status: genericLinks === 0 ? 'pass' : 'warn',
        issues: genericLinks,
        details: genericLinks > 0 ? `Found ${genericLinks} links with generic text` : null
      });

      // Check 6: Focus indicators
      const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      let elementsWithoutFocusIndicator = 0;
      
      focusableElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const pseudoStyle = window.getComputedStyle(element, ':focus');
        
        // This is a simplified check - in practice, focus indicators are complex to detect
        if (!element.classList.contains('focus:outline-none') || 
            !element.classList.some(cls => cls.includes('focus:'))) {
          // Element might not have custom focus styles
        }
      });
      
      results.push({
        id: 'focus-indicators',
        name: 'Focus indicators present',
        description: 'All interactive elements should have visible focus indicators',
        status: 'info',
        issues: 0,
        details: 'Focus indicators require manual testing'
      });

      // Check 7: Color contrast (simplified check)
      results.push({
        id: 'color-contrast',
        name: 'Color contrast',
        description: 'Text should have sufficient contrast against background',
        status: 'info',
        issues: 0,
        details: 'Color contrast requires automated tools or manual testing'
      });

      // Check 8: Page has title
      const pageTitle = document.title;
      results.push({
        id: 'page-title',
        name: 'Page has title',
        description: 'Page should have a descriptive title',
        status: pageTitle && pageTitle !== 'React App' ? 'pass' : 'fail',
        issues: pageTitle && pageTitle !== 'React App' ? 0 : 1,
        details: !pageTitle ? 'No page title found' : pageTitle === 'React App' ? 'Generic page title' : null
      });

      // Check 9: Lang attribute
      const langAttribute = document.documentElement.getAttribute('lang');
      results.push({
        id: 'lang-attribute',
        name: 'Language attribute set',
        description: 'HTML should have lang attribute for screen readers',
        status: langAttribute ? 'pass' : 'fail',
        issues: langAttribute ? 0 : 1,
        details: !langAttribute ? 'No lang attribute found on html element' : null
      });

      // Check 10: Skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, a[href="#main-content"], a[href="#content"]');
      results.push({
        id: 'skip-links',
        name: 'Skip navigation links',
        description: 'Page should have skip links for keyboard users',
        status: skipLinks.length > 0 ? 'pass' : 'warn',
        issues: skipLinks.length > 0 ? 0 : 1,
        details: skipLinks.length === 0 ? 'No skip links found' : null
      });

      setChecks(results);
    };

    // Run checks after a delay to allow page to load
    const timeout = setTimeout(runAccessibilityChecks, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const passedChecks = checks.filter(check => check.status === 'pass').length;
  const totalChecks = checks.length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'text-green-700 bg-green-100';
      case 'fail':
        return 'text-red-700 bg-red-100';
      case 'warn':
        return 'text-yellow-700 bg-yellow-100';
      case 'info':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-3 rounded-full shadow-lg border transition-all hover:scale-105"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        title="Accessibility Checker"
        aria-label="Toggle accessibility checker"
      >
        <Eye className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
        <span className="absolute -top-2 -right-2 w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center text-white bg-blue-600">
          {score}
        </span>
      </button>

      {/* Results Panel */}
      {isVisible && (
        <div 
          className="w-96 max-h-96 overflow-y-auto rounded-lg shadow-xl border"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Accessibility Score: {score}%
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Close accessibility checker"
              >
                ×
              </button>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {passedChecks} of {totalChecks} checks passed
            </p>
          </div>

          {/* Results */}
          <div className="p-4 space-y-3">
            {checks.map(check => (
              <div key={check.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {check.name}
                    </h4>
                    {check.issues > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(check.status)}`}>
                        {check.issues} issues
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {check.description}
                  </p>
                  {check.details && (
                    <p className="text-xs font-medium" style={{ color: check.status === 'fail' ? '#dc2626' : '#d97706' }}>
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t text-xs" style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
            <p>
              This is a basic accessibility check. Use dedicated tools like axe-core or WAVE for comprehensive testing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityChecker;