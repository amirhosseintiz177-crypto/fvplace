import { commandItems, notificationsSeed, dashboardFallback, workspacesFallback, teamFallback, profileFallbackFiles } from './data.js';
import { getCurrentUser, saveSession, clearSession, isAuthenticated } from './auth.js';
import { apiFetch, getApiBaseUrl } from './api.js';
import { mountFileManager } from './file-manager.js';
import { renderStaticPage } from './render.js';
import { createElement, escapeHtml, formatBytes, initials, linkHref, qs, qsa, setDocumentTitle, timeAgoLabel } from './utils.js';

const page = document.body.dataset.page || 'home';
const routeSearch = new URLSearchParams(window.location.search);
const routeParams = {
  token: routeSearch.get('token') || document.body.dataset.token || 'demo',
  username: document.body.dataset.username || routeSearch.get('username') || 'nova',
};

const PREFERENCES_KEY = 'fvplace.preferences';
const LOCAL_WORKSPACES_KEY = 'fvplace.localWorkspaces';
const LOCAL_TEAM_KEY = 'fvplace.localTeam';
const RUNTIME_CONFIG_KEY = 'fvplace.runtimeConfig';
const LEGACY_HOST = 'facevipers.runflare.run';
const CURRENT_HOST = 'fvplace.runflare.run';

function getOriginFallback() {
  if (window.location?.origin) return window.location.origin;
  return 'http://127.0.0.1:3000';
}

function createDefaultRuntimeConfig() {
  const origin = getOriginFallback();
  return {
    appBaseUrl: origin,
    apiBaseUrl: origin,
  };
}

const defaultPreferences = {
  accent: 'mint',
  density: 'comfortable',
  motion: true,
  notifications: true,
};
const defaultRuntimeConfig = createDefaultRuntimeConfig();

const appRoot = document.getElementById('app');
const toasts = [];
let paletteBound = false;
let navigationBound = false;

function mountLoadingExperience() {
  if (!document.querySelector('.app-loader')) {
    const loader = createElement(`
      <div class="app-loader">
        <div class="app-loader__card">
          <div class="brand-mark">
            <span class="brand-mark__icon">FV</span>
            <span>
              <strong>FVPlace Vanilla</strong>
              <small>Loading polished file experience...</small>
            </span>
          </div>
          <div class="app-loader__bar"><span></span></div>
        </div>
      </div>
    `);
    document.body.appendChild(loader);
  }
  window.setTimeout(() => document.body.classList.add('is-ready'), 120);
}

function getPreferences() {
  try {
    return { ...defaultPreferences, ...(JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}') || {}) };
  } catch {
    return { ...defaultPreferences };
  }
}

function savePreferences(preferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  applyPreferences(preferences);
}

function applyPreferences(preferences = getPreferences()) {
  document.documentElement.dataset.accentTheme = preferences.accent;
  document.documentElement.dataset.uiDensity = preferences.density;
  document.documentElement.classList.toggle('reduced-motion', !preferences.motion);
}

function getLocalCollection(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalCollection(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function normalizeRuntimeUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const replacedHost = url.includes(LEGACY_HOST) ? url.replaceAll(LEGACY_HOST, CURRENT_HOST) : url;
  return replacedHost
    .replace(/^https?:\/\/fvplace\.runflare\.run:3000$/i, 'https://fvplace.runflare.run')
    .replace(/^https?:\/\/fvplace\.runflare\.run:4000$/i, 'https://fvplace.runflare.run');
}

function getRuntimeConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(RUNTIME_CONFIG_KEY) || '{}') || {};
    const raw = {
      ...defaultRuntimeConfig,
      ...stored,
      appBaseUrl: normalizeRuntimeUrl(stored.appBaseUrl || defaultRuntimeConfig.appBaseUrl),
      apiBaseUrl: normalizeRuntimeUrl(stored.apiBaseUrl || defaultRuntimeConfig.apiBaseUrl),
    };
    if (window.location.protocol === 'https:') {
      if (raw.appBaseUrl?.startsWith('http://')) raw.appBaseUrl = raw.appBaseUrl.replace('http://', 'https://');
      if (raw.apiBaseUrl?.startsWith('http://')) raw.apiBaseUrl = raw.apiBaseUrl.replace('http://', 'https://');
    }
    localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(raw));
    return raw;
  } catch {
    return { ...defaultRuntimeConfig };
  }
}

