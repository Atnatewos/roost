// apps/web/src/components/ui/Spinner.jsx

import cn from '../../utils/cn';

/**
 * Custom loading spinner component.
 * Used for inline loading states, button loading, and page loading.
 * Size and color are configurable. Never shows browser-default spinner.
 *
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.color - 'primary' | 'white' | 'gray'
 * @param {string} props.className - Additional custom classes
 * @param {string} props.label - Accessible label for screen readers
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...',
}) => {
  // Map size props to pixel dimensions
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '40px',
  };

  return (
    <div
      className={cn('spinner', `spinner--${color}`, className)}
      role="status"
      aria-label={label}
    >
      <svg
        className="spinner__icon"
        width={sizeMap[size]}
        height={sizeMap[size]}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="31.4"
          strokeDashoffset="10"
          strokeLinecap="round"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="31.4"
          strokeDashoffset="10"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;