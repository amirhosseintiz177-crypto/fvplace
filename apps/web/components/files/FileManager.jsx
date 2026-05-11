'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch, apiUpload, API_BASE_URL } from '../../lib/api';
import { getAccessToken } from '../../lib/auth';

const demoFiles = [
  { _id: 'demo-1', name: 'Brand-System.pdf', type: 'file', mimeType: 'application/pdf', size: 2400000 },
  { _id: 'demo-2', name: 'Launch-Trailer.mp4', type: 'file', mimeType: 'video/mp4', size: 84000000 },
  { _id: 'demo-3', name: 'Synthwave-Cover.png', type: 'file', mimeType: 'image/png', size: 6700000 },
  { _id: 'demo-4', name: 'api-client.ts', type: 'file', mimeType: 'text/typescript', size: 18000 },
  { _id: 'demo-5', name: 'Product Assets', type: 'folder', mimeType: 'folder', size: 0 },
  { _id: 'demo-6', name: 'Weekly-Podcast.mp3', type: 'file', mimeType: 'audio/mpeg', size: 15200000 },
];

const insights = [
  { label: 'سقف هر فایل', value: '1024MB' },
  { label: 'آپلود همزمان', value: '20 فایل' },
  { label: 'لینک اشتراک', value: 'QR + محدودیت' },
];

const smartCollections = [
  { label: 'طراحی', count: 38 },
  { label: 'ویدیو', count: 12 },
  { label: 'اسناد', count: 146 },
  { label: 'کد و فنی', count: 24 },
];