function saveRuntimeConfig(config) {
  const normalized = {
    ...config,
    appBaseUrl: normalizeRuntimeUrl(config.appBaseUrl),
    apiBaseUrl: normalizeRuntimeUrl(config.apiBaseUrl),
  };
  localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(normalized));
  window.FVPLACE_CONFIG = { ...(window.FVPLACE_CONFIG || {}), ...normalized };
}

function renderApp() {
  applyPreferences();
  window.FVPLACE_CONFIG = { ...(window.FVPLACE_CONFIG || {}), ...getRuntimeConfig() };
  const user = getCurrentUser();
  const { title, html } = renderStaticPage(page, { user, ...routeParams });
  setDocumentTitle(title);
  document.body.classList.remove('page-leaving');
  appRoot.innerHTML = html;
  mountSharedUI();
  mountPageEnhancements();
  mountLinkTransitions();
}

function mountSharedUI() {
  qsa('.js-logout').forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.href = linkHref('/login/');
    });
  });

  if (['dashboard', 'files', 'workspaces', 'team', 'activity', 'settings'].includes(page)) {
    if (getPreferences().notifications) mountNotificationDock();
    mountCommandPalette();
  }
}

function mountLinkTransitions() {
  if (navigationBound) return;
  navigationBound = true;
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 220);
  });
}

function mountNotificationDock() {
  if (document.querySelector('.notification-dock')) return;
  const dock = createElement('<div class="notification-dock"></div>');
  document.body.appendChild(dock);
  notificationsSeed.slice(0, 2).forEach((message, index) => {
    window.setTimeout(() => {
      const item = createElement(`<div class="notification-item">${escapeHtml(message)}</div>`);
      dock.appendChild(item);
      window.setTimeout(() => item.remove(), 4600 + index * 500);
    }, 300 + index * 400);
  });
}

function mountCommandPalette() {
  if (paletteBound) return;
  paletteBound = true;
  let overlay = null;

  const close = () => {
    overlay?.remove();
    overlay = null;
  };

  const open = () => {
    if (overlay) return close();
    overlay = createElement(`
      <div class="command-overlay">
        <div class="command-dialog">
          <div class="inline-actions" style="justify-content: space-between;">
            <span>Command Palette</span>
            <span><span class="kbd">Esc</span> بستن</span>
          </div>
          <input class="command-input mt-3" placeholder="مثلا: داشبورد، فایل، امنیت..." />
          <div class="command-list mt-3 js-command-list"></div>
        </div>
      </div>
    `);

    const input = overlay.querySelector('.command-input');
    const list = overlay.querySelector('.js-command-list');

    const items = [
      ...commandItems,
      { label: 'رفتن به تنظیمات تجربه وانیلا', href: '/settings/' },
      { label: 'ساخت workspace جدید', href: '/workspaces/' },
      { label: 'مرور صفحه اشتراک', href: '/share/demo/' },
    ];

    const update = () => {
      const query = input.value.trim();
      const filtered = items.filter((item) => !query || item.label.includes(query));
      list.innerHTML = (filtered.length ? filtered : items)
        .map((item) => `<a class="surface-card" href="${linkHref(item.href)}">${escapeHtml(item.label)}</a>`)
        .join('');
      qsa('a', list).forEach((link) => link.addEventListener('click', close));
    };

    input.addEventListener('input', update);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.body.appendChild(overlay);
    update();
    input.focus();
  };

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
    if (event.key === 'Escape') close();
  });
}

function mountToastSystem() {
  if (document.querySelector('.toast-stack')) return;
  const stack = createElement('<div class="toast-stack"></div>');
  document.body.appendChild(stack);

  function renderToasts() {
    stack.innerHTML = toasts
      .map((item) => `<div class="toast is-${escapeHtml(item.type)}">${escapeHtml(item.message)}</div>`)
      .join('');
  }

  window.addEventListener('fvplace:toast', (event) => {
    const detail = event.detail || {};
    const item = { id: Date.now() + Math.random(), message: detail.message || '', type: detail.type || 'success' };
    toasts.push(item);
    renderToasts();
    window.setTimeout(() => {
      const index = toasts.findIndex((entry) => entry.id === item.id);
      if (index >= 0) {
        toasts.splice(index, 1);
        renderToasts();
      }
    }, 3600);
  });
}

