// apps/web/src/components/ui/Input.jsx

import { useState } from 'react';
import cn from '../../utils/cn';

/**
 * Custom input component with built-in label, error display, and icon support.
 * Replaces all native browser inputs throughout the ROOST platform.
 * Never falls back to browser default styling.
 *
 * @param {Object} props
 * @param {string} props.label - Label text displayed above the input
 * @param {string} props.error - Error message displayed below the input
 * @param {string} props.hint - Helper text displayed when no error exists
 * @param {string} props.icon - Optional leading icon (emoji or SVG)
 * @param {string} props.type - HTML input type (text, email, password, number, tel)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Change event handler
 * @param {string} props.className - Additional custom classes
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.name - Input name attribute
 */
const Input = ({
  label,
  error,
  hint,
  icon,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  required = false,
  disabled = false,
  name,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type for password visibility toggle
  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={cn('form-field', error && 'form-field--error', className)}>
      {/* Label */}
      {label && (
        <label className="form-field__label" htmlFor={name}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      {/* Input wrapper for icon and toggle button positioning */}
      <div className={cn('form-field__input-wrapper', isFocused && 'form-field__input-wrapper--focused')}>
        {/* Leading icon */}
        {icon && (
          <span className="form-field__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Native input - styled entirely by our CSS, never shows browser defaults */}
        <input
          id={name}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'form-field__input',
            icon && 'form-field__input--with-icon',
            type === 'password' && 'form-field__input--with-toggle'
          )}
          autoComplete={type === 'password' ? 'current-password' : 'off'}
          {...rest}
        />

        {/* Password visibility toggle button */}
        {type === 'password' && (
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error message or helper text */}
      {error && <span className="form-field__error">{error}</span>}
      {!error && hint && <span className="form-field__hint">{hint}</span>}
    </div>
  );
};

export default Input;