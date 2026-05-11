import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';

const settingsCards = [
  {
    title: 'تنظیمات آپلود',
    body: 'سقف آپلود 1024MB، محدودیت فایل های همزمان و سیاست های فایل های مسدود شده.',
  },
  {
    title: 'هویت برند',
    body: 'مدیریت عنوان محصول، رنگ ها و کیفیت صفحه های share و profile برای ارائه بهتر به مشتری.',
  },
  {
    title: 'اعلان ها و فعالیت',
    body: 'کنترل نوتیفیکیشن ها، رویدادهای تیمی و مسیرهای اعلان در داشبورد.',
  },
  {
    title: 'سیاست های امنیتی',
    body: 'تنظیم originها، نشست ها و سیاست های دسترسی برای استقرار self-hosted حرفه ای.',
  },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <span className="eyebrow">Settings</span>
        <h1 className="mt-4 text-4xl font-black md:text-5xl">صفحه تنظیمات را هم اضافه کردم تا پنل واقعا کامل حس شود.</h1>
        <p className="section-copy mt-4 max-w-3xl">محصول خوب فقط فایل و داشبورد ندارد. باید یک مقصد واضح برای تنظیمات، شخصی سازی، امنیت و رفتار سیستم هم داشته باشد.</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        {settingsCards.map((card) => (
          <GlassCard key={card.title}>
            <h2 className="text-2xl font-black">{card.title}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">{card.body}</p>
            <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">این بخش آماده اتصال به تنظیمات واقعی بک اند است.</div>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
