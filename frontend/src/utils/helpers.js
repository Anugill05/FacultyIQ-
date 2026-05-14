// utils/helpers.js

/**
 * Get initials from a full name
 */
export const getInitials = (name = '') => {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Time ago string
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

/**
 * Get performance grade color
 */
export const getGradeColor = (grade) => {
  const map = {
    'A+': '#16a34a',
    'A': '#22c55e',
    'B+': '#2563eb',
    'B': '#3b82f6',
    'C': '#d97706',
    'D': '#ef4444',
  };
  return map[grade] || '#64748b';
};

/**
 * Get badge info
 */
export const getBadgeInfo = (badge) => {
  const map = {
    star_performer: { label: 'Star Performer', icon: '⭐', color: '#d97706', bg: '#fef3c7' },
    excellence: { label: 'Excellence', icon: '🏆', color: '#16a34a', bg: '#dcfce7' },
    rising_star: { label: 'Rising Star', icon: '🚀', color: '#2563eb', bg: '#dbeafe' },
    consistent: { label: 'Consistent', icon: '✅', color: '#7c3aed', bg: '#ede9fe' },
    needs_improvement: { label: 'Needs Improvement', icon: '📈', color: '#dc2626', bg: '#fee2e2' },
  };
  return map[badge] || { label: badge, icon: '🎖', color: '#64748b', bg: '#f1f5f9' };
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score) => {
  if (score >= 90) return '#16a34a';
  if (score >= 80) return '#2563eb';
  if (score >= 70) return '#d97706';
  if (score >= 60) return '#ea580c';
  return '#ef4444';
};

/**
 * Get announcement type style
 */
export const getAnnouncementStyle = (type) => {
  const map = {
    info: { bg: '#dbeafe', border: '#3b82f6', icon: 'ℹ️', color: '#1e40af' },
    success: { bg: '#dcfce7', border: '#22c55e', icon: '✅', color: '#166534' },
    warning: { bg: '#fef9c3', border: '#eab308', icon: '⚠️', color: '#854d0e' },
    urgent: { bg: '#fee2e2', border: '#ef4444', icon: '🚨', color: '#991b1b' },
  };
  return map[type] || map.info;
};

/**
 * Category display names
 */
export const achievementCategories = {
  publication: 'Research Publication',
  award: 'Award & Recognition',
  certification: 'Certification',
  conference: 'Conference',
  patent: 'Patent',
  project: 'Funded Project',
};

export const workshopCategories = {
  technical: 'Technical',
  pedagogical: 'Pedagogical',
  research: 'Research',
  soft_skills: 'Soft Skills',
  leadership: 'Leadership',
};

/**
 * Department list
 */
export const departments = [
  'Computer Science',
  'Electronics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Management',
  'Civil Engineering',
  'Mechanical Engineering',
  'Biotechnology',
  'Pharmacy',
];

/**
 * Truncate text
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Get avatar URL or null (use initials if null)
 */
export const getAvatarSrc = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/storage/${avatar}`;
};

/**
 * Generate academic years array
 */
export const getAcademicYears = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const y = current - i;
    return `${y}-${y + 1}`;
  });
};
