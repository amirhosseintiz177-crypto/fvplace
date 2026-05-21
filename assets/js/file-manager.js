import { fileManagerFallback } from './data.js';
import { apiFetch, apiJsonUpload, getApiBaseUrl, getAppBaseUrl } from './api.js';
import { getAccessToken } from './auth.js';
import { createElement, debounce, escapeHtml, formatBytes, friendlyType, iconFor, linkHref } from './utils.js';

const DEMO_FILES_KEY = 'fvplace.demoFiles';
const FAVORITES_KEY = 'fvplace.fileFavorites';
const NOTES_KEY = 'fvplace.fileNotes';
const SEARCHES_KEY = 'fvplace.recentSearches';
const LAST_WORKSPACE_KEY = 'fvplace.lastWorkspace';
const FOLDER_TREE_COLLAPSE_KEY = 'fvplace.folderTreeCollapsed';
const GUEST_WORKSPACE_ID = 'guest-workspace';

function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('fvplace:toast', { detail: { message, type } }));
}

function modalFrame(content) {
  return createElement(`<div class="modal-overlay">${content}</div>`);
}

function closeOnOverlay(element, callback) {
  element.addEventListener('click', (event) => {
    if (event.target === element) callback();
  });
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function guestFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload?.message || `Guest request failed: ${response.status}`);
  return payload;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
    reader.readAsDataURL(file);
  });
}

function getDemoFiles() {
  const parsed = readJson(DEMO_FILES_KEY, null);
  return Array.isArray(parsed) && parsed.length ? parsed : [...fileManagerFallback.files];
}

function getFavorites() {
  return readJson(FAVORITES_KEY, []);
}

function getNotes() {
  return readJson(NOTES_KEY, {});
}

function getRecentSearches() {
  return readJson(SEARCHES_KEY, []);
}

function getCollapsedFolders() {
  return readJson(FOLDER_TREE_COLLAPSE_KEY, []);
}

function saveDemoFiles(files) {
  writeJson(DEMO_FILES_KEY, files);
}

function saveFavorites(favorites) {
  writeJson(FAVORITES_KEY, favorites);
}

function saveNotes(notes) {
  writeJson(NOTES_KEY, notes);
}

function saveRecentSearches(searches) {
  writeJson(SEARCHES_KEY, searches);
}

function saveCollapsedFolders(items) {
  writeJson(FOLDER_TREE_COLLAPSE_KEY, items);
}

function shareModal(share) {
  return createElement(`
    <div class="modal-card share-modal-card">
      <h2 class="mt-0">لینک اشتراک ساخته شد</h2>
      <p class="muted mt-2">این لینک آماده ارسال به مشتری، همکار یا مخاطب نهایی است و صفحه مقصد هم با پیش نمایش و مسیر دانلود روشن باز می شود.</p>
      <input readonly class="share-input mt-4" value="${escapeHtml(share.url)}" />
      <img src="${escapeHtml(share.qrCodeDataUrl)}" alt="QR Code" class="share-qr" />
      <div class="three-col mt-4 compact-grid">
        <div class="surface-card"><p class="muted mt-0">وضعیت</p><strong class="mt-2">آماده ارسال</strong></div>
        <div class="surface-card"><p class="muted mt-0">رمز</p><strong class="mt-2">${escapeHtml(share.password ? 'فعال' : 'ندارد')}</strong></div>
        <div class="surface-card"><p class="muted mt-0">انقضا</p><strong class="mt-2">${escapeHtml(share.expiresAt ? 'زمان بندی شده' : 'بدون انقضا')}</strong></div>
      </div>
      <div class="hero-actions mt-4">
        <button class="btn-primary js-copy-share">کپی لینک</button>
        <a class="btn-soft" href="${escapeHtml(share.url)}" target="_blank" rel="noreferrer">باز کردن صفحه</a>
        <button class="btn-ghost js-close-modal">بستن</button>
      </div>
    </div>
  `);
}

function uploadModal(workspaces, workspaceId) {
  return createElement(`
    <div class="modal-card upload-modal-card">
      <h2 class="mt-0">آپلود پیشرفته</h2>
      <p class="muted mt-3">اینجا workspace مقصد، توضیح و مسیر آپلود را شفاف تر می کنیم تا حس یک محصول کامل تر ایجاد شود.</p>
      <div class="three-col mt-4">
        <div class="surface-card">تا 1024MB برای هر فایل</div>
        <div class="surface-card">آپلود چندفایلی</div>
        <div class="surface-card">صف و پیشرفت زنده</div>
      </div>
      <div class="form-row mt-4">
        <label class="form-row">
          <span>Workspace مقصد</span>
          <select class="select js-upload-workspace">
            ${(workspaces.length ? workspaces : [{ _id: GUEST_WORKSPACE_ID, name: 'فضای شخصی من' }])
              .map((workspace) => `<option value="${escapeHtml(workspace._id || workspace.id || GUEST_WORKSPACE_ID)}" ${String(workspace._id || workspace.id || GUEST_WORKSPACE_ID) === String(workspaceId || GUEST_WORKSPACE_ID) ? 'selected' : ''}>${escapeHtml(workspace.name)}</option>`)
              .join('')}
          </select>
        </label>
        <label class="form-row">
          <span>یادداشت آپلود</span>
          <input class="field js-upload-note" placeholder="مثلا: فایل های نهایی کمپین بهار" />
        </label>
      </div>
      <div class="hero-actions mt-4">
        <button class="btn-primary js-open-picker">انتخاب فایل ها</button>
        <button class="btn-ghost js-close-modal">انصراف</button>
      </div>
    </div>
  `);
}

function moveModal(file, folders) {
  return createElement(`
    <div class="modal-card">
      <h2 class="mt-0">جابجایی ${escapeHtml(file.name)}</h2>
      <p class="muted mt-2">فایل را به یک پوشه دیگر منتقل کنید.</p>
      <div class="form-row mt-4">
        <select class="select js-move-folder">
          <option value="">ریشه workspace</option>
          ${folders
            .filter((item) => (item._id || item.id) !== (file._id || file.id))
            .map((folder) => `<option value="${escapeHtml(folder._id || folder.id)}">${escapeHtml(folder.name)}</option>`)
            .join('')}
        </select>
      </div>
      <div class="hero-actions mt-4">
        <button class="btn-primary js-confirm-move">جابجا کن</button>
        <button class="btn-ghost js-close-modal">لغو</button>
      </div>
    </div>
  `);
}

function shareOptionsModal(file) {
  return createElement(`
    <div class="modal-card">
      <h2 class="mt-0">تنظیمات اشتراک برای ${escapeHtml(file.name)}</h2>
      <p class="muted mt-2">اگر API بالا باشد، این تنظیمات به لینک اشتراک واقعی اعمال می شوند.</p>
      <form class="form-row mt-4 js-share-options-form">
        <label class="form-row">
          <span>رمز اختیاری</span>
          <input class="field" name="password" minlength="4" placeholder="مثلا 1234" />
        </label>
        <label class="form-row">
          <span>حداکثر دانلود</span>
          <input class="field" name="downloadLimit" type="number" min="0" value="25" />
        </label>
        <label class="form-row">
          <span>انقضا (اختیاری)</span>
          <input class="field" name="expiresAt" type="datetime-local" />
        </label>
        <div class="hero-actions mt-4">
          <button class="btn-primary" type="submit">ساخت لینک</button>
          <button class="btn-ghost js-close-modal" type="button">انصراف</button>
        </div>
      </form>
    </div>
  `);
}

