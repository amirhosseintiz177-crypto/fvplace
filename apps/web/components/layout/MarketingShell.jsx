'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { marketingNav } from './site-data';

const footerColumns = [
  {
    title: 'محصول',
    links: [
      { label: 'تور محصول', href: '/tour' },
      { label: 'راهکارها', href: '/solutions' },
      { label: 'تعرفه ها', href: '/pricing' },
    ],
  },
  {
    title: 'اعتماد',
    links: [
      { label: 'امنیت', href: '/security' },
      { label: 'صفحه اشتراک', href: '/share/demo' },
      { label: 'پروفایل عمومی', href: '/profile/nova' },
    ],
  },
  {
    title: 'شروع',
    links: [
      { label: 'ورود', href: '/login' },
      { label: 'ثبت نام', href: '/register' },
      { label: 'داشبورد', href: '/dashboard' },
    ],
  },
];

export function MarketingShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <div className="hero-orb hero-orb-c" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 lg:px-6">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__icon">FV</span>
          <span>
            <strong>FVPlace Nova</strong>
            <small>Storage Experience Platform</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur xl:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${active ? 'bg-white text-nebula shadow-neon' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">ورود</Link>
          <Link href="/dashboard" className="btn-primary text-sm">ورود به اپ</Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 lg:px-6">
        <section className="panel rounded-[2.4rem] p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <Link href="/" className="brand-mark">
                <span className="brand-mark__icon">FV</span>
                <span>
                  <strong>FVPlace Nova</strong>
                  <small>Built for teams that care about delivery quality</small>
                </span>
              </Link>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">
                یک تجربه کامل برای ذخیره سازی، مدیریت، نمایش و تحویل فایل. از لندینگ تا پنل داخلی، از صفحه اشتراک تا پروفایل عمومی، همه چیز داخل یک زبان طراحی واحد ساخته شده است.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-black text-cyanGlow">{column.title}</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    {column.links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
}
