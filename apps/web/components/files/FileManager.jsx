'use client';
import { useMemo, useState } from 'react';

const sampleFiles = [
  { name: 'Brand-System.pdf', type: 'pdf', size: '2.4 MB' },
  { name: 'Launch-Trailer.mp4', type: 'video', size: '84 MB' },
  { name: 'Synthwave-Cover.png', type: 'image', size: '6.7 MB' },
  { name: 'api-client.ts', type: 'code', size: '18 KB' },
  { name: 'Ambient-Mix.mp3', type: 'audio', size: '12 MB' },
];

export function FileManager() {
  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState([]);
  const [menu, setMenu] = useState(null);
  const files = useMemo(() => sampleFiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())), [query]);

  function onDrop(event) {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer.files).map((file, index) => ({ id: `${file.name}-${index}`, name: file.name, progress: 18 + index * 22, paused: false }));
    setQueue((items) => [...dropped, ...items]);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="glass rounded-[2rem] p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm text-cyanGlow">Real-time Search</p><h1 className="text-3xl font-black">مدیریت فایل‌ها</h1></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی زنده فایل..." className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyanGlow" />
        </div>
        <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="mb-5 rounded-[2rem] border border-dashed border-cyanGlow/40 bg-cyanGlow/5 p-8 text-center transition hover:bg-cyanGlow/10">
          <p className="text-xl font-black">Drag & Drop Upload</p>
          <p className="mt-2 text-sm text-slate-400">چند فایل را همزمان رها کنید؛ Queue، Pause و Resume آماده اتصال به API است.</p>
        </div>
        <div className="grid gap-3">
          {files.map((file) => (
            <article key={file.name} onContextMenu={(event) => { event.preventDefault(); setMenu({ x: event.clientX, y: event.clientY, file }); }} className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[.06] p-4 transition hover:-translate-y-1 hover:border-cyanGlow/40 hover:shadow-neon">
              <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">{iconFor(file.type)}</span><div><h3 className="font-bold">{file.name}</h3><p className="text-sm text-slate-400">{file.type} · {file.size}</p></div></div>
              <button className="rounded-full bg-white/10 px-4 py-2 text-sm opacity-0 transition group-hover:opacity-100">Preview</button>
            </article>
          ))}
        </div>
      </section>
      <aside className="space-y-5">
        <section className="glass rounded-[2rem] p-5"><h2 className="mb-4 font-black">Upload Queue</h2>{queue.length ? queue.map((item) => <QueueItem key={item.id} item={item} />) : <div className="skeleton h-24" />}</section>
        <PreviewPanel />
      </aside>
      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
    </div>
  );
}

function iconFor(type) {
  return { pdf: 'PDF', video: '▶', image: '◎', code: '</>', audio: '♫' }[type] || '◌';
}
function QueueItem({ item }) {
  return <div className="mb-3 rounded-2xl bg-white/5 p-3"><div className="flex justify-between text-sm"><span>{item.name}</span><span>{item.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyanGlow" style={{ width: `${item.progress}%` }} /></div><button className="mt-2 text-xs text-slate-400">Pause / Resume</button></div>;
}
function ContextMenu({ menu, onClose }) {
  const actions = ['Preview', 'Rename', 'Move', 'Share', 'Delete'];
  return <div style={{ top: menu.y, left: menu.x }} className="glass fixed z-50 w-48 rounded-2xl p-2" onMouseLeave={onClose}>{actions.map((action) => <button key={action} className="block w-full rounded-xl px-3 py-2 text-right text-sm hover:bg-white/10">{action}</button>)}</div>;
}
function PreviewPanel() {
  return <section className="glass rounded-[2rem] p-5"><h2 className="font-black">Smart Preview</h2><div className="mt-4 aspect-video rounded-3xl border border-white/10 bg-gradient-to-br from-cyanGlow/20 to-violetGlow/20 p-4"><p className="text-sm text-slate-300">Image, Video, Music, PDF و Code Preview در این پنل نمایش داده می‌شود.</p></div></section>;
}
