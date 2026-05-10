import { getAccessToken } from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload.message || `API request failed: ${response.status}`);
  return payload;
}

export function apiUpload(path, formData, onProgress) {
  const token = getAccessToken();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}${path}`);
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const payload = request.responseText ? JSON.parse(request.responseText) : null;
      if (request.status >= 200 && request.status < 300) resolve(payload);
      else reject(new Error(payload?.message || `Upload failed: ${request.status}`));
    };
    request.onerror = () => reject(new Error('Network error during upload.'));
    request.send(formData);
  });
}
