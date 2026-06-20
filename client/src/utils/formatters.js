/**
 * Format a month number (1-12) to month name
 */
export const monthName = (num) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[num - 1] || '';
};

/**
 * Format a month number to short name
 */
export const monthShort = (num) => {
  return monthName(num).substring(0, 3);
};

/**
 * Format budget level to display text
 */
export const formatBudget = (level) => {
  const map = { budget: '₹ Budget', mid: '₹₹ Mid-Range', luxury: '₹₹₹ Luxury' };
  return map[level] || level;
};

/**
 * Format crowd score to display text with color class
 */
export const formatCrowdScore = (score) => {
  const map = {
    low: { text: 'Hidden Gem', className: 'badge-success' },
    rising: { text: 'Rising', className: 'badge-warning' },
    popular: { text: 'Popular', className: 'badge-primary' },
  };
  return map[score] || { text: score, className: 'badge' };
};

/**
 * Format category to display text
 */
export const formatCategory = (category) => {
  const map = {
    mountain: '🏔️ Mountain',
    beach: '🏖️ Beach',
    heritage: '🏛️ Heritage',
    wildlife: '🦁 Wildlife',
    village: '🏘️ Village',
  };
  return map[category] || category;
};

/**
 * Truncate text to a max length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get user initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
