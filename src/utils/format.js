export function formatAccountNumber(v=''){
  const digits = (v || '').replace(/[^\d]/g, '').slice(0, 15); // Allow up to 15 digits
  const len = digits.length;

  if (len === 0) return '';
  if (len <= 3) return digits;
  
  // Standard 10 digits: 000-0-00000-0
  if (len === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,4)}-${digits.slice(4,9)}-${digits.slice(9)}`;
  }

  // GSB/BAAC 12 digits: Usually 000-0-00000-00-0 or just generic grouping
  // Let's use a generic block format for non-10 lengths to be safe: 000-000...
  if (len > 3 && len <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
  if (len > 6 && len <= 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  if (len > 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}-${digits.slice(10)}`;

  return digits;
}

export function sanitizeText(s=''){
  return String(s).replace(/[\u0000-\u001F\u007F]/g,'').trim();
}
