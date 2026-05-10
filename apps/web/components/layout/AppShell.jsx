'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession, getCurrentUser } from '../../lib/auth';
import { CommandPalette } from '../dashboard/CommandPalette';
import { NotificationDock } from '../dashboard/NotificationDock';

const navItems = [
  ['داشبورد', '/dashboard'],
  ['فایل‌ها', '/files'],
  ['اشتراک‌ها', '/share/demo'],
  ['پروفایل', '/profile/nova'],
];

export function AppShell({ children }) {
  const router = useRouter();
  const user = getCurrentUser();
  function logout() {
    clearSession();
    router.push('/login');
  }
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-5 px-4 py-5 lg:px-6">
      <aside className="glass sticky top-5 hidden h-[calc(100vh-2.5rem)] w-72 rounded-[2rem] p-5 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 text-xl font-black">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyanGlow text-nebula shadow-neon">☁</span>
          FVPlace Nova
        </Link>
        <nav className="space-y-2">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white hover:shadow-neon">
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-3">
          <div className="rounded-3xl border border-cyanGlow/20 bg-cyanGlow/10 p-4 text-sm text-cyan-100">
            <p className="font-bold">Ctrl + K</p>
            <p className="mt-1 text-slate-300">Command Palette را باز کنید.</p>
          </div>
          {user ? <button onClick={logout} className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm transition hover:bg-rose-500/20">خروج از {user.name}</button> : <Link href="/login" className="block rounded-2xl bg-cyanGlow px-4 py-3 text-center text-sm font-black text-nebula">ورود / ثبت‌نام</Link>}
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <CommandPalette />
        <NotificationDock />
        {children}
      </main>
    </div>
  );
}
