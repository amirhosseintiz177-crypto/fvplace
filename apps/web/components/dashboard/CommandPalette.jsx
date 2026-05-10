'use client';
import { useEffect, useState } from 'react';

const commands = ['Upload files', 'Create folder', 'Search files', 'Open settings', 'Invite member'];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/50 p-4 pt-28 backdrop-blur-md" onClick={() => setOpen(false)}>
      <div className="glass mx-auto w-full max-w-2xl rounded-[2rem] p-4" onClick={(event) => event.stopPropagation()}>
        <input autoFocus placeholder="جستجوی دستور..." className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 outline-none transition focus:border-cyanGlow" />
        <div className="mt-3 grid gap-2">
          {commands.map((command) => <button key={command} className="rounded-2xl px-4 py-3 text-right transition hover:bg-cyanGlow/10">{command}</button>)}
        </div>
      </div>
    </div>
  );
}
