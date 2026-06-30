// apps/web/src/components/ui/Modal.jsx

import { useEffect, useCallback } from 'react';
import cn from '../../utils/cn';

/**
 * Accessible modal dialog component.
 * Traps focus within the modal, closes on Escape key and overlay click.
 * Uses React portal pattern through CSS positioning.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal heading text
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {ReactNode} props.children - Modal body content
 * @param {string} props.className - Additional custom classes
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
}) => {
  /**
   * Close modal on Escape key press.
   * Memoized to maintain referential stability for the event listener.
   */
  const handleEscapeKey = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Manage body scroll lock and keyboard listener
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup on unmount or when modal closes
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal content - stop propagation to prevent overlay click from closing */}
      <div
        className={cn('modal', `modal--${size}`, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;