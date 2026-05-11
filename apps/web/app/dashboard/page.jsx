import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { StorageChart } from '../../components/dashboard/StorageChart';

const activities = [
  'ویدیوی کمپین به فضای تیم آپلود شد',
  'لینک اشتراک برای فایل معرفی برند ساخته شد',
  'پوشه قراردادهای مشتری بازآرایی شد',
  'عضو جدید به workspace محصول دعوت شد',
];

const stats = [
  { label: 'فایل فعال', value: '1,284' },
  { label: 'لینک اشتراک', value: '96' },
  { label: 'همکار تیمی', value: '18' },
  { label: 'آپلود امروز', value: '42' },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <header className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="eyebrow">داشبورد مرکزی</span>
            <h1 className="mt-4 text-4xl font-black md:text-6xl">مرکز فرمان فایل ها، تیم، اشتراک و تحویل حرفه ای</h1>
            <p className="section-copy mt-4 max-w-3xl">در این نما، کاربر باید حس کند وارد یک اتاق عملیات واقعی شده است: داده دارد، مسیر دارد، عملیات سریع دارد و از اینجا می تواند به فایل ها، اشتراک ها و پروفایل عمومی برود.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/files" className="btn-primary">مدیریت فایل ها</Link>
            <Link href="/share/demo" className="btn-ghost">صفحه اشتراک</Link>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="metric-card">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <strong className="mt-3 text-4xl font-black">{stat.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <GlassCard>
          <StorageChart />
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-xl font-black">میانبرهای امروز</h2>
          <div className="grid gap-3">
            {['آپلود فایل جدید', 'ساخت پوشه برای مشتری', 'مرور فعالیت تیم', 'باز کردن لینک های اشتراک'].map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">{item}</div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">فضاهای کاری و فایل های مهم</h2>
            <Link href="/files" className="text-sm text-cyanGlow">مشاهده همه</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {['Brand-System.pdf', 'Q2 Campaign Assets', 'Launch-Trailer.mp4', 'Roadmap Board'].map((file) => (
              <div key={file} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:shadow-neon">
                <p className="font-bold">{file}</p>
                <p className="mt-2 text-sm text-slate-400">به روزرسانی شده در همین امروز</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-xl font-black">جریان فعالیت لحظه ای</h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity} className="flex gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyanGlow/15 font-black text-cyanGlow">0{index + 1}</div>
                <div>
                  <p className="font-bold">{activity}</p>
                  <p className="mt-1 text-sm text-slate-400">Realtime event</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
