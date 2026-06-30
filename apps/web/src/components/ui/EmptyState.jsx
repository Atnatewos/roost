// apps/web/src/components/ui/EmptyState.jsx

import cn from '../../utils/cn';
import Button from './Button';

/**
 * Custom empty state component for pages and lists with no data.
 * Replaces generic "No results" text with branded ROOST messaging.
 * Never uses browser-default displays.
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji or text icon
 * @param {string} props.title - Main heading for the empty state
 * @param {string} props.description - Supporting text explaining the empty state
 * @param {Object} props.action - Optional action button config { label, onClick, to }
 * @param {string} props.className - Additional custom classes
 */
const EmptyState = ({
  icon = '🏠',
  title = 'Nothing here yet',
  description = '',
  action = null,
  className = '',
}) => {
  return (
    <div className={cn('empty-state', className)}>
      {/* Large icon/emoji */}
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>

      {/* Title */}
      <h3 className="empty-state__title">{title}</h3>

      {/* Description */}
      {description && (
        <p className="empty-state__description">{description}</p>
      )}

      {/* Optional action button */}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          className="empty-state__action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;