function renderFolderTree(items, currentParent, collapsedFolders, depth = 0) {
  if (!items.length) return '';
  return items
    .map((folder) => {
      const folderId = String(folder._id || folder.id);
      const collapsed = collapsedFolders.includes(folderId);
      return `
        <div class="folder-tree-group">
          <div
            class="folder-tree-item ${String(currentParent) === folderId ? 'is-active' : ''}"
            style="--tree-depth:${depth};"
          >
            <button class="folder-tree-toggle" data-folder-toggle="${escapeHtml(folderId)}" aria-label="toggle folder">${collapsed ? '+' : '-'}</button>
            <button class="folder-tree-link" data-folder-nav="${escapeHtml(folderId)}">
              <span>DIR</span>
              <strong>${escapeHtml(folder.name)}</strong>
            </button>
          </div>
          <div class="folder-tree-children ${collapsed ? 'is-collapsed' : ''}">
            ${renderFolderTree(folder.children || [], currentParent, collapsedFolders, depth + 1)}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderQueueItem(item) {
  return `
    <div class="queue-item ${item.status === 'خطا' ? 'is-danger' : ''}">
      <div class="inline-actions" style="justify-content: space-between; align-items: start; gap: 0.75rem;">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p class="muted mt-1">${escapeHtml(item.note || item.status)}</p>
        </div>
        <div class="text-left">
          <span>${escapeHtml(item.status === 'در حال آپلود' || item.status === 'در حال آماده سازی' ? `${item.progress}%` : item.status)}</span>
          ${item.speed ? `<p class="muted mt-1">${escapeHtml(item.speed)}</p>` : ''}
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${item.progress}%"></div></div>
    </div>
  `;
}

function renderPreview(preview, notes) {
  if (!preview) {
    return `
      <section class="file-preview preview-panel">
        <h3 class="mt-0">پیش نمایش هوشمند</h3>
        <div class="preview-hint">تصویر، ویدیو، صوت، PDF و فایل های متنی اینجا به شکل قابل ارائه نمایش داده می شوند.</div>
      </section>
    `;
  }

  const mime = preview.mimeType || preview.file.mimeType || '';
  let media = `<div class="empty-state">پیش نمایش واقعی بعد از ورود و اتصال API فعال می شود.</div>`;
  if (preview.demo && mime.startsWith('text/')) {
    media = `<div class="empty-state"><p>پیش نمایش متنی برای ${escapeHtml(preview.file.name)}</p></div>`;
  }
  if (!preview.demo && preview.url) {
    if (mime.startsWith('image/')) media = `<img src="${escapeHtml(preview.url)}" alt="preview" />`;
    else if (mime.startsWith('video/')) media = `<video src="${escapeHtml(preview.url)}" controls></video>`;
    else if (mime.startsWith('audio/')) media = `<div style="padding: 1rem;"><audio src="${escapeHtml(preview.url)}" controls style="width: 100%;"></audio></div>`;
    else media = `<iframe src="${escapeHtml(preview.url)}" title="preview"></iframe>`;
  }

  const fileId = preview.file._id || preview.file.id;
  const note = notes[fileId] || '';

  return `
    <section class="file-preview preview-panel">
      <div class="inline-actions" style="justify-content: space-between; align-items: center;">
        <h3 class="mt-0">${escapeHtml(preview.file.name)}</h3>
        <button class="btn-soft js-copy-preview-link" ${preview.url ? '' : 'disabled'}>کپی لینک پیش نمایش</button>
      </div>
      <div class="preview-media">${media}</div>
      <label class="form-row">
        <span>یادداشت فایل</span>
        <textarea class="textarea js-file-note" data-file-id="${escapeHtml(fileId)}" rows="4" placeholder="برای این فایل یک نکته یا وضعیت بنویسید...">${escapeHtml(note)}</textarea>
      </label>
    </section>
  `;
}

function renderFiles(state) {
  const filtered = state.visibleFiles();
  const totalBytes = filtered.reduce((sum, file) => sum + (file.size || 0), 0);
  const folderOptions = state.folderOptions();
  const selectedFolders = state.selectedFiles().filter((file) => file.type === 'folder').length;
  const favoriteVisible = filtered.filter((file) => state.favorites.includes(file._id || file.id)).length;
  const totalQueueProgress = state.queue.length ? Math.round(state.queue.reduce((sum, item) => sum + item.progress, 0) / state.queue.length) : 0;

  return `
    <div class="files-layout fade-in">
      <section class="panel" style="padding: 1.2rem;">
        <div class="content-grid">
          <div>
            <span class="eyebrow">File Operations Surface</span>
            <h2 class="mt-4">مدیریت فایل ها حالا واقعا شبیه یک بخش مرکزی محصول است.</h2>
            <p class="muted mt-3">جستجو، برچسب گذاری، جابجایی، اشتراک، یادداشت، علاقه مندی، صف آپلود و عملیات گروهی حالا داخل همین بخش جمع شده اند.</p>
          </div>
          <div class="insight-grid">
          <div class="surface-card"><p class="muted mt-0">فضای فعال</p><strong class="text-brand mt-2">${escapeHtml(state.activeWorkspaceName())}</strong></div>
            <div class="surface-card"><p class="muted mt-0">آیتم های علاقه مندی</p><strong class="text-brand mt-2">${escapeHtml(String(favoriteVisible))}</strong></div>
            <div class="surface-card"><p class="muted mt-0">پیشرفت صف</p><strong class="text-brand mt-2">${escapeHtml(`${totalQueueProgress}%`)}</strong></div>
          </div>
        </div>

        ${state.isDemo ? `<div class="notice is-warning mt-4">برای همگام سازی با حساب واقعی <a class="text-brand" href="${linkHref('/login/')}">وارد شوید</a> یا <a class="text-brand" href="${linkHref('/register/')}">ثبت نام کنید</a>. در همین حالت مهمان هم پوشه، آپلود، یادداشت، علاقه مندی و لینک نمایشی فعال هستند.</div>` : `<div class="notice is-success mt-4">این بخش اکنون با API داخلی همین پروژه کار می کند؛ ساخت پوشه، آپلود، تغییر نام، جابجایی، حذف، پیش نمایش و اشتراک همگی از همین سرور اجرا می شوند.</div>`}

        <div class="file-toolbar-grid mt-4">
          <label class="form-row">
            <span>فضای کاری</span>
            <select class="select js-workspace-select">
              ${(state.workspaces.length ? state.workspaces : [{ _id: GUEST_WORKSPACE_ID, name: 'فضای شخصی من' }])
                .map((workspace) => `<option value="${escapeHtml(workspace._id || workspace.id || GUEST_WORKSPACE_ID)}" ${String(workspace._id || workspace.id || GUEST_WORKSPACE_ID) === String(state.workspaceId || GUEST_WORKSPACE_ID) ? 'selected' : ''}>${escapeHtml(workspace.name)}</option>`)
                .join('')}
            </select>
          </label>
          <label class="form-row">
            <span>پوشه والد</span>
            <select class="select js-parent-filter">
              <option value="">همه فایل های ریشه</option>
              ${folderOptions.map((folder) => `<option value="${escapeHtml(folder._id || folder.id)}" ${String(state.parentFilter) === String(folder._id || folder.id) ? 'selected' : ''}>${escapeHtml(folder.name)}</option>`).join('')}
            </select>
          </label>
          <label class="form-row">
            <span>مرتب سازی</span>
            <select class="select js-sort-select">
              <option value="updated" ${state.sortBy === 'updated' ? 'selected' : ''}>جدیدترین</option>
              <option value="name" ${state.sortBy === 'name' ? 'selected' : ''}>نام</option>
              <option value="size" ${state.sortBy === 'size' ? 'selected' : ''}>حجم</option>
            </select>
          </label>
        </div>

        <div class="breadcrumbs mt-4">${state.breadcrumbs().map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>

        <div class="folder-tree-shell mt-4">
          <div class="inline-actions" style="justify-content: space-between; align-items: center;">
            <h3 class="mt-0">درخت پوشه ها</h3>
            <div class="inline-actions">
              <button class="btn-soft js-go-root">ریشه</button>
              <button class="btn-soft js-select-all">انتخاب همه</button>
            </div>
          </div>
          <div class="stack mt-4">
            ${state.folderTree().length ? renderFolderTree(state.folderTree(), state.parentFilter, state.collapsedFolders) : '<div class="surface-card">هنوز پوشه ای برای این workspace دیده نشده است.</div>'}
          </div>
        </div>

        <div class="file-panels mt-4">
          <div class="file-manager-panel">
            <div class="content-grid">
              <div>
                <p class="muted mt-0">جستجو و کنترل</p>
                <p class="mt-2"><strong>${filtered.length} آیتم در نمای فعلی</strong></p>
              </div>
              <div class="card-actions" style="justify-content: end;">
                <button class="btn-ghost js-create-folder">ساخت پوشه</button>
                <button class="btn-secondary js-open-upload">آپلود پیشرفته</button>
              </div>
            </div>
            <div class="two-col mt-4">
              <input class="field js-search-input" placeholder="نام فایل، نوع یا کلیدواژه را جستجو کنید..." value="${escapeHtml(state.query)}" />
              <select class="select js-secondary-filter">
                <option value="all" ${state.activeFilter === 'all' ? 'selected' : ''}>همه</option>
                <option value="favorites" ${state.activeFilter === 'favorites' ? 'selected' : ''}>فقط علاقه مندی ها</option>
                <option value="folder" ${state.activeFilter === 'folder' ? 'selected' : ''}>پوشه ها</option>
                <option value="image" ${state.activeFilter === 'image' ? 'selected' : ''}>تصاویر</option>
                <option value="video" ${state.activeFilter === 'video' ? 'selected' : ''}>ویدیوها</option>
                <option value="doc" ${state.activeFilter === 'doc' ? 'selected' : ''}>اسناد</option>
              </select>
            </div>
            <div class="filter-row mt-4">
              <button class="filter-chip ${state.activeFilter === 'all' ? 'is-active' : ''}" data-filter="all">همه</button>
              <button class="filter-chip ${state.activeFilter === 'favorites' ? 'is-active' : ''}" data-filter="favorites">علاقه مندی</button>
              <button class="filter-chip ${state.activeFilter === 'folder' ? 'is-active' : ''}" data-filter="folder">پوشه ها</button>
              <button class="filter-chip ${state.activeFilter === 'image' ? 'is-active' : ''}" data-filter="image">تصاویر</button>
              <button class="filter-chip ${state.activeFilter === 'video' ? 'is-active' : ''}" data-filter="video">ویدیوها</button>
              <button class="filter-chip ${state.activeFilter === 'doc' ? 'is-active' : ''}" data-filter="doc">اسناد</button>
            </div>
            ${state.recentSearches.length ? `<div class="filter-row mt-4">${state.recentSearches.slice(0, 5).map((item) => `<button class="btn-soft js-recent-search" data-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div>` : ''}
            ${state.selectedIds.length ? `<div class="notice is-success mt-4">${state.selectedIds.length} آیتم انتخاب شده است.${selectedFolders ? ` ${selectedFolders} مورد از آن ها پوشه است.` : ''} <button class="btn-soft js-clear-selection">پاک کردن انتخاب</button></div>` : ''}
          </div>

          <div class="dropzone ${state.dragActive ? 'is-dragover' : ''} js-dropzone">
            <p class="text-brand mt-0">ناحیه دریافت فایل</p>
            <h3 class="mt-2">فایل ها را اینجا رها کنید</h3>
            <p class="muted mt-3">صف آپلود، پیشرفت زنده، سرعت تقریبی و ثبت در workspace فعال.</p>
            <div class="two-col mt-4">
              <div class="surface-card">تا 20 فایل همزمان</div>
              <div class="surface-card">آمار صف و زمان باقی مانده</div>
            </div>
            <button class="btn-primary mt-4 js-open-upload">انتخاب فایل از سیستم</button>
          </div>
        </div>

        <div class="bulk-action-bar mt-4 ${state.selectedIds.length ? 'is-visible' : ''}">
          <strong>${escapeHtml(String(state.selectedIds.length))} انتخاب</strong>
          <button class="btn-soft js-share-selected" ${state.selectedFiles().length ? '' : 'disabled'}>اشتراک</button>
          <button class="btn-soft js-preview-selected" ${state.selectedFiles().length ? '' : 'disabled'}>پیش نمایش</button>
          <button class="btn-soft js-move-selected" ${state.selectedFiles().length ? '' : 'disabled'}>جابجایی</button>
          <button class="btn-soft js-favorite-selected" ${state.selectedFiles().length ? '' : 'disabled'}>علاقه مندی</button>
          <button class="btn-soft js-delete-selected" ${state.selectedFiles().length ? '' : 'disabled'}>حذف</button>
        </div>

        <div class="file-list-layout mt-4">
          <div class="file-manager-panel">
            <div class="inline-actions" style="justify-content: space-between; align-items: center;">
              <div>
                <h3 class="mt-0">فهرست فایل ها</h3>
                <p class="muted mt-1">حجم نمای فعلی: ${formatBytes(totalBytes)}</p>
              </div>
              <span class="status-pill ${state.loading ? '' : 'is-success'}">${state.loading ? 'در حال بارگذاری' : 'آماده'}</span>
            </div>
            <div class="file-list mt-4 js-file-list">
              <div class="selection-marquee js-selection-marquee hidden"></div>
              ${state.loading
                ? '<div class="loading-skeleton"></div>'
                : filtered.length
                  ? filtered
                      .map((file) => {
                        const fileId = file._id || file.id;
                        const selected = state.selectedIds.includes(fileId);
                        const favorite = state.favorites.includes(fileId);
                        const note = state.notes[fileId];
                        return `
                          <article class="file-row ${selected ? 'is-selected' : ''}" data-file-id="${escapeHtml(fileId)}">
                            <div class="file-main">
                              <button class="icon-btn js-toggle-file" data-file-id="${escapeHtml(fileId)}">${selected ? '✓' : ''}</button>
                              <span class="file-icon">${escapeHtml(iconFor(file))}</span>
                              <div class="file-copy">
                                <div class="inline-actions" style="justify-content: space-between; align-items: center; gap: 0.5rem;">
                                  <h4>${escapeHtml(file.name)}</h4>
                                  ${favorite ? '<span class="favorite-pill">★</span>' : ''}
                                </div>
                                <p class="file-meta">${escapeHtml(friendlyType(file))} • ${escapeHtml(formatBytes(file.size))} • ${escapeHtml(file.updatedAtLabel || 'به روز شده')}</p>
                                ${note ? `<p class="muted mt-1">یادداشت: ${escapeHtml(note)}</p>` : ''}
                              </div>
                            </div>
                            <div class="file-actions">
                              <button class="btn-soft js-toggle-favorite" data-file-id="${escapeHtml(fileId)}">${favorite ? 'لغو ★' : '★'}</button>
                              <button class="btn-soft js-preview-file" data-file-id="${escapeHtml(fileId)}">پیش نمایش</button>
                              <button class="btn-soft js-share-file" data-file-id="${escapeHtml(fileId)}">اشتراک</button>
                              <button class="btn-soft js-menu-file" data-file-id="${escapeHtml(fileId)}">بیشتر</button>
                            </div>
                          </article>
                        `;
                      })
                      .join('')
                  : '<div class="empty-state"><p>هیچ فایلی با این فیلتر پیدا نشد.</p></div>'}
            </div>
            ${state.nextCursor ? '<button class="btn-ghost mt-4 js-load-more">نمایش موارد بیشتر</button>' : ''}
          </div>

          <div class="file-manager-side">
            <section class="file-manager-sidebar-card">
              <h3 class="mt-0">داشبورد سریع فایل ها</h3>
              <div class="three-col mt-4 compact-grid">
                <div class="surface-card"><p class="muted mt-0">کل آیتم ها</p><strong>${escapeHtml(String(state.files.length))}</strong></div>
                <div class="surface-card"><p class="muted mt-0">علاقه مندی</p><strong>${escapeHtml(String(state.favorites.length))}</strong></div>
                <div class="surface-card"><p class="muted mt-0">جستجوهای اخیر</p><strong>${escapeHtml(String(state.recentSearches.length))}</strong></div>
              </div>
            </section>
            <section class="file-manager-sidebar-card">
              <h3 class="mt-0">صف آپلود</h3>
              <div class="stack mt-4">${state.queue.length ? state.queue.map(renderQueueItem).join('') : '<div class="surface-card">هنوز آپلودی در صف وجود ندارد.</div>'}</div>
              ${state.queue.some((item) => item.status === 'خطا') ? '<button class="btn-soft mt-4 js-retry-failed">تلاش دوباره برای خطاها</button>' : ''}
            </section>
            ${renderPreview(state.preview, state.notes)}
          </div>
        </div>
      </section>

      <aside class="file-manager-side">
        <section class="selection-panel">
          <h3 class="mt-0">پنل انتخاب های فعلی</h3>
          <div class="surface-card mt-4 selection-list">${state.selectedFiles().length ? state.selectedFiles().map((file) => `<p class="mt-0">• ${escapeHtml(file.name)}</p>`).join('') : 'هنوز فایلی انتخاب نشده است.'}</div>
          <div class="stack mt-4">
            <button class="btn-primary js-share-selected" ${state.selectedFiles().length ? '' : 'disabled'}>اشتراک فایل انتخاب شده</button>
            <button class="btn-ghost js-preview-selected" ${state.selectedFiles().length ? '' : 'disabled'}>پیش نمایش فایل انتخاب شده</button>
          </div>
        </section>
        <section class="file-manager-sidebar-card">
          <h3 class="mt-0">میانبرهای بخش فایل</h3>
          <ul class="activity-points mt-4">
            <li>• کلید <span class="kbd">/</span> برای فوکوس جستجو</li>
            <li>• کلید <span class="kbd">N</span> برای ساخت پوشه</li>
            <li>• کلید <span class="kbd">U</span> برای آپلود</li>
            <li>• کلید <span class="kbd">Delete</span> برای حذف انتخاب ها</li>
            <li>• عملیات گروهی برای اشتراک، حذف و جابجایی</li>
          </ul>
        </section>
        <section class="file-manager-sidebar-card">
          <h3 class="mt-0">مسیرهای بعدی</h3>
          <div class="stack mt-4">
            <a href="${linkHref('/workspaces/')}" class="surface-card">ورود به مدیریت Workspace ها</a>
            <a href="${linkHref('/team/')}" class="surface-card">مرور اعضای تیم</a>
            <a href="${linkHref('/settings/')}" class="surface-card">باز کردن تنظیمات</a>
          </div>
        </section>
      </aside>
    </div>
  `;
}

export function mountFileManager(root) {
  const state = {
    workspaceId: null,
    workspaces: [],
    files: getDemoFiles(),
    folderRegistry: getDemoFiles().filter((item) => item.type === 'folder'),
    query: '',
    activeFilter: 'all',
    sortBy: 'updated',
    parentFilter: '',
    queue: [],
    preview: null,
    loading: true,
    nextCursor: null,
    selectedIds: [],
    dragActive: false,
    isDemo: !getAccessToken(),
    favorites: getFavorites(),
    notes: getNotes(),
    recentSearches: getRecentSearches(),
    pendingUploadWorkspaceId: null,
    pendingUploadNote: '',
    collapsedFolders: getCollapsedFolders(),
    lastSelectedId: null,
    dragSelection: null,
    visibleFiles() {
      const normalizedQuery = this.query.toLowerCase();
      let source = this.files.filter((file) => {
        const haystack = [file.name, file.mimeType, friendlyType(file), this.notes[file._id || file.id] || ''].join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      if (this.parentFilter) source = source.filter((file) => String(file.parent || '') === String(this.parentFilter));
      else if (!normalizedQuery && !this.showAllMode) source = source.filter((file) => !file.parent);
      if (this.activeFilter === 'favorites') source = source.filter((file) => this.favorites.includes(file._id || file.id));
      if (this.activeFilter === 'folder') source = source.filter((file) => file.type === 'folder');
      if (this.activeFilter === 'image') source = source.filter((file) => (file.mimeType || '').startsWith('image/'));
      if (this.activeFilter === 'video') source = source.filter((file) => (file.mimeType || '').startsWith('video/'));
      if (this.activeFilter === 'doc') source = source.filter((file) => /pdf|text|document|word/.test(file.mimeType || ''));

      return [...source].sort((left, right) => {
        if (this.sortBy === 'name') return left.name.localeCompare(right.name, 'fa');
        if (this.sortBy === 'size') return (right.size || 0) - (left.size || 0);
        return String(right.updatedAt || right.updatedAtLabel || '').localeCompare(String(left.updatedAt || left.updatedAtLabel || ''));
      });
    },
    selectedFiles() {
      return this.files.filter((file) => this.selectedIds.includes(file._id || file.id));
    },
    folderOptions() {
      const map = new Map();
      [...this.folderRegistry, ...this.files.filter((file) => file.type === 'folder')].forEach((folder) => {
        map.set(String(folder._id || folder.id), folder);
      });
      return [...map.values()];
    },
    folderTree() {
      const folders = this.folderOptions().map((folder) => ({ ...folder, children: [] }));
      const map = new Map(folders.map((folder) => [String(folder._id || folder.id), folder]));
      const roots = [];
      folders.forEach((folder) => {
        const parentId = folder.parent ? String(folder.parent) : '';
        if (parentId && map.has(parentId)) map.get(parentId).children.push(folder);
        else roots.push(folder);
      });
      return roots;
    },
    activeWorkspaceName() {
      const workspace = this.workspaces.find((item) => String(item._id || item.id) === String(this.workspaceId));
      return workspace?.name || (this.isDemo ? 'فضای شخصی من' : 'Workspace');
    },
    breadcrumbs() {
      const items = [this.activeWorkspaceName()];
      const parent = this.folderOptions().find((item) => String(item._id || item.id) === String(this.parentFilter));
      if (parent) items.push(parent.name);
      if (this.activeFilter === 'favorites') items.push('علاقه مندی ها');
      return items;
    },
  };

  const fileInput = createElement('<input type="file" multiple class="hidden" />');
  root.appendChild(fileInput);

  function syncDemoFiles() {
    if (state.isDemo) {
      state.folderRegistry = state.files.filter((item) => item.type === 'folder');
      saveDemoFiles(state.files);
    }
  }

  function syncCollapsedFolders() {
    saveCollapsedFolders(state.collapsedFolders);
  }

  function persistWorkspaceChoice() {
    if (state.workspaceId) localStorage.setItem(LAST_WORKSPACE_KEY, String(state.workspaceId));
  }

  function findFile(fileId) {
    return state.files.find((file) => (file._id || file.id) === fileId);
  }

  function visibleFileIds() {
    return state.visibleFiles().map((file) => String(file._id || file.id));
  }

  async function ensureWorkspace() {
    if (state.workspaceId || state.isDemo) return state.workspaceId;
    const workspaces = await apiFetch('/api/workspaces');
    state.workspaces = workspaces.items || [];
    const remembered = localStorage.getItem(LAST_WORKSPACE_KEY);
    state.workspaceId = remembered || workspaces.items?.[0]?._id || workspaces.items?.[0]?.id || null;
    persistWorkspaceChoice();
    return state.workspaceId;
  }

  async function loadWorkspaces() {
    if (state.isDemo) {
      state.workspaces = [{ _id: GUEST_WORKSPACE_ID, name: 'فضای شخصی من' }];
      state.workspaceId = GUEST_WORKSPACE_ID;
      return;
    }
    const payload = await apiFetch('/api/workspaces');
    state.workspaces = payload.items || [];
    const remembered = localStorage.getItem(LAST_WORKSPACE_KEY);
    state.workspaceId = remembered || payload.items?.[0]?._id || payload.items?.[0]?.id || null;
    persistWorkspaceChoice();
  }

  async function loadFiles({ cursor = null, append = false } = {}) {
    if (state.isDemo) {
      try {
        state.loading = true;
        render();
        const params = new URLSearchParams();
        if (state.parentFilter) params.set('parent', state.parentFilter);
        const payload = await guestFetch(`/vanilla-api/files${params.toString() ? `?${params.toString()}` : ''}`);
        const items = payload.items || [];
        state.files = state.query.trim()
          ? items.filter((file) => [file.name, file.mimeType, state.notes[file._id || file.id] || ''].join(' ').toLowerCase().includes(state.query.trim().toLowerCase()))
          : items;
        state.folderRegistry = [
          ...new Map(
            [...state.folderRegistry, ...items.filter((item) => item.type === 'folder')]
              .map((item) => [String(item._id || item.id), item]),
          ).values(),
        ];
        state.nextCursor = null;
      } catch (error) {
        toast(error.message, 'danger');
      } finally {
        state.loading = false;
        render();
      }
      return;
    }

    try {
      state.loading = true;
      render();
      const workspaceId = await ensureWorkspace();
      if (!workspaceId) {
        state.loading = false;
        toast('Workspace فعالی برای این حساب پیدا نشد.', 'danger');
        render();
        return;
      }
      const params = new URLSearchParams({ workspaceId, limit: '30' });
      if (state.query.trim()) params.set('q', state.query.trim());
      else params.set('parent', state.parentFilter || '');
      if (cursor) params.set('cursor', cursor);
      const payload = await apiFetch(`/api/files?${params.toString()}`);
      state.files = append ? [...state.files, ...payload.items] : payload.items;
      state.folderRegistry = [
        ...new Map(
          [...state.folderRegistry, ...payload.items.filter((item) => item.type === 'folder')]
            .map((item) => [String(item._id || item.id), item]),
        ).values(),
      ];
      state.nextCursor = payload.nextCursor;
    } catch (error) {
      state.files = getDemoFiles();
      state.isDemo = true;
      state.workspaces = [{ _id: GUEST_WORKSPACE_ID, name: 'فضای شخصی من' }];
      state.workspaceId = GUEST_WORKSPACE_ID;
      toast(error.message, 'danger');
    } finally {
      state.loading = false;
      render();
    }
  }

  const debouncedLoad = debounce(() => loadFiles(), 280);

  function updateRecentSearches(query) {
    if (!query.trim()) return;
    state.recentSearches = [query.trim(), ...state.recentSearches.filter((item) => item !== query.trim())].slice(0, 6);
    saveRecentSearches(state.recentSearches);
  }

  function render() {
    root.innerHTML = renderFiles(state);
    root.appendChild(fileInput);
    bind();
  }

  async function createFolder() {
    const name = window.prompt('نام پوشه جدید چیست؟');
    if (!name) return;

    if (state.isDemo) {
      try {
        await guestFetch('/vanilla-api/files/folders', {
          method: 'POST',
          body: JSON.stringify({ name, parent: state.parentFilter || null }),
        });
        toast('پوشه جدید ساخته شد.');
        await loadFiles();
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }

    try {
      await apiFetch('/api/files/folders', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: state.workspaceId, parent: state.parentFilter || null, name }),
      });
      toast('پوشه جدید ساخته شد.');
      loadFiles();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  function openUploadModal() {
    const overlay = modalFrame('');
    const card = uploadModal(state.workspaces, state.workspaceId);
    overlay.appendChild(card);
    closeOnOverlay(overlay, () => overlay.remove());
    card.querySelector('.js-close-modal').addEventListener('click', () => overlay.remove());
    card.querySelector('.js-open-picker').addEventListener('click', () => {
      state.pendingUploadWorkspaceId = card.querySelector('.js-upload-workspace')?.value || state.workspaceId;
      state.pendingUploadNote = card.querySelector('.js-upload-note')?.value || '';
      overlay.remove();
      fileInput.click();
    });
    document.body.appendChild(overlay);
  }

  function openShareModal(share) {
    const overlay = modalFrame('');
    const card = shareModal(share);
    overlay.appendChild(card);
    closeOnOverlay(overlay, () => overlay.remove());
    card.querySelector('.js-close-modal').addEventListener('click', () => overlay.remove());
    card.querySelector('.js-copy-share').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(share.url);
        toast('لینک اشتراک کپی شد.');
      } catch {
        toast('کپی خودکار انجام نشد. لینک را دستی بردارید.', 'warning');
      }
    });
    document.body.appendChild(overlay);
  }

  function promptMove(file) {
    const overlay = modalFrame('');
    const card = moveModal(file, state.folderOptions());
    overlay.appendChild(card);
    closeOnOverlay(overlay, () => overlay.remove());
    card.querySelector('.js-close-modal').addEventListener('click', () => overlay.remove());
    card.querySelector('.js-confirm-move').addEventListener('click', async () => {
      const parent = card.querySelector('.js-move-folder')?.value || null;
      overlay.remove();
      await moveFile(file, parent);
    });
    document.body.appendChild(overlay);
  }

  function promptShareOptions(file) {
    const overlay = modalFrame('');
    const card = shareOptionsModal(file);
    overlay.appendChild(card);
    closeOnOverlay(overlay, () => overlay.remove());
    card.querySelector('.js-close-modal').addEventListener('click', () => overlay.remove());
    card.querySelector('.js-share-options-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const password = String(formData.get('password') || '').trim();
      const downloadLimit = Number(formData.get('downloadLimit') || 25);
      const expiresAtValue = String(formData.get('expiresAt') || '').trim();
      overlay.remove();
      await createShare(file, {
        password: password || undefined,
        downloadLimit,
        expiresAt: expiresAtValue ? new Date(expiresAtValue).toISOString() : undefined,
      });
    });
    document.body.appendChild(overlay);
  }

  function showContextMenu(file, anchor) {
    document.querySelector('.context-menu')?.remove();
    const rect = anchor.getBoundingClientRect();
    const menu = createElement(`
      <div class="context-menu" style="top: ${rect.bottom + 8}px; left: ${Math.max(16, rect.left - 120)}px;">
        <button data-action="preview">پیش نمایش</button>
        <button data-action="favorite">${state.favorites.includes(file._id || file.id) ? 'حذف از علاقه مندی' : 'افزودن به علاقه مندی'}</button>
        <button data-action="rename">تغییر نام</button>
        <button data-action="move">جابجایی</button>
        <button data-action="share">اشتراک پیشرفته</button>
        <button data-action="delete">حذف</button>
      </div>
    `);
    menu.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      menu.remove();
      if (action === 'preview') openPreview(file);
      if (action === 'favorite') toggleFavorite(file._id || file.id);
      if (action === 'rename') renameFile(file);
      if (action === 'move') promptMove(file);
      if (action === 'share') promptShareOptions(file);
      if (action === 'delete') deleteFile(file);
    });
    document.body.appendChild(menu);
    const close = (event) => {
      if (!menu.contains(event.target)) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  async function beginUpload(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const targetWorkspaceId = state.pendingUploadWorkspaceId || state.workspaceId;
    const uploadNote = state.pendingUploadNote || '';

    if (state.isDemo) {
      const pending = files.map((file) => {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const item = { id, name: file.name, progress: 0, status: 'در حال آماده سازی', note: uploadNote };
        state.queue.unshift(item);
        return { file, item };
      });
      render();
      for (const { file, item } of pending) {
        try {
          const base64 = await fileToBase64(file);
          item.status = 'در حال آپلود';
          item.progress = 35;
          render();
          await guestFetch('/vanilla-api/upload', {
            method: 'POST',
            body: JSON.stringify({
              name: file.name,
              mimeType: file.type || 'application/octet-stream',
              base64,
              parent: state.parentFilter || null,
              note: uploadNote,
            }),
          });
          item.progress = 100;
          item.status = 'تکمیل شد';
          render();
        } catch (error) {
          item.status = 'خطا';
          item.note = error.message;
          toast(error.message, 'danger');
          render();
        }
      }
      await loadFiles();
      toast('فایل ها روی فضای ذخیره سازی محلی سرور ذخیره شدند.');
      state.pendingUploadWorkspaceId = null;
      state.pendingUploadNote = '';
      return;
    }

    await ensureWorkspace();
    files.forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const queueItem = { id, name: file.name, progress: 8, status: 'در حال آماده سازی', note: uploadNote, startedAt: Date.now(), speed: '' };
      state.queue.unshift(queueItem);
      render();
      fileToBase64(file)
        .then((base64) => {
          const item = state.queue.find((entry) => entry.id === id);
          if (item) {
            item.status = 'در حال آپلود';
            item.progress = 18;
            render();
          }
          return base64;
        })
        .then((base64) => apiJsonUpload('/api/files/upload', {
          workspaceId: targetWorkspaceId || state.workspaceId,
          parent: state.parentFilter || null,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          note: uploadNote,
          base64,
        }, (progress) => {
          const item = state.queue.find((entry) => entry.id === id);
          if (item) {
            item.progress = progress;
            const elapsedMs = Math.max(Date.now() - item.startedAt, 1);
            const bytesPerSecond = Math.round((file.size || 0) * (progress / 100) / (elapsedMs / 1000));
            item.speed = bytesPerSecond ? `${formatBytes(bytesPerSecond)}/s` : '';
            render();
          }
        }))
        .then(() => {
          const item = state.queue.find((entry) => entry.id === id);
          if (item) {
            item.progress = 100;
            item.status = 'تکمیل شد';
            render();
          }
          loadFiles();
        })
        .catch((error) => {
          const item = state.queue.find((entry) => entry.id === id);
          if (item) {
            item.status = 'خطا';
            item.note = error.message;
            render();
          }
          toast(error.message, 'danger');
        });
    });
    state.pendingUploadWorkspaceId = null;
    state.pendingUploadNote = '';
  }

  async function renameFile(file) {
    const name = window.prompt('نام جدید فایل چیست؟', file.name);
    if (!name) return;

    if (state.isDemo) {
      try {
        await guestFetch(`/vanilla-api/files/${file._id || file.id}/rename`, {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        });
        toast('نام فایل به روز شد.');
        await loadFiles();
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }

    try {
      await apiFetch(`/api/files/${file._id}/rename`, { method: 'PATCH', body: JSON.stringify({ name }) });
      toast('نام فایل به روز شد.');
      loadFiles();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  async function moveFile(file, parent) {
    if (state.isDemo) {
      try {
        await guestFetch(`/vanilla-api/files/${file._id || file.id}/move`, {
          method: 'PATCH',
          body: JSON.stringify({ parent: parent || null }),
        });
        toast('فایل جابجا شد.');
        await loadFiles();
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }

    try {
      await apiFetch(`/api/files/${file._id}/move`, { method: 'PATCH', body: JSON.stringify({ parent: parent || null }) });
      toast('فایل جابجا شد.');
      loadFiles();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  async function deleteFile(file) {
    if (!window.confirm(`حذف ${file.name} انجام شود؟`)) return;

    if (state.isDemo) {
      try {
        await guestFetch(`/vanilla-api/files/${file._id || file.id}`, { method: 'DELETE' });
        state.selectedIds = state.selectedIds.filter((item) => item !== (file._id || file.id));
        if (state.preview?.file && (state.preview.file._id || state.preview.file.id) === (file._id || file.id)) state.preview = null;
        toast('فایل حذف شد.');
        await loadFiles();
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }

    try {
      await apiFetch(`/api/files/${file._id}`, { method: 'DELETE' });
      toast('فایل حذف شد.');
      loadFiles();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  async function deleteSelected() {
    const files = state.selectedFiles();
    if (!files.length) return;
    for (const file of files) {
      // Keep sequential deletion predictable for API and demo state updates.
      // eslint-disable-next-line no-await-in-loop
      await deleteFile(file);
    }
    state.selectedIds = [];
    render();
  }

  async function openPreview(file) {
    if (file.type === 'folder') {
      toast('برای پوشه پیش نمایش مستقیمی وجود ندارد.', 'warning');
      return;
    }
    if (state.isDemo) {
      state.preview = { file, url: file.previewUrl || `/vanilla-api/files/${file._id || file.id}/content`, demo: false, mimeType: file.mimeType };
      render();
      return;
    }
    try {
      const payload = await apiFetch(`/api/files/${file._id}/preview`);
      const url = payload.url?.startsWith('/api/') ? `${getApiBaseUrl()}${payload.url}` : payload.url;
      state.preview = { file, url, mimeType: payload.mimeType };
      render();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  async function createShare(file, options = { downloadLimit: 25 }) {
    if (state.isDemo) {
      try {
        const payload = await guestFetch(`/vanilla-api/files/${file._id || file.id}/share`, {
          method: 'POST',
          body: JSON.stringify(options),
        });
        payload.url = payload.url?.startsWith('/')
          ? `${getAppBaseUrl().replace(/\/$/, '')}${payload.url}`
          : payload.url;
        openShareModal(payload);
      } catch (error) {
        toast(error.message, 'danger');
      }
      return;
    }
    try {
      const payload = await apiFetch(`/api/files/${file._id}/share`, { method: 'POST', body: JSON.stringify(options) });
      payload.url = payload.url?.startsWith('/')
        ? `${getAppBaseUrl().replace(/\/$/, '')}${payload.url}`
        : payload.url;
      openShareModal(payload);
    } catch (error) {
      toast(error.message, 'danger');
    }
  }

  function toggleSelected(fileId) {
    state.selectedIds = state.selectedIds.includes(fileId)
      ? state.selectedIds.filter((id) => id !== fileId)
      : [...state.selectedIds, fileId];
    state.lastSelectedId = fileId;
    render();
  }

  function toggleFolderCollapse(folderId) {
    state.collapsedFolders = state.collapsedFolders.includes(folderId)
      ? state.collapsedFolders.filter((item) => item !== folderId)
      : [...state.collapsedFolders, folderId];
    syncCollapsedFolders();
    render();
  }

  function selectRangeTo(fileId) {
    if (!state.lastSelectedId) {
      toggleSelected(fileId);
      return;
    }
    const ids = visibleFileIds();
    const start = ids.indexOf(String(state.lastSelectedId));
    const end = ids.indexOf(String(fileId));
    if (start === -1 || end === -1) {
      toggleSelected(fileId);
      return;
    }
    const [from, to] = start < end ? [start, end] : [end, start];
    const range = ids.slice(from, to + 1);
    state.selectedIds = [...new Set([...state.selectedIds, ...range])];
    render();
  }

  function toggleFavorite(fileId) {
    state.favorites = state.favorites.includes(fileId)
      ? state.favorites.filter((id) => id !== fileId)
      : [fileId, ...state.favorites];
    saveFavorites(state.favorites);
    render();
  }

  function selectAllVisible() {
    state.selectedIds = state.visibleFiles().map((file) => file._id || file.id);
    render();
  }

  function toggleFavoritesForSelection() {
    const ids = state.selectedFiles().map((file) => file._id || file.id);
    if (!ids.length) return;
    const next = new Set(state.favorites);
    ids.forEach((id) => {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    });
    state.favorites = [...next];
    saveFavorites(state.favorites);
    render();
  }

  function saveNote(fileId, value) {
    state.notes = { ...state.notes, [fileId]: value };
    saveNotes(state.notes);
  }

  async function moveSelected() {
    const file = state.selectedFiles()[0];
    if (!file) return;
    promptMove(file);
  }

  function handleShortcuts(event) {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === '/') {
      event.preventDefault();
      root.querySelector('.js-search-input')?.focus();
    }
    if (event.key.toLowerCase() === 'n') createFolder();
    if (event.key.toLowerCase() === 'u') openUploadModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      selectAllVisible();
    }
    if (event.key === 'Delete' && state.selectedIds.length) deleteSelected();
  }

  function retryFailedUploads() {
    const failed = state.queue.filter((item) => item.status === 'خطا');
    if (!failed.length) return;
    failed.forEach((item) => {
      item.status = 'نیاز به انتخاب مجدد فایل';
      item.progress = 0;
    });
    toast('برای تلاش دوباره، فایل های خطادار را دوباره انتخاب کنید.', 'warning');
    render();
    fileInput.click();
  }

  function startDragSelection(event) {
    const list = root.querySelector('.js-file-list');
    const marquee = root.querySelector('.js-selection-marquee');
    if (!list || !marquee) return;
    if (event.target.closest('button, a, input, textarea, select, iframe, video, audio')) return;
    const listRect = list.getBoundingClientRect();
    state.dragSelection = {
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      additive: event.ctrlKey || event.metaKey,
      seedSelection: event.ctrlKey || event.metaKey ? [...state.selectedIds] : [],
      listRect,
    };

    const onMove = (moveEvent) => {
      if (!state.dragSelection) return;
      const deltaX = Math.abs(moveEvent.clientX - state.dragSelection.startX);
      const deltaY = Math.abs(moveEvent.clientY - state.dragSelection.startY);
      if (!state.dragSelection.active && (deltaX > 6 || deltaY > 6)) {
        state.dragSelection.active = true;
        marquee.classList.remove('hidden');
      }
      if (!state.dragSelection.active) return;

      const left = Math.max(Math.min(state.dragSelection.startX, moveEvent.clientX), listRect.left);
      const right = Math.min(Math.max(state.dragSelection.startX, moveEvent.clientX), listRect.right);
      const top = Math.max(Math.min(state.dragSelection.startY, moveEvent.clientY), listRect.top);
      const bottom = Math.min(Math.max(state.dragSelection.startY, moveEvent.clientY), listRect.bottom);

      marquee.style.left = `${left - listRect.left + list.scrollLeft}px`;
      marquee.style.top = `${top - listRect.top + list.scrollTop}px`;
      marquee.style.width = `${Math.max(0, right - left)}px`;
      marquee.style.height = `${Math.max(0, bottom - top)}px`;

      const selection = new Set(state.dragSelection.seedSelection);
      root.querySelectorAll('.file-row[data-file-id]').forEach((row) => {
        const rect = row.getBoundingClientRect();
        const intersects = !(rect.right < left || rect.left > right || rect.bottom < top || rect.top > bottom);
        if (intersects) selection.add(row.dataset.fileId);
      });
      state.selectedIds = [...selection];
      root.querySelectorAll('.file-row[data-file-id]').forEach((row) => {
        row.classList.toggle('is-selected', state.selectedIds.includes(row.dataset.fileId));
      });
      root.querySelectorAll('.js-toggle-file').forEach((button) => {
        button.textContent = state.selectedIds.includes(button.dataset.fileId) ? '✓' : '';
      });
    };

    const stop = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', stop);
      if (state.dragSelection?.active) render();
      marquee.classList.add('hidden');
      marquee.style.left = '0px';
      marquee.style.top = '0px';
      marquee.style.width = '0px';
      marquee.style.height = '0px';
      state.dragSelection = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', stop);
  }

  function bind() {
    root.querySelector('.js-create-folder')?.addEventListener('click', createFolder);
    root.querySelectorAll('.js-open-upload').forEach((button) => button.addEventListener('click', openUploadModal));
    root.querySelector('.js-search-input')?.addEventListener('input', (event) => {
      state.query = event.target.value;
      if (state.isDemo) render();
      else debouncedLoad();
    });
    root.querySelector('.js-search-input')?.addEventListener('change', (event) => updateRecentSearches(event.target.value));
    root.querySelectorAll('.js-recent-search').forEach((button) => button.addEventListener('click', () => {
      state.query = button.dataset.query || '';
      root.querySelector('.js-search-input').value = state.query;
      if (state.isDemo) render();
      else loadFiles();
    }));
    root.querySelector('.js-sort-select')?.addEventListener('change', (event) => {
      state.sortBy = event.target.value;
      render();
    });
    root.querySelector('.js-secondary-filter')?.addEventListener('change', (event) => {
      state.activeFilter = event.target.value;
      render();
    });
    root.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeFilter = button.dataset.filter;
        const select = root.querySelector('.js-secondary-filter');
        if (select) select.value = state.activeFilter;
        render();
      });
    });
    root.querySelector('.js-parent-filter')?.addEventListener('change', (event) => {
      state.parentFilter = event.target.value;
      if (state.isDemo) render();
      else loadFiles();
    });
    root.querySelector('.js-workspace-select')?.addEventListener('change', (event) => {
      state.workspaceId = event.target.value;
      state.parentFilter = '';
      persistWorkspaceChoice();
      if (state.isDemo) render();
      else loadFiles();
    });
    root.querySelector('.js-clear-selection')?.addEventListener('click', () => {
      state.selectedIds = [];
      render();
    });
    root.querySelector('.js-go-root')?.addEventListener('click', () => {
      state.parentFilter = '';
      if (root.querySelector('.js-parent-filter')) root.querySelector('.js-parent-filter').value = '';
      if (state.isDemo) render();
      else loadFiles();
    });
    root.querySelector('.js-select-all')?.addEventListener('click', selectAllVisible);
    root.querySelector('.js-dropzone')?.addEventListener('dragover', (event) => {
      event.preventDefault();
      state.dragActive = true;
      render();
    });
    root.querySelector('.js-dropzone')?.addEventListener('dragleave', () => {
      state.dragActive = false;
      render();
    });
    root.querySelector('.js-dropzone')?.addEventListener('drop', (event) => {
      event.preventDefault();
      state.dragActive = false;
      beginUpload(event.dataTransfer.files);
    });
    fileInput.onchange = (event) => {
      beginUpload(event.target.files);
      event.target.value = '';
    };

    root.querySelectorAll('.js-toggle-file').forEach((button) => button.addEventListener('click', (event) => {
      if (event.shiftKey) selectRangeTo(button.dataset.fileId);
      else toggleSelected(button.dataset.fileId);
    }));
    root.querySelectorAll('.js-toggle-favorite').forEach((button) => button.addEventListener('click', () => toggleFavorite(button.dataset.fileId)));
    root.querySelectorAll('.js-preview-file').forEach((button) => button.addEventListener('click', () => openPreview(findFile(button.dataset.fileId))));
    root.querySelectorAll('.js-share-file').forEach((button) => button.addEventListener('click', () => promptShareOptions(findFile(button.dataset.fileId))));
    root.querySelectorAll('.js-menu-file').forEach((button) => button.addEventListener('click', () => showContextMenu(findFile(button.dataset.fileId), button)));
    root.querySelectorAll('.folder-tree-toggle').forEach((button) => button.addEventListener('click', () => toggleFolderCollapse(button.dataset.folderToggle)));
    root.querySelectorAll('.folder-tree-link').forEach((button) => button.addEventListener('click', () => {
      state.parentFilter = button.dataset.folderNav;
      if (root.querySelector('.js-parent-filter')) root.querySelector('.js-parent-filter').value = state.parentFilter;
      if (state.isDemo) render();
      else loadFiles();
    }));
    root.querySelector('.js-load-more')?.addEventListener('click', () => loadFiles({ cursor: state.nextCursor, append: true }));
    root.querySelectorAll('.js-share-selected').forEach((button) => button.addEventListener('click', () => state.selectedFiles()[0] && promptShareOptions(state.selectedFiles()[0])));
    root.querySelectorAll('.js-preview-selected').forEach((button) => button.addEventListener('click', () => state.selectedFiles()[0] && openPreview(state.selectedFiles()[0])));
    root.querySelector('.js-move-selected')?.addEventListener('click', moveSelected);
    root.querySelector('.js-favorite-selected')?.addEventListener('click', toggleFavoritesForSelection);
    root.querySelector('.js-delete-selected')?.addEventListener('click', deleteSelected);
    root.querySelector('.js-retry-failed')?.addEventListener('click', retryFailedUploads);
    root.querySelector('.js-file-note')?.addEventListener('input', (event) => saveNote(event.target.dataset.fileId, event.target.value));
    root.querySelector('.js-file-list')?.addEventListener('mousedown', startDragSelection);
    root.querySelector('.js-copy-preview-link')?.addEventListener('click', async () => {
      if (!state.preview?.url) return;
      try {
        await navigator.clipboard.writeText(state.preview.url);
        toast('لینک پیش نمایش کپی شد.');
      } catch {
        toast('کپی لینک پیش نمایش انجام نشد.', 'warning');
      }
    });
  }

  document.addEventListener('keydown', handleShortcuts);

  async function init() {
    try {
      await loadWorkspaces();
    } catch (error) {
      state.isDemo = true;
      state.workspaces = [{ _id: GUEST_WORKSPACE_ID, name: 'فضای شخصی من' }];
      state.workspaceId = GUEST_WORKSPACE_ID;
      toast(error.message, 'warning');
    }
    render();
    loadFiles();
  }

  init();
}