export function FileManager() {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [files, setFiles] = useState(demoFiles);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [queue, setQueue] = useState([]);
  const [menu, setMenu] = useState(null);
  const [preview, setPreview] = useState(null);
  const [share, setShare] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const isDemo = !getAccessToken();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 280);
    return () => clearTimeout(timer);
  }, [query]);

  const loadFiles = useCallback(async ({ cursor = null, append = false } = {}) => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let activeWorkspaceId = workspaceId;
      if (!activeWorkspaceId) {
        const workspaces = await apiFetch('/api/workspaces');
        activeWorkspaceId = workspaces.items?.[0]?._id || workspaces.items?.[0]?.id;
        setWorkspaceId(activeWorkspaceId);
      }
      if (!activeWorkspaceId) return;

      const params = new URLSearchParams({ workspaceId: activeWorkspaceId, limit: '30' });
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (cursor) params.set('cursor', cursor);
      const payload = await apiFetch(`/api/files?${params.toString()}`);
      setFiles((current) => (append ? [...current, ...payload.items] : payload.items));
      setNextCursor(payload.nextCursor);
    } catch (error) {
      setToast(error.message);
      setFiles(demoFiles);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, debouncedQuery]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function createFolder() {
    if (!workspaceId) return setToast('برای ساخت پوشه واقعی ابتدا وارد حساب شوید.');
    const name = window.prompt('نام پوشه جدید چیست؟');
    if (!name) return;
    await apiFetch('/api/files/folders', { method: 'POST', body: JSON.stringify({ workspaceId, name }) });
    setToast('پوشه جدید ساخته شد.');
    loadFiles();
  }

  function uploadDroppedFiles(fileList) {
    if (!workspaceId) return setToast('برای آپلود واقعی ابتدا وارد حساب شوید.');
    const selected = Array.from(fileList);
    selected.forEach((file) => {
      const id = `${file.name}-${Date.now()}`;
      setQueue((items) => [{ id, name: file.name, progress: 0, status: 'در حال آپلود' }, ...items]);
      const formData = new FormData();
      formData.append('workspaceId', workspaceId);
      formData.append('files', file);
      apiUpload('/api/files/upload', formData, (progress) => {
        setQueue((items) => items.map((item) => (item.id === id ? { ...item, progress } : item)));
      })
        .then(() => {
          setQueue((items) => items.map((item) => (item.id === id ? { ...item, progress: 100, status: 'تکمیل شد' } : item)));
          loadFiles();
        })
        .catch((error) => setQueue((items) => items.map((item) => (item.id === id ? { ...item, status: error.message } : item))));
    });
  }

  async function renameFile(file) {
    const name = window.prompt('نام جدید فایل چیست؟', file.name);
    if (!name || file._id?.startsWith('demo-')) return;
    await apiFetch(`/api/files/${file._id}/rename`, { method: 'PATCH', body: JSON.stringify({ name }) });
    setToast('نام فایل به روز شد.');
    loadFiles();
  }

  async function deleteFile(file) {
    if (file._id?.startsWith('demo-')) return setToast('برای حذف واقعی ابتدا وارد حساب شوید.');
    if (!window.confirm(`حذف ${file.name} انجام شود؟`)) return;
    await apiFetch(`/api/files/${file._id}`, { method: 'DELETE' });
    setToast('فایل حذف شد.');
    loadFiles();
  }

  async function openPreview(file) {
    if (file.type === 'folder') return;
    if (file._id?.startsWith('demo-')) return setPreview({ file, url: null, demo: true });
    const payload = await apiFetch(`/api/files/${file._id}/preview`);
    setPreview({ file, ...payload, url: payload.url?.startsWith('/api/') ? `${API_BASE_URL}${payload.url}` : payload.url });
  }

  async function createShare(file) {
    if (file._id?.startsWith('demo-')) return setToast('برای ساخت لینک واقعی ابتدا وارد حساب شوید.');
    const payload = await apiFetch(`/api/files/${file._id}/share`, { method: 'POST', body: JSON.stringify({ downloadLimit: 25 }) });
    setShare(payload);
  }

  const visibleFiles = useMemo(() => {
    const source = isDemo ? files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())) : files;
    if (activeFilter === 'all') return source;
    if (activeFilter === 'folder') return source.filter((file) => file.type === 'folder');
    if (activeFilter === 'image') return source.filter((file) => file.mimeType?.startsWith('image/'));
    if (activeFilter === 'video') return source.filter((file) => file.mimeType?.startsWith('video/'));
    return source.filter((file) => file.mimeType?.includes('pdf') || file.mimeType?.includes('text'));
  }, [activeFilter, files, isDemo, query]);

  const totalBytes = useMemo(() => visibleFiles.reduce((sum, file) => sum + (file.size || 0), 0), [visibleFiles]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
      <section className="panel rounded-[2.2rem] p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="eyebrow">File Operations Surface</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">مدیریت فایل ها حالا واقعا شبیه یک بخش مرکزی محصول است.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">این نما فقط لیست فایل نیست. کاربر از همین جا می تواند جستجو کند، پوشه بسازد، آپلود کند، پیش نمایش ببیند و مستقیما لینک اشتراک حرفه ای تولید کند.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {insights.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
                <p className="text-slate-400">{item.label}</p>
                <strong className="mt-2 block text-lg font-black text-cyanGlow">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {isDemo ? (
          <div className="mt-5 rounded-[1.5rem] border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
            برای اتصال به API واقعی <Link className="font-bold underline" href="/login">وارد شوید</Link> یا <Link className="font-bold underline" href="/register">ثبت نام کنید</Link>.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">جستجو و کنترل</p>
                <p className="mt-2 text-2xl font-black">{visibleFiles.length} آیتم در نمای فعلی</p>
              </div>
              <div className="flex gap-2">
                <button onClick={createFolder} className="btn-ghost text-sm">ساخت پوشه</button>
                <button onClick={() => setToast('در نسخه بعدی، پنجره آپلود پیشرفته هم اضافه می شود.')} className="btn-secondary text-sm">آپلود سریع</button>
              </div>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="نام فایل، نوع یا کلیدواژه را جستجو کنید..."
              className="mt-4 w-full rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-4 outline-none transition focus:border-cyanGlow"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ['all', 'همه'],
                ['folder', 'پوشه ها'],
                ['image', 'تصاویر'],
                ['video', 'ویدیوها'],
                ['doc', 'اسناد'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${activeFilter === key ? 'bg-white text-nebula shadow-neon' : 'bg-white/6 text-slate-200 hover:bg-white/10'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              uploadDroppedFiles(event.dataTransfer.files);
            }}
            className="rounded-[1.8rem] border border-dashed border-cyanGlow/35 bg-cyanGlow/8 p-5 text-center transition hover:bg-cyanGlow/12"
          >
            <p className="text-sm text-cyanGlow">Drop Zone</p>
            <h3 className="mt-3 text-2xl font-black">فایل ها را اینجا رها کنید</h3>
            <p className="mt-3 text-sm leading-8 text-slate-300">صف آپلود، پیشرفت زنده و اتصال مستقیم به API برای فایل های حجیم تا 1024MB.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] bg-black/10 p-3 text-sm text-slate-300">تا 20 فایل همزمان</div>
              <div className="rounded-[1.3rem] bg-black/10 p-3 text-sm text-slate-300">پیش نمایش بعد از آپلود</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">فهرست فایل ها</h3>
                <p className="mt-1 text-sm text-slate-400">حجم نمای فعلی: {formatBytes(totalBytes)}</p>
              </div>
              <span className="rounded-full bg-cyanGlow/10 px-3 py-1 text-sm text-cyanGlow">{loading ? 'در حال بارگذاری' : 'آماده'}</span>
            </div>
            <div className="grid gap-3">
              {loading ? <div className="skeleton h-24 rounded-[1.6rem]" /> : visibleFiles.map((file) => (
                <article
                  key={file._id || file.id}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setMenu({ x: event.clientX, y: event.clientY, file });
                  }}
                  className="group flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-black/10 p-4 transition hover:-translate-y-1 hover:border-cyanGlow/30 hover:shadow-neon md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-[1.2rem] bg-white/10 text-lg font-black">{iconFor(file)}</span>
                    <div>
                      <h4 className="font-black">{file.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">{friendlyType(file)} • {formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                    <button onClick={() => openPreview(file)} className="rounded-full bg-white/10 px-4 py-2 text-sm">پیش نمایش</button>
                    <button onClick={() => createShare(file)} className="rounded-full bg-cyanGlow/15 px-4 py-2 text-sm text-cyanGlow">اشتراک</button>
                  </div>
                </article>
              ))}
            </div>
            {nextCursor ? <button onClick={() => loadFiles({ cursor: nextCursor, append: true })} className="btn-ghost mt-5 w-full">نمایش موارد بیشتر</button> : null}
          </div>

          <div className="grid gap-4">
            <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-2xl font-black">کلکسیون های سریع</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {smartCollections.map((item) => (
                  <div key={item.label} className="rounded-[1.3rem] border border-white/8 bg-black/10 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <strong className="mt-2 block text-2xl font-black">{item.count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-2xl font-black">صف آپلود</h3>
              <div className="mt-4">
                {queue.length ? queue.map((item) => <QueueItem key={item.id} item={item} />) : <div className="rounded-[1.4rem] border border-white/10 bg-black/10 p-4 text-sm text-slate-400">هنوز آپلودی در صف وجود ندارد.</div>}
              </div>
            </section>
            <PreviewPanel preview={preview} />
          </div>
        </div>
      </section>

      <aside className="grid gap-5">
        <section className="panel rounded-[2.2rem] p-5">
          <h3 className="text-2xl font-black">قابلیت های خفن این بخش</h3>
          <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-300">
            <li>• فیلتر نوع فایل برای حرکت سریع بین رسانه ها</li>
            <li>• صف آپلود قابل مشاهده با درصد پیشرفت</li>
            <li>• پیش نمایش فوری فایل های تصویری، ویدیویی، صوتی و PDF</li>
            <li>• ساخت لینک اشتراک مستقیم از کنار هر فایل</li>
          </ul>
        </section>
        <section className="panel rounded-[2.2rem] p-5">
          <h3 className="text-2xl font-black">مسیرهای بعدی</h3>
          <div className="mt-4 grid gap-3">
            <Link href="/workspaces" className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 text-sm transition hover:shadow-neon">ورود به مدیریت Workspace ها</Link>
            <Link href="/activity" className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 text-sm transition hover:shadow-neon">مرور Activity Feed</Link>
            <Link href="/tour" className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 text-sm transition hover:shadow-neon">مشاهده Tour محصول</Link>
          </div>
        </section>
      </aside>

      {toast ? <button className="panel fixed bottom-4 left-4 z-50 rounded-[1.4rem] px-4 py-3 text-sm" onClick={() => setToast('')}>{toast}</button> : null}
      {share ? <ShareModal share={share} onClose={() => setShare(null)} /> : null}
      {menu ? <ContextMenu menu={menu} onClose={() => setMenu(null)} onPreview={openPreview} onRename={renameFile} onDelete={deleteFile} onShare={createShare} /> : null}
    </div>
  );
}

