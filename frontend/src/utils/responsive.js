// Responsive utilities for consistent breakpoints and responsive behavior
// Note: Import useState and useEffect in components that use these hooks
// import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices (larger desktops)
};

// Media query utilities
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
};

// Hook to detect current breakpoint
export const useBreakpoint = () => {
  if (typeof window === 'undefined') {
    return 'lg'; // Default for SSR
  }

  const [breakpoint, setBreakpoint] = useState(() => {
    const width = window.innerWidth;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) setBreakpoint('2xl');
      else if (width >= breakpoints.xl) setBreakpoint('xl');
      else if (width >= breakpoints.lg) setBreakpoint('lg');
      else if (width >= breakpoints.md) setBreakpoint('md');
      else if (width >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

// Hook to detect if device supports touch
export const useIsTouch = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const [isTouch, setIsTouch] = useState(() => {
    return window.matchMedia(mediaQueries.touch).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(mediaQueries.touch);
    const handleChange = (e) => setIsTouch(e.matches);
    
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isTouch;
};

// Hook to detect mobile device
export const useIsMobile = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

// Hook to detect tablet device
export const useIsTablet = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

// Hook to detect desktop device
export const useIsDesktop = () => {
  const breakpoint = useBreakpoint();
  return ['lg', 'xl', '2xl'].includes(breakpoint);
};

// Responsive container classes
export const getContainerClasses = (breakpoint) => {
  const baseClasses = 'mx-auto px-4 sm:px-6 lg:px-8';
  const maxWidths = {
    xs: 'max-w-full',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md', 
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    none: 'max-w-none'
  };
  
  return `${baseClasses} ${maxWidths[breakpoint] || maxWidths.lg}`;
};

// Grid responsive utilities
export const getGridColumns = (mobile = 1, tablet = 2, desktop = 3) => {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

// Responsive spacing utilities
export const getResponsiveSpacing = (mobile = 4, tablet = 6, desktop = 8) => {
  return `space-y-${mobile} md:space-y-${tablet} lg:space-y-${desktop}`;
};

// Responsive padding utilities
export const getResponsivePadding = (mobile = 4, tablet = 6, desktop = 8) => {
  return `p-${mobile} md:p-${tablet} lg:p-${desktop}`;
};

// Responsive margin utilities
export const getResponsiveMargin = (mobile = 4, tablet = 6, desktop = 8) => {
  return `m-${mobile} md:m-${tablet} lg:m-${desktop}`;
};

// Responsive text sizing
export const getResponsiveText = (mobile = 'base', tablet = 'lg', desktop = 'xl') => {
  return `text-${mobile} md:text-${tablet} lg:text-${desktop}`;
};

// Common responsive patterns
export const responsivePatterns = {
  // Card layouts
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  listGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  
  // Navigation patterns
  mobileMenu: 'block lg:hidden',
  desktopMenu: 'hidden lg:block',
  
  // Sidebar patterns
  mobileSidebar: 'fixed inset-0 z-50 lg:static lg:inset-auto',
  sidebarContent: 'w-full max-w-sm lg:max-w-none lg:w-64',
  
  // Modal patterns
  mobileModal: 'fixed inset-0 z-50 overflow-y-auto',
  modalContent: 'inline-block w-full max-w-md lg:max-w-lg xl:max-w-xl',
  
  // Form patterns
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  formActions: 'flex flex-col sm:flex-row gap-3 sm:justify-end',
  
  // Content patterns
  contentWidth: 'max-w-none lg:max-w-4xl xl:max-w-6xl',
  articleWidth: 'max-w-none md:max-w-2xl lg:max-w-4xl',
  
  // Button patterns
  mobileButton: 'w-full sm:w-auto',
  buttonGroup: 'flex flex-col sm:flex-row gap-2',
};

// Utility to hide/show elements based on breakpoint
export const getVisibilityClasses = (hideOn = [], showOn = []) => {
  const classes = [];
  
  // Hide classes
  hideOn.forEach(bp => {
    switch (bp) {
      case 'mobile':
        classes.push('hidden sm:block');
        break;
      case 'tablet':
        classes.push('sm:hidden lg:block');
        break;
      case 'desktop':
        classes.push('lg:hidden');
        break;
      case 'sm':
        classes.push('hidden sm:block');
        break;
      case 'md':
        classes.push('md:hidden');
        break;
      case 'lg':
        classes.push('lg:hidden');
        break;
      case 'xl':
        classes.push('xl:hidden');
        break;
      default:
        classes.push(`${bp}:hidden`);
    }
  });
  
  // Show classes
  showOn.forEach(bp => {
    switch (bp) {
      case 'mobile':
        classes.push('block sm:hidden');
        break;
      case 'tablet':
        classes.push('hidden sm:block lg:hidden');
        break;
      case 'desktop':
        classes.push('hidden lg:block');
        break;
      case 'sm':
        classes.push('block sm:hidden');
        break;
      case 'md':
        classes.push('hidden md:block');
        break;
      case 'lg':
        classes.push('hidden lg:block');
        break;
      case 'xl':
        classes.push('hidden xl:block');
        break;
      default:
        classes.push(`hidden ${bp}:block`);
    }
  });
  
  return classes.join(' ');
};

// Touch-friendly sizing utilities
export const getTouchFriendlySize = (isTouch) => {
  return isTouch ? 'min-h-[44px] min-w-[44px]' : 'min-h-[32px] min-w-[32px]';
};

// Safe area utilities for mobile devices with notches
export const getSafeAreaClasses = () => {
  return 'pb-safe-area-inset-bottom pt-safe-area-inset-top pl-safe-area-inset-left pr-safe-area-inset-right';
};

// Responsive image utilities
export const getResponsiveImageSizes = () => {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
};