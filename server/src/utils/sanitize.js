import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Untrusted HTML string
 * @returns {string} - Sanitized string
 */
export function sanitizeDescription(dirty) {
  if (typeof dirty !== 'string') return '';
  
  return sanitizeHtml(dirty, {
    allowedTags: [], // ไม่อนุญาต HTML tags เลย
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  });
}

/**
 * Sanitize search query to prevent NoSQL injection
 * @param {string} query - Search query string
 * @returns {string} - Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  
  // ลบ MongoDB operators และ special characters
  return query
    .replace(/[{}$]/g, '') // ลบ { } $
    .replace(/\\/g, '') // ลบ backslash
    .trim()
    .substring(0, 200); // จำกัดความยาว
}

/**
 * Escape HTML entities
 * @param {string} unsafe - Unsafe string
 * @returns {string} - HTML escaped string
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize general string input
 * @param {string} str - Input string
 * @returns {string} - Trimmed and escaped string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .substring(0, 1000); // จำกัดความยาว
}
