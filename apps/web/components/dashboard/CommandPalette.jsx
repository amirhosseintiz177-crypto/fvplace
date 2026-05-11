'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const commands = [
  { label: 'آپلود فایل جدید', href: '/files' },
  { label: 'ساخت پوشه جدید', href: '/files' },
  { label: 'مرور داشبورد', href: '/dashboard' },
  { label: 'صفحه امنیت', href: '/security' },
  { label: 'تعرفه ها', href: '/pricing' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => commands.filter((command) => command.label.includes(query.trim())), [query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/55 p-4 pt-24 backdrop-blur-md" onClick={() => setOpen(false)}>
      <div className="panel mx-auto w-full max-w-2xl rounded-[2rem] p-4" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>Command Palette</span>
          <span><span className="kbd">Esc</span> بستن</span>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثلا: داشبورد، فایل، امنیت..."
          className="w-full rounded-[1.3rem] border border-white/10 bg-white/8 px-5 py-4 outline-none transition focus:border-cyanGlow"
        />
        <div className="mt-3 grid gap-2">
          {(filtered.length ? filtered : commands).map((command) => (
            <Link key={command.label} href={command.href} onClick={() => setOpen(false)} className="rounded-[1.2rem] px-4 py-3 text-right transition hover:bg-cyanGlow/10">
              {command.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
