import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { FileManager } from '../../components/files/FileManager';

const quickPanels = [
  { title: 'آپلود حجیم', copy: 'پشتیبانی یکپارچه تا سقف 1024MB برای هر فایل' },
  { title: 'مرتب سازی هوشمند', copy: 'جستجو، پوشه بندی، پیش نمایش و عملیات سریع روی فایل ها' },
  { title: 'تحویل حرفه ای', copy: 'از همین صفحه تا ساخت لینک اشتراک و پروفایل عمومی' },
];

export default function FilesPage() {
  return (
    <AppShell>
      <section className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="eyebrow">File Hub</span>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">مرکز مدیریت فایل ها با ظاهر جدی تر و مسیرهای روشن تر</h1>
            <p className="section-copy mt-4 max-w-3xl">این صفحه فقط یک لیست فایل نیست؛ باید مثل اتاق کار اصلی محصول عمل کند. کاربر باید آپلود کند، فایل را ببیند، جستجو کند و بعد اگر خواست مستقیم آن را به اشتراک بگذارد.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/share/demo" className="btn-secondary">نمونه صفحه اشتراک</Link>
            <Link href="/profile/nova" className="btn-ghost">پروفایل عمومی</Link>
          </div>
        </div>
        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {quickPanels.map((panel) => (
            <div key={panel.title} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-lg font-black">{panel.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">{panel.copy}</p>
            </div>
          ))}
        </div>
      </section>
      <FileManager />
    </AppShell>
  );
}
