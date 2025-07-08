import { User } from '../types/directory';

/**
 * Format user's full name
 */
export const formatFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Format user's address
 */
export const formatAddress = (user: User): string => {
  const { address } = user;
  return `${address.address}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Basic phone number formatting
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if not standard format
};

/**
 * Format email for display with domain highlighting
 */
export const formatEmail = (email: string): { name: string; domain: string } => {
  const [name, domain] = email.split('@');
  return { name, domain: domain || '' };
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get initials from user name
 */
export const getInitials = (user: User): string => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};

/**
 * Highlight search term in text
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Get company display text
 */
export const formatCompany = (user: User): string => {
  const { company } = user;
  return `${company.title} at ${company.name}`;
};

/**
 * Get user avatar URL or generate initials-based avatar
 */
export const getUserAvatar = (user: User): { type: 'image' | 'initials'; value: string } => {
  if (user.image && user.image !== 'https://robohash.org/placeholder.png') {
    return { type: 'image', value: user.image };
  }
  
  return { type: 'initials', value: getInitials(user) };
};

/**
 * Sort options for the user table
 */
export const SORT_OPTIONS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'age', label: 'Age' },
  { key: 'company.name', label: 'Company' },
  { key: 'address.city', label: 'City' },
  { key: 'phone', label: 'Phone' },
] as const;

/**
 * Page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Generate a random color for avatar background
 */
export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0652DD', '#9742CB', '#FD79A8'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};
