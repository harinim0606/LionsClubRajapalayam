/**
 * Formats a date string into a readable format (e.g., DD-MM-YYYY or localized).
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * Returns initials from a full name, handling honorifics like Ln. or Lion.
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  // Clean honorifics
  let cleanName = name.replace(/^(Ln\.|Lion)\s*/i, '').trim();
  
  const parts = cleanName.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
