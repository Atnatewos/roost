// apps/web/src/utils/cn.js

/**
 * Utility for conditionally joining CSS class names together.
 * Filters out falsy values and joins with spaces.
 * 
 * @param  {...(string|boolean|undefined|null)} classes - Class names or conditions
 * @returns {string} Joined class string
 * 
 * @example
 * cn('btn', 'btn-primary', isActive && 'btn-active')
 * // => 'btn btn-primary btn-active' (if isActive is true)
 * 
 * @example
 * cn('card', undefined, false, 'card-hover')
 * // => 'card card-hover'
 */
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default cn;