function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('fvplace:toast', { detail: { message, type } }));
}

async function mountAuthPage() {
  const form = qs('.js-auth-form');
  const alertRoot = qs('.js-auth-alert');
  const passwordField = qs('.js-password-field');
  const toggle = qs('.js-password-toggle');
  if (!form) return;

  toggle?.addEventListener('click', () => {
    const nextType = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = nextType;
    toggle.textContent = nextType === 'password' ? 'نمایش' : 'پنهان';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const mode = form.dataset.mode;
    submit.disabled = true;
    submit.textContent = 'در حال ارسال...';
    alertRoot.className = 'js-auth-alert hidden';
    alertRoot.innerHTML = '';

    const payload = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || ''),
    };
    if (mode === 'register') payload.name = String(formData.get('name') || '').trim();

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');
      saveSession(data);
      window.location.href = linkHref('/files/');
    } catch (error) {
      alertRoot.className = 'notice is-danger js-auth-alert mt-4';
      alertRoot.textContent = error.message;
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'register' ? 'ساخت حساب' : 'ورود به پنل';
    }
  });
}

async function mountDashboardData() {
  if (!isAuthenticated()) return;
  try {
    const summary = await apiFetch('/api/dashboard/summary');
    const statsRoot = qs('.js-dashboard-stats');
    const filesRoot = qs('.js-dashboard-files');
    const activityRoot = qs('.js-dashboard-activity');

    if (statsRoot) {
      const workspacesCount = summary.workspaces?.length || dashboardFallback.stats[2].value;
      const totalShares = summary.recentActivity?.filter((item) => item.action === 'share').length || 0;
      statsRoot.innerHTML = [
        { label: 'فایل فعال', value: String(summary.storage?.fileCount || 0) },
        { label: 'لینک اشتراک', value: String(totalShares) },
        { label: 'همکار تیمی', value: String(workspacesCount) },
        { label: 'حجم مصرفی', value: formatBytes(summary.storage?.totalBytes || 0) },
      ]
        .map((stat) => `<div class="info-tile"><span class="muted">${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></div>`)
        .join('');
    }

    if (filesRoot && summary.recentFiles?.length) {
      filesRoot.innerHTML = summary.recentFiles
        .map((file) => `<div class="info-tile"><p class="mt-0"><strong>${escapeHtml(file.name)}</strong></p><p class="muted mt-2">${escapeHtml(timeAgoLabel(file.updatedAt))}</p></div>`)
        .join('');
    }

    if (activityRoot && summary.recentActivity?.length) {
      activityRoot.innerHTML = summary.recentActivity
        .map(
          (item, index) => `
            <div class="file-row">
              <div class="activity-index text-brand">0${index + 1}</div>
              <div class="activity-copy">
                <p class="mt-0"><strong>${escapeHtml(item.message)}</strong></p>
                <p class="muted mt-1">${escapeHtml(timeAgoLabel(item.createdAt))}</p>
              </div>
            </div>
          `,
        )
        .join('');
    }
  } catch (error) {
    toast(error.message, 'danger');
  }
}

