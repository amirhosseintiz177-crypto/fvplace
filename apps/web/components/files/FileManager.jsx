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
    if (!workspaceId) return setToast('برای ساخت پوشه ابتدا وارد حساب شوید.');
    const name = window.prompt('نام پوشه جدید؟');
    if (!name) return;
    await apiFetch('/api/files/folders', { method: 'POST', body: JSON.stringify({ workspaceId, name }) });
    setToast('پوشه ساخته شد.');
    loadFiles();
  }

  function uploadDroppedFiles(fileList) {
    if (!workspaceId) return setToast('برای آپلود واقعی ابتدا وارد حساب شوید.');
    const selected = Array.from(fileList);
    selected.forEach((file) => {
      const id = `${file.name}-${Date.now()}`;
      setQueue((items) => [{ id, name: file.name, progress: 0, status: 'uploading' }, ...items]);
      const formData = new FormData();
      formData.append('workspaceId', workspaceId);
      formData.append('files', file);
      apiUpload('/api/files/upload', formData, (progress) => {
        setQueue((items) => items.map((item) => (item.id === id ? { ...item, progress } : item)));
      })
        .then(() => {
          setQueue((items) => items.map((item) => (item.id === id ? { ...item, progress: 100, status: 'done' } : item)));
          loadFiles();
        })
        .catch((error) => setQueue((items) => items.map((item) => (item.id === id ? { ...item, status: error.message } : item))));
    });
  }

  async function renameFile(file) {
    const name = window.prompt('نام جدید؟', file.name);
    if (!name || file._id?.startsWith('demo-')) return;
    await apiFetch(`/api/files/${file._id}/rename`, { method: 'PATCH', body: JSON.stringify({ name }) });
    setToast('نام فایل تغییر کرد.');
    loadFiles();
  }

  async function deleteFile(file) {
    if (file._id?.startsWith('demo-')) return setToast('برای حذف واقعی وارد حساب شوید.');
    if (!window.confirm(`حذف ${file.name}?`)) return;
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
    if (file._id?.startsWith('demo-')) return setToast('برای ساخت لینک واقعی وارد حساب شوید.');
    const payload = await apiFetch(`/api/files/${file._id}/share`, { method: 'POST', body: JSON.stringify({ downloadLimit: 25 }) });
    setShare(payload);
  }

  const visibleFiles = useMemo(() => (isDemo ? files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())) : files), [files, isDemo, query]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <section className="glass rounded-[2rem] p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm text-cyanGlow">Real-time Search</p><h1 className="text-3xl font-black">مدیریت فایل‌ها</h1></div>
          <div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی زنده فایل..." className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyanGlow" /><button onClick={createFolder} className="rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-cyanGlow/20">پوشه</button></div>
        </div>
        {isDemo ? <div className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">برای اتصال به API واقعی <Link className="font-bold underline" href="/login">وارد شوید</Link> یا <Link className="font-bold underline" href="/register">ثبت‌نام کنید</Link>.</div> : null}
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadDroppedFiles(event.dataTransfer.files); }} className="mb-5 rounded-[2rem] border border-dashed border-cyanGlow/40 bg-cyanGlow/5 p-8 text-center transition hover:bg-cyanGlow/10">
          <p className="text-xl font-black">Drag & Drop Upload</p>
          <p className="mt-2 text-sm text-slate-400">چند فایل را همزمان رها کنید؛ progress واقعی با API نمایش داده می‌شود.</p>
        </div>
        <div className="grid gap-3">
          {loading ? <div className="skeleton h-24" /> : visibleFiles.map((file) => (
            <article key={file._id || file.id} onContextMenu={(event) => { event.preventDefault(); setMenu({ x: event.clientX, y: event.clientY, file }); }} className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[.06] p-4 transition hover:-translate-y-1 hover:border-cyanGlow/40 hover:shadow-neon">
              <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">{iconFor(file)}</span><div><h3 className="font-bold">{file.name}</h3><p className="text-sm text-slate-400">{file.mimeType || file.type} · {formatBytes(file.size)}</p></div></div>
              <button onClick={() => openPreview(file)} className="rounded-full bg-white/10 px-4 py-2 text-sm opacity-0 transition group-hover:opacity-100">Preview</button>
            </article>
          ))}
        </div>
        {nextCursor ? <button onClick={() => loadFiles({ cursor: nextCursor, append: true })} className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-3">نمایش بیشتر</button> : null}
      </section>
      <aside className="space-y-5">
        <section className="glass rounded-[2rem] p-5"><h2 className="mb-4 font-black">Upload Queue</h2>{queue.length ? queue.map((item) => <QueueItem key={item.id} item={item} />) : <div className="skeleton h-24" />}</section>
        <PreviewPanel preview={preview} />
      </aside>
      {toast ? <div className="glass fixed bottom-4 left-4 z-50 rounded-2xl px-4 py-3 text-sm" onClick={() => setToast('')}>{toast}</div> : null}
      {share ? <ShareModal share={share} onClose={() => setShare(null)} /> : null}
      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} onPreview={openPreview} onRename={renameFile} onDelete={deleteFile} onShare={createShare} />}
    </div>
  );
}

