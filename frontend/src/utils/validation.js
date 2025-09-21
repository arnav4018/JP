// Comprehensive form validation utility

export const validationRules = {
  // Basic validators
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null; // Let required handle empty values
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    const errors = [];
    
    if (value.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter');
    }
    if (!/\d/.test(value)) {
      errors.push('one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('one special character');
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`;
    }
    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  name: (value) => {
    if (!value) return null;
    if (value.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) {
      return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  minLength: (length) => (value) => {
    if (!value) return null;
    if (value.length < length) {
      return `Must be at least ${length} characters long`;
    }
    return null;
  },

  maxLength: (length) => (value) => {
    if (!value) return null;
    if (value.length > length) {
      return `Must be no more than ${length} characters long`;
    }
    return null;
  },

  file: (file, options = {}) => {
    if (!file) return null;
    
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // Default 5MB
    
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const types = allowedTypes.join(', ');
      return `File type must be one of: ${types}`;
    }
    
    return null;
  }
};

// Validation engine
export class FormValidator {
  constructor() {
    this.fields = {};
    this.errors = {};
  }

  // Add field validation rules
  field(name, ...rules) {
    this.fields[name] = rules;
    return this;
  }

  // Validate all fields
  validate(data) {
    this.errors = {};
    
    for (const [fieldName, rules] of Object.entries(this.fields)) {
      const value = data[fieldName];
      
      for (const rule of rules) {
        let error = null;
        
        if (typeof rule === 'function') {
          error = rule(value);
        } else if (typeof rule === 'object' && rule.validator && rule.params) {
          error = rule.validator(value, ...rule.params);
        }
        
        if (error) {
          this.errors[fieldName] = error;
          break; // Stop at first error for this field
        }
      }
    }
    
    return this.isValid();
  }

  // Check if validation passed
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  // Get errors
  getErrors() {
    return this.errors;
  }

  // Get error for specific field
  getFieldError(fieldName) {
    return this.errors[fieldName] || null;
  }

  // Clear errors
  clearErrors() {
    this.errors = {};
  }

  // Clear error for specific field
  clearFieldError(fieldName) {
    delete this.errors[fieldName];
  }
}

// Pre-defined validators for common forms
export const createLoginValidator = () => {
  return new FormValidator()
    .field('email', validationRules.required, validationRules.email)
    .field('password', validationRules.required);
};

export const createSignupValidator = () => {
  return new FormValidator()
    .field('firstName', validationRules.required, validationRules.name)
    .field('lastName', validationRules.required, validationRules.name)
    .field('email', validationRules.required, validationRules.email)
    .field('password', validationRules.required, validationRules.password)
    .field('termsAccepted', (value) => {
      if (!value) return 'You must accept the terms and conditions';
      return null;
    });
};

export const createJobApplicationValidator = () => {
  return new FormValidator()
    .field('fullName', validationRules.required, validationRules.name)
    .field('email', validationRules.required, validationRules.email)
    .field('phone', validationRules.phone)
    .field('resume', (value) => {
      if (!value) return 'Resume is required';
      if (value.file) {
        return validationRules.file(value.file, {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ['application/pdf']
        });
      }
      return null;
    })
    .field('coverLetter', validationRules.maxLength(1000));
};

export const createProfileValidator = () => {
  return new FormValidator()
    .field('name', validationRules.required, validationRules.name)
    .field('email', validationRules.required, validationRules.email)
    .field('phone', validationRules.phone)
    .field('title', validationRules.required, validationRules.minLength(2))
    .field('bio', validationRules.maxLength(500))
    .field('website', validationRules.url);
};

// Real-time validation hook
export const useFormValidation = (validator, initialData = {}) => {
  // Note: This hook should be used in React components with proper imports
  // import { useState, useCallback } from 'react';
  
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate single field
  const validateField = useCallback((fieldName, value) => {
    const tempValidator = new FormValidator();
    tempValidator.fields = { [fieldName]: validator.fields[fieldName] || [] };
    
    const isValid = tempValidator.validate({ [fieldName]: value });
    const fieldError = tempValidator.getFieldError(fieldName);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
    
    return !fieldError;
  }, [validator]);

  // Validate all fields
  const validateAll = useCallback(() => {
    setIsValidating(true);
    const isValid = validator.validate(data);
    setErrors(validator.getErrors());
    setIsValidating(false);
    return isValid;
  }, [validator, data]);

  // Update field value
  const updateField = useCallback((fieldName, value) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  }, [touched, validateField]);

  // Mark field as touched
  const touchField = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate when field is touched
    validateField(fieldName, data[fieldName]);
  }, [data, validateField]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Reset form
  const reset = useCallback((newData = {}) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, []);

  return {
    data,
    errors,
    touched,
    isValidating,
    updateField,
    touchField,
    validateAll,
    validateField,
    clearErrors,
    reset,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  };
};