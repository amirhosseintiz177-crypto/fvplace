'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getCurrentUser } from '../../lib/auth';
import { CommandPalette } from '../dashboard/CommandPalette';
import { NotificationDock } from '../dashboard/NotificationDock';
import { appNav } from './site-data';

export function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getCurrentUser();

  function logout() {
    clearSession();
    router.push('/login');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-5 lg:px-6">
      <aside className="panel sticky top-5 hidden h-[calc(100vh-2.5rem)] w-80 rounded-[2.2rem] p-5 lg:block">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__icon">FV</span>
          <span>
            <strong>FVPlace Nova</strong>
            <small>Control Surface</small>
          </span>
        </Link>

        <div className="mt-8 rounded-[1.8rem] border border-cyanGlow/15 bg-cyanGlow/10 p-4">
          <p className="text-sm text-cyan-100">فرمان سریع</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">با <span className="kbd">Ctrl</span> + <span className="kbd">K</span> به میانبرها و عملیات اصلی برسید.</p>
        </div>

        <nav className="mt-8 space-y-2">
          {appNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-[1.2rem] px-4 py-3 transition ${active ? 'bg-white text-nebula shadow-neon' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                <span>{item.label}</span>
                <small className={`${active ? 'text-nebula/70' : 'text-slate-500'}`}>{item.short}</small>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 grid gap-3">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">سقف آپلود</p>
            <strong className="mt-2 block text-3xl font-black text-cyanGlow">1024MB</strong>
          </div>
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">وضعیت حساب</p>
            <p className="mt-2 text-lg font-black">{user ? user.name : 'Guest Mode'}</p>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 grid gap-3">
          {user ? (
            <button onClick={logout} className="btn-ghost w-full">خروج از {user.name}</button>
          ) : (
            <Link href="/login" className="btn-primary w-full">ورود / ثبت نام</Link>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <CommandPalette />
        <NotificationDock />
        <div className="panel mb-5 flex items-center justify-between rounded-[2rem] px-4 py-4 lg:hidden">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__icon">FV</span>
            <span>
              <strong>FVPlace</strong>
              <small>Mobile Surface</small>
            </span>
          </Link>
          <Link href="/files" className="btn-primary text-sm">فایل ها</Link>
        </div>
        <div className="mb-5 grid gap-3 lg:hidden">
          {appNav.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-[1.2rem] px-4 py-3 text-sm ${pathname === item.href ? 'bg-white text-nebula' : 'panel-soft text-slate-200'}`}>
              {item.label}
            </Link>
          ))}
        </div>
        {children}
      </main>
    </div>
  );
}