function renderWorkspaceList(items) {
  const list = qs('.js-workspaces-list .stack');
  if (!list) return;
  list.innerHTML = items
    .map((workspace) => {
      const membersCount = workspace.members?.length || workspace.members || 1;
      const role = workspace.role || workspace.members?.[0]?.role || 'member';
      const storage = workspace.storageQuotaBytes ? formatBytes(workspace.storageQuotaBytes) : workspace.storage || '1 GB';
      return `
        <div class="workspace-card">
          <div class="content-grid">
            <div>
              <h2>${escapeHtml(workspace.name)}</h2>
              <p class="workspace-meta">نقش شما: ${escapeHtml(role)}</p>
            </div>
            <div class="workspace-meta">
              <p class="mt-0">اعضا: ${escapeHtml(String(membersCount))}</p>
              <p class="mt-1">حجم سهمیه: ${escapeHtml(storage)}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

async function mountWorkspacesData() {
  const summary = qs('.js-workspace-summary');
  let localWorkspaces = getLocalCollection(LOCAL_WORKSPACES_KEY, workspacesFallback);

  async function createWorkspace() {
    const name = window.prompt('نام workspace جدید چیست؟');
    if (!name) return;
    if (isAuthenticated()) {
      try {
        await apiFetch('/api/workspaces', { method: 'POST', body: JSON.stringify({ name }) });
        toast('Workspace جدید ساخته شد.');
        await loadWorkspaces();
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }

    localWorkspaces = [
      {
        name,
        role: 'Owner',
        members: 1,
        storage: '0 GB',
      },
      ...localWorkspaces,
    ];
    saveLocalCollection(LOCAL_WORKSPACES_KEY, localWorkspaces);
    renderWorkspaceList(localWorkspaces);
    if (summary) summary.textContent = `Workspace «${name}» در حالت دموی وانیلا ساخته شد.`;
    toast('Workspace دموی جدید اضافه شد.');
  }

  async function loadWorkspaces() {
    if (!isAuthenticated()) {
      renderWorkspaceList(localWorkspaces);
      if (summary) summary.textContent = `در حال حاضر ${localWorkspaces.length} workspace ذخیره شده روی همین مرورگر دارید.`;
      return;
    }

    try {
      const payload = await apiFetch('/api/workspaces');
      renderWorkspaceList(payload.items || []);
      if (summary) summary.textContent = `${payload.items?.length || 0} workspace از API بارگذاری شد.`;
    } catch (error) {
      renderWorkspaceList(localWorkspaces);
      if (summary) summary.textContent = 'اتصال API برقرار نشد؛ داده های محلی قبلی نمایش داده شدند.';
      toast(error.message, 'danger');
    }
  }

  qs('.js-create-workspace')?.addEventListener('click', createWorkspace);
  await loadWorkspaces();
}

async function mountActivityData() {
  if (!isAuthenticated()) return;
  try {
    const workspaces = await apiFetch('/api/workspaces');
    const workspaceId = workspaces.items?.[0]?._id;
    if (!workspaceId) return;
    const payload = await apiFetch(`/api/workspaces/${workspaceId}/activity`);
    const list = qs('.js-activity-list .stack');
    if (!list || !payload.items?.length) return;
    list.innerHTML = payload.items
      .map(
        (item, index) => `
          <div class="activity-card file-row">
            <div class="activity-index text-brand">0${index + 1}</div>
            <div class="activity-copy">
              <p class="muted mt-0">${escapeHtml(item.action)}</p>
              <h2 class="mt-1">${escapeHtml(item.message)}</h2>
              <p class="member-meta">${escapeHtml(timeAgoLabel(item.createdAt))}</p>
            </div>
          </div>
        `,
      )
      .join('');
  } catch (error) {
    toast(error.message, 'danger');
  }
}

function renderTeamList(items) {
  const list = qs('.js-team-list');
  if (!list) return;
  list.innerHTML = items
    .map(
      (member, index) => `
        <div class="member-card">
          <div class="content-grid">
            <div class="file-main">
              <div class="member-index ${escapeHtml(member.accent || 'text-brand')}">${index + 1}</div>
              <div class="member-copy">
                <h2>${escapeHtml(member.name)}</h2>
                <p class="member-meta">${escapeHtml(member.role)}</p>
              </div>
            </div>
            <div class="status-pill">${escapeHtml(member.status)}</div>
          </div>
        </div>
      `,
    )
    .join('');
}

function mountTeamPage() {
  const hint = qs('.js-team-hint');
  let localTeam = getLocalCollection(LOCAL_TEAM_KEY, teamFallback);
  renderTeamList(localTeam);

  async function loadTeamFromApi() {
    if (!isAuthenticated()) {
      if (hint) hint.textContent = localTeam.length ? `تعداد اعضای ثبت شده محلی: ${localTeam.length}` : 'هنوز عضوی ثبت نشده است.';
      return;
    }
    try {
      const workspacePayload = await apiFetch('/api/workspaces');
      const workspace = workspacePayload.items?.[0];
      const members = workspace?.members || [];
      const mapped = members.map((m, i) => ({ name: `Member ${i + 1}`, role: m.role || 'viewer', status: 'Active', accent: 'text-brand' }));
      renderTeamList(mapped);
      if (hint) hint.textContent = `اعضای واقعی workspace: ${mapped.length}`;
    } catch (error) {
      if (hint) hint.textContent = 'خواندن اعضای تیم از API ناموفق بود.';
      toast(error.message, 'warning');
    }
  }
  loadTeamFromApi();

  qs('.js-invite-member')?.addEventListener('click', async () => {
    const name = window.prompt('نام عضو جدید چیست؟');
    if (!name) return;
    const role = window.prompt('نقش عضو چیست؟', 'Viewer') || 'Viewer';

    if (isAuthenticated()) {
      try {
        const workspacePayload = await apiFetch('/api/workspaces');
        const workspaceId = workspacePayload.items?.[0]?._id;
        if (!workspaceId) throw new Error('هیچ workspace فعالی برای دعوت پیدا نشد.');
        const userId = `invited-${Date.now()}`;
        await apiFetch(`/api/workspaces/${workspaceId}/invites`, {
          method: 'POST',
          body: JSON.stringify({ userId, role: role.toLowerCase() }),
        });
        if (hint) hint.textContent = `دعوت واقعی برای ${name} ثبت شد.`;
        toast(`دعوت برای «${name}» از طریق API ثبت شد.`);
        return;
      } catch (error) {
        toast(error.message, 'warning');
      }
    }

    const item = {
      name,
      role,
      status: 'Just invited',
      accent: 'text-brand',
    };
    localTeam = [item, ...localTeam];
    saveLocalCollection(LOCAL_TEAM_KEY, localTeam);
    renderTeamList(localTeam);
    if (hint) hint.textContent = `دعوت برای ${name} ثبت شد و در نسخه وانیلا ذخیره شد.`;
    toast(`عضو جدید «${name}» به لیست تیم اضافه شد.`);
  });
}

function mountFilesPage() {
  const root = qs('.js-file-manager-root');
  if (root) mountFileManager(root);
}

async function mountProfileData() {
  const root = qs('.js-profile-root');
  if (!root) return;
  const currentUser = getCurrentUser();
  const username = isAuthenticated()
    ? currentUser?.publicProfile?.username || currentUser?.name || routeParams.username
    : root.dataset.username || routeParams.username;
  const avatar = qs('.profile-avatar', root);
  const title = qs('.display-title', root);
  const metaBox = qs('.profile-hero-meta', root);
  const filesRoot = qs('.js-profile-files', root);
  try {
    const payload = isAuthenticated()
      ? await apiFetch(`/api/profiles/${encodeURIComponent(username)}`, {}, false)
      : await fetch('/vanilla-api/profile/guest').then((response) => response.json());
    if (avatar) avatar.textContent = initials(payload.user?.name || username);
    if (title) title.textContent = `@${payload.user?.publicProfile?.username || payload.profile?.username || username}`;
    if (metaBox) {
      const profileFiles = payload.files || [];
      metaBox.innerHTML = `
        <p class="mt-0">نوع حساب: ${escapeHtml(isAuthenticated() ? 'پروفایل عمومی شما' : 'پروفایل مهمان')}</p>
        <p class="mt-2">فایل های عمومی: ${escapeHtml(String(profileFiles.length || 0))}</p>
        <p class="mt-2">آخرین به روزرسانی: ${escapeHtml(profileFiles[0] ? timeAgoLabel(profileFiles[0].updatedAt) : 'هنوز فایلی آپلود نشده')}</p>
      `;
    }
    if (filesRoot) {
      const visibleFiles = payload.files?.length ? payload.files : [];
      filesRoot.innerHTML = (visibleFiles.length ? visibleFiles : [{ empty: true }])
        .map((file) => file.empty
          ? `<article class="profile-card"><h3 class="mt-0">هنوز فایلی منتشر نشده</h3><p class="muted mt-2">وقتی کاربر اولین فایل عمومی خود را آپلود کند، اینجا فقط همان فایل های واقعی دیده می شوند.</p></article>`
          : `<article class="profile-card"><h3 class="mt-0">${escapeHtml(file.name)}</h3><p class="muted mt-2">${file.size ? `${escapeHtml(formatBytes(file.size))} • ` : ''}فایل عمومی آماده نمایش و دانلود</p></article>`)
        .join('');
    }
  } catch {
    if (avatar) avatar.textContent = initials(username);
    if (title) title.textContent = `@${username}`;
    if (metaBox) metaBox.innerHTML = '<p class="mt-0">این پروفایل هنوز محتوای عمومی ندارد.</p><p class="mt-2">بعد از اولین آپلود عمومی، اطلاعات واقعی همین جا نمایش داده می شود.</p>';
    if (filesRoot) filesRoot.innerHTML = '<article class="profile-card"><h3 class="mt-0">هیچ فایل عمومی ثبت نشده</h3><p class="muted mt-2">برای شروع، یک فایل آپلود کنید و سپس به این صفحه برگردید.</p></article>';
  }

  qs('.js-profile-cta')?.addEventListener('click', () => {
    toast('می توانید این CTA را به فرم تماس، ایمیل یا درخواست فایل متصل کنید.', 'success');
  });
}

function renderDemoShare(root, token) {
  const card = qs('.js-share-card', root);
  const metrics = qs('.js-share-metrics', root);
  const demoName = routeSearch.get('name') || 'Brand-System.pdf';
  const demoType = routeSearch.get('type') || 'application/pdf';
  const demoSize = Number(routeSearch.get('size') || 2400000);

  if (metrics) {
    metrics.innerHTML = `
      <div class="info-tile"><span class="muted">توکن</span><strong>${escapeHtml(token)}</strong></div>
      <div class="info-tile"><span class="muted">نوع فایل</span><strong>${escapeHtml(demoType)}</strong></div>
      <div class="info-tile"><span class="muted">حجم</span><strong>${escapeHtml(formatBytes(demoSize))}</strong></div>
    `;
  }

  if (card) {
    card.innerHTML = `
      <p class="caps-label mt-0">Demo Share Ready</p>
      <h2 class="mt-2">${escapeHtml(demoName)}</h2>
      <p class="subtle-copy mt-3">برای نمایش این فایل باید لینک اشتراک واقعی ساخته شود. از بخش فایل ها یک لینک جدید بسازید و دوباره این صفحه را باز کنید.</p>
      <div class="preview-hint mt-4" style="aspect-ratio: 16 / 9;">Preview آماده بعد از اتصال API</div>
      <div class="share-resolve-form mt-4">
        <button class="btn-primary js-share-download">دانلود دمو</button>
        <button class="btn-ghost js-share-request">درخواست نسخه جدید</button>
        <button class="btn-soft js-share-copy" type="button">کپی لینک صفحه</button>
      </div>
    `;
  }
}

async function mountShareData() {
  const root = qs('.js-share-root');
  if (!root) return;
  const token = routeSearch.get('token') || root.dataset.token || routeParams.token;
  const downloadButton = () => qs('.js-share-download', root);
  const requestButton = () => qs('.js-share-request', root);
  const copyButton = () => qs('.js-share-copy', root);
  const openPreviewButton = () => qs('.js-share-preview', root);
  const downloadDirectButton = () => qs('.js-share-direct-download', root);

  function previewMarkup(file, previewUrl) {
    const mimeType = file?.mimeType || '';
    if (mimeType.startsWith('image/')) return `<img src="${escapeHtml(previewUrl)}" alt="preview" />`;
    if (mimeType.startsWith('video/')) return `<video controls src="${escapeHtml(previewUrl)}"></video>`;
    if (mimeType.startsWith('audio/')) return `<div style="padding: 1rem;"><audio controls src="${escapeHtml(previewUrl)}" style="width:100%;"></audio></div>`;
    if (mimeType.includes('pdf') || mimeType.startsWith('text/')) return `<iframe src="${escapeHtml(previewUrl)}"></iframe>`;
    return `<div class="empty-state"><p>برای این نوع فایل پیش نمایش داخلی در دسترس نیست، اما می توانید آن را مستقیم دانلود کنید.</p></div>`;
  }

  async function resolveShare(password = '') {
    const payload = await apiFetch(`/api/share/${encodeURIComponent(token)}/resolve`, {
      method: 'POST',
      body: JSON.stringify(password ? { password } : {}),
    }, false);
    const metrics = qs('.js-share-metrics', root);
    const card = qs('.js-share-card', root);

    if (metrics) {
      metrics.innerHTML = `
        <div class="info-tile"><span class="muted">توکن</span><strong>${escapeHtml(token)}</strong></div>
        <div class="info-tile"><span class="muted">نوع فایل</span><strong>${escapeHtml(payload.file?.mimeType || 'File')}</strong></div>
        <div class="info-tile"><span class="muted">حجم</span><strong>${escapeHtml(formatBytes(payload.file?.size || 0))}</strong></div>
      `;
    }
    if (card) {
      const previewUrl = payload.previewUrl.startsWith('/api/') ? `${getApiBaseUrl()}${payload.previewUrl}` : payload.previewUrl;
      card.innerHTML = `
        <p class="caps-label mt-0">لینک اشتراک آماده است</p>
        <h2 class="mt-2">${escapeHtml(payload.file?.name || 'Shared file')}</h2>
        <p class="subtle-copy mt-3">فایل با موفقیت آماده شد. می توانید پیش نمایش را ببینید، لینک را کپی کنید یا فایل را مستقیم دانلود بگیرید.</p>
        <div class="preview-media mt-4">${previewMarkup(payload.file, previewUrl)}</div>
        <img class="share-qr" src="${escapeHtml(payload.qrCodeDataUrl)}" alt="QR code" />
        <div class="share-resolve-form mt-4">
          <a class="btn-primary js-share-direct-download" href="${escapeHtml(previewUrl)}" target="_blank" rel="noreferrer" download>دانلود فایل</a>
          <a class="btn-secondary js-share-preview" href="${escapeHtml(previewUrl)}" target="_blank" rel="noreferrer">باز کردن پیش نمایش</a>
          <button class="btn-ghost js-share-request">درخواست نسخه جدید</button>
          <button class="btn-soft js-share-copy" type="button">کپی لینک صفحه</button>
        </div>
      `;
      bindShareActions();
    }
  }

  function bindShareActions() {
    downloadButton()?.addEventListener('click', async () => {
      if (token === 'demo') {
        toast('این لینک نمایشی است. برای لینک واقعی از داخل بخش فایل ها، اشتراک بسازید.', 'warning');
        return;
      }
      try {
        await resolveShare();
      } catch (error) {
        if (String(error.message).toLowerCase().includes('password')) {
          const password = window.prompt('این لینک رمز دارد. رمز را وارد کنید:');
          if (!password) return;
          try {
            await resolveShare(password);
          } catch (secondError) {
            toast(secondError.message, 'danger');
          }
        } else {
          renderDemoShare(root, token);
          bindShareActions();
          toast(error.message, 'danger');
        }
      }
    });

    requestButton()?.addEventListener('click', () => {
      toast('درخواست نسخه جدید می تواند به ایمیل یا فرم پیگیری متصل شود.', 'success');
    });

    openPreviewButton()?.addEventListener('click', () => {
      toast('پیش نمایش فایل در تب جدید باز شد.', 'success');
    });

    downloadDirectButton()?.addEventListener('click', () => {
      toast('دانلود فایل شروع شد.', 'success');
    });

    copyButton()?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast('لینک صفحه اشتراک کپی شد.');
      } catch {
        toast('کپی خودکار انجام نشد. لینک را دستی کپی کنید.', 'warning');
      }
    });
  }

  renderDemoShare(root, token);
  bindShareActions();
  if (token && token !== 'demo') {
    resolveShare().catch((error) => {
      renderDemoShare(root, token);
      bindShareActions();
      toast(error.message, 'danger');
    });
  }
}

function mountSettingsPage() {
  const form = qs('.js-settings-form');
  if (!form) return;
  const resetButton = qs('.js-reset-settings');
  const testButton = qs('.js-test-api');
  const exportButton = qs('.js-export-settings');
  const importButton = qs('.js-apply-import');
  const importField = qs('.js-import-settings');
  const status = qs('.js-settings-status');
  const initialPreferences = getPreferences();
  const initialRuntimeConfig = getRuntimeConfig();
  form.elements.accent.value = initialPreferences.accent;
  form.elements.density.value = initialPreferences.density;
  form.elements.motion.checked = Boolean(initialPreferences.motion);
  form.elements.notifications.checked = Boolean(initialPreferences.notifications);
  form.elements.appBaseUrl.value = initialRuntimeConfig.appBaseUrl;
  form.elements.apiBaseUrl.value = initialRuntimeConfig.apiBaseUrl;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextPreferences = {
      accent: form.elements.accent.value,
      density: form.elements.density.value,
      motion: form.elements.motion.checked,
      notifications: form.elements.notifications.checked,
    };
    const nextRuntimeConfig = {
      appBaseUrl: form.elements.appBaseUrl.value.trim() || defaultRuntimeConfig.appBaseUrl,
      apiBaseUrl: form.elements.apiBaseUrl.value.trim() || defaultRuntimeConfig.apiBaseUrl,
    };
    savePreferences(nextPreferences);
    saveRuntimeConfig(nextRuntimeConfig);
    status.className = 'status-pill js-settings-status is-success';
    status.textContent = 'ذخیره شد';
    toast('تنظیمات تجربه وانیلا ذخیره شد.');
  });

  resetButton?.addEventListener('click', () => {
    savePreferences(defaultPreferences);
    saveRuntimeConfig(defaultRuntimeConfig);
    form.elements.accent.value = defaultPreferences.accent;
    form.elements.density.value = defaultPreferences.density;
    form.elements.motion.checked = defaultPreferences.motion;
    form.elements.notifications.checked = defaultPreferences.notifications;
    form.elements.appBaseUrl.value = defaultRuntimeConfig.appBaseUrl;
    form.elements.apiBaseUrl.value = defaultRuntimeConfig.apiBaseUrl;
    status.className = 'status-pill js-settings-status is-warning';
    status.textContent = 'بازنشانی شد';
    toast('تنظیمات به حالت پیش فرض برگشت.');
  });

  testButton?.addEventListener('click', async () => {
    status.className = 'status-pill js-settings-status';
    status.textContent = 'در حال تست';
    try {
      const response = await fetch(`${form.elements.apiBaseUrl.value.trim() || getApiBaseUrl()}/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const payload = await response.json();
      status.className = 'status-pill js-settings-status is-success';
      status.textContent = payload.ok ? 'API سالم است' : 'پاسخ غیرمنتظره';
      toast('اتصال API با موفقیت تست شد.');
    } catch (error) {
      status.className = 'status-pill js-settings-status is-danger';
      status.textContent = 'اتصال ناموفق';
      toast(error.message, 'danger');
    }
  });

  exportButton?.addEventListener('click', async () => {
    const payload = JSON.stringify({ ...getPreferences(), ...getRuntimeConfig() }, null, 2);
    importField.value = payload;
    try {
      await navigator.clipboard.writeText(payload);
      toast('تنظیمات به صورت JSON کپی شد.');
    } catch {
      toast('JSON تنظیمات داخل باکس قرار گرفت.', 'warning');
    }
  });

  importButton?.addEventListener('click', () => {
    try {
      const payload = JSON.parse(importField.value || '{}');
      const nextPreferences = {
        accent: payload.accent || defaultPreferences.accent,
        density: payload.density || defaultPreferences.density,
        motion: typeof payload.motion === 'boolean' ? payload.motion : defaultPreferences.motion,
        notifications: typeof payload.notifications === 'boolean' ? payload.notifications : defaultPreferences.notifications,
      };
      const nextRuntimeConfig = {
        appBaseUrl: payload.appBaseUrl || defaultRuntimeConfig.appBaseUrl,
        apiBaseUrl: payload.apiBaseUrl || defaultRuntimeConfig.apiBaseUrl,
      };
      savePreferences(nextPreferences);
      saveRuntimeConfig(nextRuntimeConfig);
      form.elements.accent.value = nextPreferences.accent;
      form.elements.density.value = nextPreferences.density;
      form.elements.motion.checked = nextPreferences.motion;
      form.elements.notifications.checked = nextPreferences.notifications;
      form.elements.appBaseUrl.value = nextRuntimeConfig.appBaseUrl;
      form.elements.apiBaseUrl.value = nextRuntimeConfig.apiBaseUrl;
      status.className = 'status-pill js-settings-status is-success';
      status.textContent = 'اعمال شد';
      toast('تنظیمات وارد و اعمال شدند.');
    } catch (error) {
      status.className = 'status-pill js-settings-status is-danger';
      status.textContent = 'JSON نامعتبر';
      toast(error.message, 'danger');
    }
  });
}

function mountPageEnhancements() {
  if (page === 'login' || page === 'register') {
    mountAuthPage();
    return;
  }

  if (page === 'dashboard') mountDashboardData();
  if (page === 'workspaces') mountWorkspacesData();
  if (page === 'activity') mountActivityData();
  if (page === 'team') mountTeamPage();
  if (page === 'files') mountFilesPage();
  if (page === 'profile') mountProfileData();
  if (page === 'share') mountShareData();
  if (page === 'settings') mountSettingsPage();
}

mountToastSystem();
mountLoadingExperience();
renderApp();
