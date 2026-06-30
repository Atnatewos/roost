// apps/web/src/components/ui/Button.jsx

import cn from '../../utils/cn';

/**
 * Reusable button component with multiple variants, sizes, and states.
 * The single source of truth for all button styles in the ROOST platform.
 *
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.loading - Shows a spinner and disables the button
 * @param {boolean} props.fullWidth - Makes the button fill its container width
 * @param {string} props.className - Additional custom classes
 * @param {ReactNode} props.children - Button content (text, icons, etc.)
 * @param {...any} props.rest - Passed through to the native button element
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full-width',
        loading && 'btn--loading',
        className
      )}
      {...rest}
    >
      {/* Loading spinner shown when button is in loading state */}
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg
            className="btn__spinner-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="31.4"
              strokeDashoffset="10"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      <span className={cn('btn__content', loading && 'btn__content--hidden')}>
        {children}
      </span>
    </button>
  );
};

export default Button;