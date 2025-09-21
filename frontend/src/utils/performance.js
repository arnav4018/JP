// Performance monitoring utilities for development and optimization

// Web Vitals monitoring
export const measureWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Measure First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log(`FCP: ${entry.startTime.toFixed(2)}ms`);
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log(`LCP: ${entry.startTime.toFixed(2)}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log(`CLS: ${clsValue.toFixed(4)}`);
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Layout shift observer not supported');
    }
  }
};

// Bundle size analysis (for development)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      if (script.src.includes('_next/static')) {
        // This would need actual size data from webpack stats
        console.log('Script:', script.src);
      }
    });
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
};

// React component render profiling
export const withPerformanceProfiler = (WrappedComponent, componentName) => {
  const ProfiledComponent = (props) => {
    const renderStart = performance.now();
    
    const result = <WrappedComponent {...props} />;
    
    const renderTime = performance.now() - renderStart;
    if (renderTime > 16) { // Flag renders longer than one frame (16ms)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    return result;
  };
  
  ProfiledComponent.displayName = `withPerformanceProfiler(${componentName})`;
  return ProfiledComponent;
};

// Image loading optimization
export const preloadCriticalImages = (imageUrls) => {
  if (typeof window !== 'undefined') {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

// Intersection Observer for lazy loading
export const createLazyLoader = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };

  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    }, defaultOptions);
  }
  
  // Fallback for browsers without IntersectionObserver
  return {
    observe: (element) => callback(element),
    unobserve: () => {},
    disconnect: () => {}
  };
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      const metrics = {
        'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP Connection': navigation.connectEnd - navigation.connectStart,
        'Request': navigation.responseStart - navigation.requestStart,
        'Response': navigation.responseEnd - navigation.responseStart,
        'DOM Processing': navigation.domComplete - navigation.domLoading,
        'Load Complete': navigation.loadEventEnd - navigation.navigationStart
      };

      console.group('Performance Budget Check');
      Object.entries(metrics).forEach(([metric, time]) => {
        const status = time > 1000 ? '❌' : time > 500 ? '⚠️' : '✅';
        console.log(`${status} ${metric}: ${time.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }
};

// Debounce utility for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Component performance tracker hook
export const usePerformanceTracker = (componentName) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) {
        console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }
  
  return () => {}; // No-op in production
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    measureWebVitals();
    
    // Check performance budget after page load
    window.addEventListener('load', () => {
      setTimeout(checkPerformanceBudget, 1000);
      setTimeout(monitorMemoryUsage, 2000);
    });
  }
};