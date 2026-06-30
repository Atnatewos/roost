// apps/web/src/components/ui/Card.jsx

import cn from '../../utils/cn';

/**
 * Flexible card container component.
 * Used as the foundation for ListingCard, BookingCard, and other card variants
 * throughout the ROOST platform.
 *
 * @param {Object} props
 * @param {string} props.variant - 'default' | 'hover' | 'borderless'
 * @param {boolean} props.padding - Whether to apply default padding
 * @param {string} props.className - Additional custom classes
 * @param {ReactNode} props.children - Card content
 */
const Card = ({
  variant = 'default',
  padding = true,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={cn(
        'card',
        `card--${variant}`,
        padding && 'card--padded',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;