function iconFor(file) {
  if (file.type === 'folder') return 'DIR';
  if (file.mimeType?.includes('pdf')) return 'PDF';
  if (file.mimeType?.startsWith('video/')) return 'VID';
  if (file.mimeType?.startsWith('image/')) return 'IMG';
  if (file.mimeType?.startsWith('audio/')) return 'AUD';
  return 'FILE';
}

function friendlyType(file) {
  if (file.type === 'folder') return 'پوشه';
  if (file.mimeType?.includes('pdf')) return 'سند PDF';
  if (file.mimeType?.startsWith('video/')) return 'ویدیو';
  if (file.mimeType?.startsWith('image/')) return 'تصویر';
  if (file.mimeType?.startsWith('audio/')) return 'صوت';
  if (file.mimeType?.includes('text')) return 'فایل متنی';
  return file.mimeType || 'فایل';
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function QueueItem({ item }) {
  return (
    <div className="mb-3 rounded-[1.4rem] border border-white/10 bg-black/10 p-3">
      <div className="flex justify-between gap-3 text-sm">
        <span className="truncate">{item.name}</span>
        <span className="shrink-0">{item.status === 'در حال آپلود' ? `${item.progress}%` : item.status}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyanGlow" style={{ width: `${item.progress}%` }} />
      </div>
    </div>
  );
}

function ContextMenu({ menu, onClose, onPreview, onRename, onDelete, onShare }) {
  const actions = [
    ['پیش نمایش', onPreview],
    ['تغییر نام', onRename],
    ['اشتراک', onShare],
    ['حذف', onDelete],
  ];

  return (
    <div style={{ top: menu.y, left: menu.x }} className="panel fixed z-50 w-52 rounded-[1.4rem] p-2" onMouseLeave={onClose}>
      {actions.map(([label, action]) => (
        <button key={label} onClick={() => { action(menu.file); onClose(); }} className="block w-full rounded-xl px-3 py-2 text-right text-sm transition hover:bg-white/10">
          {label}
        </button>
      ))}
    </div>
  );
}

function PreviewPanel({ preview }) {
  if (!preview) {
    return (
      <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
        <h3 className="text-2xl font-black">پیش نمایش هوشمند</h3>
        <div className="mt-4 grid aspect-video place-items-center rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyanGlow/15 to-violetGlow/10 p-4 text-center text-sm leading-8 text-slate-300">
          تصویر، ویدیو، صوت، PDF و فایل های متنی اینجا به شکل قابل ارائه نمایش داده می شوند.
        </div>
      </section>
    );
  }

  const mime = preview.mimeType || preview.file.mimeType || '';
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-2xl font-black">{preview.file.name}</h3>
      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">{renderPreview(preview.url, mime, preview.demo)}</div>
    </section>
  );
}

