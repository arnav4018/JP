// Accessibility utilities and helpers

// ARIA attributes helpers
export const createAriaAttributes = (options = {}) => {
  const {
    label,
    describedBy,
    expanded,
    selected,
    checked,
    disabled,
    required,
    invalid,
    live = 'polite',
    level,
    current,
    controls,
    owns,
    hasPopup,
    hidden
  } = options;

  const attrs = {};

  if (label) attrs['aria-label'] = label;
  if (describedBy) attrs['aria-describedby'] = describedBy;
  if (expanded !== undefined) attrs['aria-expanded'] = expanded.toString();
  if (selected !== undefined) attrs['aria-selected'] = selected.toString();
  if (checked !== undefined) attrs['aria-checked'] = checked.toString();
  if (disabled !== undefined) attrs['aria-disabled'] = disabled.toString();
  if (required !== undefined) attrs['aria-required'] = required.toString();
  if (invalid !== undefined) attrs['aria-invalid'] = invalid.toString();
  if (live) attrs['aria-live'] = live;
  if (level) attrs['aria-level'] = level.toString();
  if (current) attrs['aria-current'] = current;
  if (controls) attrs['aria-controls'] = controls;
  if (owns) attrs['aria-owns'] = owns;
  if (hasPopup) attrs['aria-haspopup'] = hasPopup;
  if (hidden !== undefined) attrs['aria-hidden'] = hidden.toString();

  return attrs;
};

// Focus management utilities
export const trapFocus = (element, initialFocus = null) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  // Focus the initial element or first focusable element
  if (initialFocus && element.contains(initialFocus)) {
    initialFocus.focus();
  } else {
    firstFocusableElement?.focus();
  }

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        e.preventDefault();
        lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        e.preventDefault();
        firstFocusableElement?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Screen reader utilities
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard navigation utilities
export const handleArrowKeyNavigation = (e, items, currentIndex, options = {}) => {
  const { vertical = true, horizontal = false, loop = true } = options;
  
  let newIndex = currentIndex;
  
  if (vertical) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
    }
  }
  
  if (horizontal) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
    }
  }
  
  if (e.key === 'Home') {
    e.preventDefault();
    newIndex = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    newIndex = items.length - 1;
  }
  
  return newIndex;
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const getRGB = (color) => {
      return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAGContrast = (color1, color2, level = 'AA') => {
  const ratio = getContrastRatio(color1, color2);
  
  switch (level) {
    case 'AAA':
      return ratio >= 7.0;
    case 'AA':
    default:
      return ratio >= 4.5;
  }
};

// Skip links utility
export const createSkipLink = (target, text = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${target}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
  
  return skipLink;
};

// Landmark identification
export const ensureLandmarks = () => {
  // Ensure main landmark exists
  if (!document.querySelector('main')) {
    const main = document.createElement('main');
    main.id = 'main-content';
    const content = document.querySelector('#__next') || document.body.firstElementChild;
    if (content) {
      content.appendChild(main);
    }
  }
};

// Form accessibility helpers
export const generateFieldId = (name, prefix = 'field') => {
  return `${prefix}-${name}-${Date.now()}`;
};

export const createFieldDescription = (description, fieldId) => {
  const descId = `${fieldId}-description`;
  const descElement = document.createElement('div');
  descElement.id = descId;
  descElement.textContent = description;
  descElement.className = 'sr-only';
  
  return { element: descElement, id: descId };
};

// Modal accessibility
export const makeModalAccessible = (modalElement, options = {}) => {
  const { closeOnEscape = true, returnFocusTo = null } = options;
  
  // Store the previously focused element
  const previouslyFocusedElement = document.activeElement;
  
  // Set modal attributes
  modalElement.setAttribute('role', 'dialog');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.setAttribute('tabindex', '-1');
  
  // Trap focus within modal
  const cleanupFocusTrap = trapFocus(modalElement);
  
  // Handle escape key
  const handleEscape = (e) => {
    if (closeOnEscape && e.key === 'Escape') {
      closeModal();
    }
  };
  
  const closeModal = () => {
    // Cleanup
    cleanupFocusTrap();
    document.removeEventListener('keydown', handleEscape);
    
    // Return focus
    if (returnFocusTo) {
      returnFocusTo.focus();
    } else if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  
  return { close: closeModal };
};

// Button accessibility
export const makeButtonAccessible = (button, options = {}) => {
  const { expanded, controls, describedBy, pressed } = options;
  
  button.setAttribute('type', button.getAttribute('type') || 'button');
  
  if (expanded !== undefined) {
    button.setAttribute('aria-expanded', expanded.toString());
  }
  
  if (controls) {
    button.setAttribute('aria-controls', controls);
  }
  
  if (describedBy) {
    button.setAttribute('aria-describedby', describedBy);
  }
  
  if (pressed !== undefined) {
    button.setAttribute('aria-pressed', pressed.toString());
  }
};

// Table accessibility
export const makeTableAccessible = (table, options = {}) => {
  const { caption, summary } = options;
  
  if (caption) {
    let captionElement = table.querySelector('caption');
    if (!captionElement) {
      captionElement = document.createElement('caption');
      table.insertBefore(captionElement, table.firstChild);
    }
    captionElement.textContent = caption;
  }
  
  if (summary) {
    table.setAttribute('aria-label', summary);
  }
  
  // Ensure headers have proper scope
  const headers = table.querySelectorAll('th');
  headers.forEach(header => {
    if (!header.getAttribute('scope')) {
      // Determine scope based on position
      const isInHeaderRow = header.parentElement.parentElement.tagName === 'THEAD';
      header.setAttribute('scope', isInHeaderRow ? 'col' : 'row');
    }
  });
};

// List accessibility
export const makeListAccessible = (list, options = {}) => {
  const { role = 'list', label } = options;
  
  list.setAttribute('role', role);
  
  if (label) {
    list.setAttribute('aria-label', label);
  }
  
  const items = list.querySelectorAll('li');
  items.forEach(item => {
    if (!item.getAttribute('role')) {
      item.setAttribute('role', 'listitem');
    }
  });
};

// Error announcement utility
export const announceError = (message, fieldId = null) => {
  const errorMessage = fieldId ? `Error in ${fieldId}: ${message}` : `Error: ${message}`;
  announceToScreenReader(errorMessage, 'assertive');
};

// Success announcement utility
export const announceSuccess = (message) => {
  announceToScreenReader(`Success: ${message}`, 'polite');
};

// Live region utilities
export const createLiveRegion = (type = 'polite') => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', type);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = `live-region-${Date.now()}`;
  
  document.body.appendChild(liveRegion);
  
  return {
    element: liveRegion,
    announce: (message) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    },
    remove: () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    }
  };
};

// Screen reader only utility class
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 whitespace-nowrap border-0';