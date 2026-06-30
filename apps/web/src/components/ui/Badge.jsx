// apps/web/src/components/ui/Badge.jsx

import cn from '../../utils/cn';

/**
 * Custom badge/tag component for status indicators and labels.
 * Used for booking statuses, verification badges, listing statuses, etc.
 * Never uses browser-default styling.
 *
 * @param {Object} props
 * @param {string} props.variant - 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary'
 * @param {string} props.size - 'sm' | 'md'
 * @param {ReactNode} props.children - Badge content
 * @param {string} props.className - Additional custom classes
 * @param {ReactNode} props.icon - Optional leading icon
 */
const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon,
}) => {
  return (
    <span
      className={cn(
        'badge',
        `badge--${variant}`,
        `badge--${size}`,
        className
      )}
    >
      {icon && <span className="badge__icon">{icon}</span>}
      <span className="badge__text">{children}</span>
    </span>
  );
};

export default Badge;