function renderPreview(url, mime, demo) {
  if (demo) return <div className="grid aspect-video place-items-center p-6 text-center text-slate-300">پیش نمایش واقعی بعد از ورود و اتصال API فعال می شود.</div>;
  if (mime.startsWith('image/')) return <img src={url} alt="preview" className="max-h-[420px] w-full object-contain" />;
  if (mime.startsWith('video/')) return <video src={url} controls className="w-full" />;
  if (mime.startsWith('audio/')) return <div className="p-5"><audio src={url} controls className="w-full" /></div>;
  if (mime.includes('pdf')) return <iframe src={url} title="PDF preview" className="h-[420px] w-full" />;
  return <iframe src={url} title="File preview" className="h-[420px] w-full bg-white text-black" />;
}

function ShareModal({ share, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur" onClick={onClose}>
      <section className="panel w-full max-w-lg rounded-[2rem] p-6" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-2xl font-black">لینک اشتراک ساخته شد</h2>
        <p className="mt-3 text-sm leading-8 text-slate-300">این لینک را می توانید برای مشتری یا همکار ارسال کنید. صفحه مقصد هم با ظاهر حرفه ای باز می شود.</p>
        <input readOnly value={share.url} className="mt-4 w-full rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3" />
        <img src={share.qrCodeDataUrl} alt="QR Code" className="mx-auto mt-5 h-40 w-40 rounded-[1.5rem] bg-white p-2" />
        <button onClick={onClose} className="btn-primary mt-5 w-full">بستن</button>
      </section>
    </div>
  );
}