function iconFor(file) {
  if (file.type === 'folder') return '⌁';
  if (file.mimeType?.includes('pdf')) return 'PDF';
  if (file.mimeType?.startsWith('video/')) return '▶';
  if (file.mimeType?.startsWith('image/')) return '◎';
  if (file.mimeType?.startsWith('audio/')) return '♫';
  return '</>';
}
function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
function QueueItem({ item }) {
  return <div className="mb-3 rounded-2xl bg-white/5 p-3"><div className="flex justify-between text-sm"><span>{item.name}</span><span>{item.status === 'uploading' ? `${item.progress}%` : item.status}</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyanGlow" style={{ width: `${item.progress}%` }} /></div><button className="mt-2 text-xs text-slate-400">Pause / Resume</button></div>;
}
function ContextMenu({ menu, onClose, onPreview, onRename, onDelete, onShare }) {
  const actions = [['Preview', onPreview], ['Rename', onRename], ['Share', onShare], ['Delete', onDelete]];
  return <div style={{ top: menu.y, left: menu.x }} className="glass fixed z-50 w-48 rounded-2xl p-2" onMouseLeave={onClose}>{actions.map(([label, action]) => <button key={label} onClick={() => { action(menu.file); onClose(); }} className="block w-full rounded-xl px-3 py-2 text-right text-sm hover:bg-white/10">{label}</button>)}</div>;
}
function PreviewPanel({ preview }) {
  if (!preview) return <section className="glass rounded-[2rem] p-5"><h2 className="font-black">Smart Preview</h2><div className="mt-4 aspect-video rounded-3xl border border-white/10 bg-gradient-to-br from-cyanGlow/20 to-violetGlow/20 p-4"><p className="text-sm text-slate-300">Image, Video, Music, PDF و Code Preview اینجا نمایش داده می‌شود.</p></div></section>;
  const mime = preview.mimeType || preview.file.mimeType || '';
  return <section className="glass rounded-[2rem] p-5"><h2 className="font-black">{preview.file.name}</h2><div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/20">{renderPreview(preview.url, mime, preview.demo)}</div></section>;
}
function renderPreview(url, mime, demo) {
  if (demo) return <div className="grid aspect-video place-items-center p-6 text-center text-slate-300">Preview واقعی بعد از ورود و اتصال API فعال می‌شود.</div>;
  if (mime.startsWith('image/')) return <img src={url} alt="preview" className="max-h-[420px] w-full object-contain" />;
  if (mime.startsWith('video/')) return <video src={url} controls className="w-full" />;
  if (mime.startsWith('audio/')) return <div className="p-5"><audio src={url} controls className="w-full" /></div>;
  if (mime.includes('pdf')) return <iframe src={url} title="PDF preview" className="h-[420px] w-full" />;
  return <iframe src={url} title="File preview" className="h-[420px] w-full bg-white text-black" />;
}
function ShareModal({ share, onClose }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur" onClick={onClose}><section className="glass w-full max-w-lg rounded-[2rem] p-6" onClick={(event) => event.stopPropagation()}><h2 className="text-2xl font-black">لینک اشتراک ساخته شد</h2><input readOnly value={share.url} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3" /><img src={share.qrCodeDataUrl} alt="QR Code" className="mx-auto mt-5 h-40 w-40 rounded-2xl bg-white p-2" /><button onClick={onClose} className="mt-5 rounded-2xl bg-cyanGlow px-5 py-3 font-black text-nebula">بستن</button></section></div>;
}
