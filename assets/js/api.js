import { getAccessToken, getRefreshToken, saveSession, clearSession } from './auth.js';

const RUNTIME_CONFIG_KEY = 'fvplace.runtimeConfig';
const LEGACY_HOST = 'facevipers.runflare.run';
const CURRENT_HOST = 'fvplace.runflare.run';

function getOriginFallback() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'http://127.0.0.1:3000';
}

function normalizeRuntimeUrl(url) {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  const replacedHost = url.includes(LEGACY_HOST) ? url.replaceAll(LEGACY_HOST, CURRENT_HOST) : url;
  return replacedHost
    .replace(/^https?:\/\/fvplace\.runflare\.run:3000$/i, 'https://fvplace.runflare.run')
    .replace(/^https?:\/\/fvplace\.runflare\.run:4000$/i, 'https://fvplace.runflare.run');
}

function secureUrl(url, fallback) {
  const value = normalizeRuntimeUrl(url || fallback);
  if (!value) return value;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && value.startsWith('http://')) {
    return value.replace('http://', 'https://');
  }
  return value;
}

function getRuntimeConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RUNTIME_CONFIG_KEY) || '{}') || {};
    const normalized = {
      ...parsed,
      appBaseUrl: normalizeRuntimeUrl(parsed.appBaseUrl),
      apiBaseUrl: normalizeRuntimeUrl(parsed.apiBaseUrl),
    };
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return {};
  }
}

export function getApiBaseUrl() {
  return secureUrl(getRuntimeConfig().apiBaseUrl || window.FVPLACE_CONFIG?.apiBaseUrl, getOriginFallback());
}

export function getAppBaseUrl() {
  return secureUrl(getRuntimeConfig().appBaseUrl || window.FVPLACE_CONFIG?.appBaseUrl, getOriginFallback());
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('نشست کاربر منقضی شده است.');
  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'نشست شما قابل بازیابی نبود.');
  saveSession(payload);
  return payload.accessToken;
}

export async function apiFetch(path, options = {}, retry = true) {
  const headers = { ...(options.headers || {}) };
  const token = getAccessToken();
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (response.status === 401 && retry && getRefreshToken() && !path.includes('/api/auth/refresh')) {
    try {
      const nextToken = await refreshAccessToken();
      return apiFetch(path, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${nextToken}` } }, false);
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `API request failed: ${response.status}`);
  }
  return payload;
}

export function apiUpload(path, formData, onProgress) {
  const token = getAccessToken();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${getApiBaseUrl()}${path}`);
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      let payload = null;
      try {
        payload = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        payload = null;
      }
      if (request.status >= 200 && request.status < 300) resolve(payload);
      else reject(new Error(payload?.message || `Upload failed: ${request.status}`));
    };
    request.onerror = () => reject(new Error('Network error during upload.'));
    request.send(formData);
  });
}

export function apiJsonUpload(path, payload, onProgress) {
  const token = getAccessToken();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${getApiBaseUrl()}${path}`);
    request.setRequestHeader('Content-Type', 'application/json');
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      let responsePayload = null;
      try {
        responsePayload = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        responsePayload = null;
      }
      if (request.status >= 200 && request.status < 300) resolve(responsePayload);
      else reject(new Error(responsePayload?.message || `Upload failed: ${request.status}`));
    };
    request.onerror = () => reject(new Error('Network error during upload.'));
    request.send(JSON.stringify(payload));
  });
}
