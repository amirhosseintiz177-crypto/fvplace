export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function friendlyType(file = {}) {
  if (file.type === 'folder') return 'پوشه';
  if ((file.mimeType || '').includes('pdf')) return 'سند PDF';
  if ((file.mimeType || '').startsWith('video/')) return 'ویدیو';
  if ((file.mimeType || '').startsWith('image/')) return 'تصویر';
  if ((file.mimeType || '').startsWith('audio/')) return 'صوت';
  if ((file.mimeType || '').includes('text')) return 'فایل متنی';
  if ((file.mimeType || '').includes('document')) return 'سند';
  return file.mimeType || 'فایل';
}

export function iconFor(file = {}) {
  if (file.type === 'folder') return 'DIR';
  if ((file.mimeType || '').includes('pdf')) return 'PDF';
  if ((file.mimeType || '').startsWith('video/')) return 'VID';
  if ((file.mimeType || '').startsWith('image/')) return 'IMG';
  if ((file.mimeType || '').startsWith('audio/')) return 'AUD';
  return 'FILE';
}

export function initials(value = '') {
  return value.trim().slice(0, 1).toUpperCase() || 'F';
}

export function debounce(fn, wait = 250) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export function setDocumentTitle(title) {
  document.title = title ? `${title} | FVPlace Nova Vanilla` : 'FVPlace Nova Vanilla';
}

export function normalizePath(pathname) {
  if (!pathname) return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function resolveRoute(basePath) {
  const normalizedBase = basePath && basePath !== '/' ? normalizePath(basePath) : '/';
  const pathname = normalizePath(window.location.pathname);
  if (normalizedBase !== '/' && pathname.startsWith(normalizedBase)) {
    return pathname.slice(normalizedBase.length - 1) || '/';
  }
  return pathname;
}

export function linkHref(path) {
  const base = window.FVPLACE_CONFIG?.basePath || '';
  if (!path.startsWith('/')) return path;
  return `${base}${path}`.replace(/\/+/g, '/');
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function timeAgoLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'به تازگی';
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.round(hours / 24);
  return `${days} روز پیش`;
}
