'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createAriaAttributes, srOnlyClass } from '@/utils/accessibility';

const FormInput = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  success,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const uniqueId = useId();
  const inputId = `input-${name}-${uniqueId}`;
  const errorId = `${inputId}-error`;
  const successId = `${inputId}-success`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const getBorderColor = () => {
    if (hasError) return 'border-red-300 focus:border-red-500';
    if (hasSuccess) return 'border-green-300 focus:border-green-500';
    return 'var(--accent-subtle)';
  };

  const getInputStyles = () => ({
    backgroundColor: 'var(--background-deep)',
    borderColor: getBorderColor(),
    color: 'var(--text-primary)',
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed'
    })
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="flex items-center space-x-1 text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && !label && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...createAriaAttributes({
            required,
            invalid: hasError,
            describedBy: [ariaDescribedBy, hasError ? errorId : null, hasSuccess ? successId : null].filter(Boolean).join(' ') || undefined
          })}
          className={`
            block w-full px-3 py-2 border rounded-lg shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            transition-colors duration-200
            ${Icon && !label ? 'pl-10' : ''}
            ${showPasswordToggle ? 'pr-10' : ''}
            ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
            ${hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : ''}
            ${!hasError && !hasSuccess ? 'focus:ring-blue-200' : ''}
          `}
          style={getInputStyles()}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {/* Success Icon */}
          {hasSuccess && !hasError && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}

          {/* Error Icon */}
          {hasError && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded"
              style={{ color: 'var(--text-secondary)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <div id={errorId} className="flex items-center space-x-2 text-sm text-red-600" role="alert" aria-live="polite">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {hasSuccess && !hasError && (
        <div id={successId} className="flex items-center space-x-2 text-sm text-green-600" role="status" aria-live="polite">
          <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;