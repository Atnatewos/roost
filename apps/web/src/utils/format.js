// apps/web/src/utils/format.js

import { paymentConfig } from '@roost/config';

/**
 * Format a number as Ethiopian Birr currency string.
 * Uses the ETB locale for proper number formatting.
 *
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to include the currency symbol
 * @returns {string} Formatted currency string
 *
 * @example
 * formatPrice(1500)     // => 'ብር 1,500.00'
 * formatPrice(1500, false) // => '1,500.00'
 */
export const formatPrice = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '—';

  const formatted = new Intl.NumberFormat('en-ET', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: paymentConfig.currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
};

/**
 * Format a number with commas for thousands.
 *
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 *
 * @example
 * formatNumber(1500000) // => '1,500,000'
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a date string or Date object into a human-readable format.
 *
 * @param {string|Date} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate('2024-01-15') // => 'Jan 15, 2024'
 * formatDate('2024-01-15', { month: 'long', day: 'numeric' }) // => 'January 15'
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

/**
 * Format a date as a relative time string (e.g., "3 days ago").
 *
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 *
 * @example
 * timeAgo('2024-01-15') // => '3 days ago' (depending on current date)
 */
export const timeAgo = (date) => {
  if (!date) return '—';

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Truncate text to a specified length with ellipsis.
 *
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Generate initials from a full name.
 *
 * @param {string} name - Full name
 * @returns {string} Uppercase initials (max 2 characters)
 *
 * @example
 * getInitials('Abebe Kebede') // => 'AK'
 * getInitials('Abebe')        // => 'A'
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};