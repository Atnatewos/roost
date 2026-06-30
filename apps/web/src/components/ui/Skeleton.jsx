// apps/web/src/components/ui/Skeleton.jsx

import cn from '../../utils/cn';

/**
 * Skeleton loading placeholder component.
 * Provides animated shimmer placeholders for content that is still loading.
 * Never shows browser-default loading states anywhere in the app.
 *
 * @param {Object} props
 * @param {string} props.variant - 'text' | 'circular' | 'rectangular' | 'card'
 * @param {string} props.width - CSS width value
 * @param {string} props.height - CSS height value
 * @param {number} props.lines - Number of text skeleton lines (for variant='text')
 * @param {string} props.className - Additional custom classes
 */

/**
 * Text skeleton with configurable number of lines.
 * Simulates a paragraph of loading text.
 */
const TextSkeleton = ({ lines = 3 }) => (
  <div className="skeleton-text-group">
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className={cn(
          'skeleton skeleton--text',
          index === lines - 1 && 'skeleton--text-last'
        )}
      />
    ))}
  </div>
);

/**
 * Circular skeleton for avatars and round images.
 */
const CircularSkeleton = ({ size = '48px' }) => (
  <div
    className="skeleton skeleton--circular"
    style={{ width: size, height: size }}
  />
);

/**
 * Rectangular skeleton with configurable dimensions.
 */
const RectangularSkeleton = ({ width = '100%', height = '200px' }) => (
  <div
    className="skeleton skeleton--rectangular"
    style={{ width, height }}
  />
);

/**
 * Card skeleton combining image and text placeholders.
 * Mimics the structure of a ListingCard during loading.
 */
const CardSkeleton = () => (
  <div className="skeleton-card">
    {/* Card image placeholder */}
    <div className="skeleton skeleton--rectangular skeleton-card__image" />
    {/* Card content placeholders */}
    <div className="skeleton-card__content">
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--text-short" />
      <div className="skeleton-card__footer">
        <div className="skeleton skeleton--text skeleton--text-tiny" />
        <div className="skeleton skeleton--text skeleton--text-tiny" />
      </div>
    </div>
  </div>
);

/**
 * Main Skeleton component that renders the appropriate variant.
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 3,
  className = '',
}) => {
  switch (variant) {
    case 'text':
      return <TextSkeleton lines={lines} />;
    case 'circular':
      return <CircularSkeleton size={width || height || '48px'} />;
    case 'rectangular':
      return <RectangularSkeleton width={width} height={height} />;
    case 'card':
      return <CardSkeleton />;
    default:
      return <RectangularSkeleton width={width} height={height} />;
  }
};

export default Skeleton;