import Link from 'next/link';
import { MarketingShell } from '../components/layout/MarketingShell';
import { productHighlights } from '../components/layout/site-data';

const journeyCards = [
  {
    title: 'اتاق فرمان تیمی',
    text: 'برای هر تیم یک workspace مستقل بسازید، اعضا را دعوت کنید و جریان فایل، نسخه و فعالیت را یکجا ببینید.',
    stat: '12 تیم فعال',
  },
  {
    title: 'آپلودهای سنگین بدون آشوب',
    text: 'فایل های حجیم تا 1024 مگابایت را با صف آپلود، پیش نمایش و مدیریت ساده داخل یک تجربه منظم ارسال کنید.',
    stat: '1 GB در هر فایل',
  },
  {
    title: 'اشتراک امن برای مشتری',
    text: 'لینک بسازید، محدودیت دانلود بگذارید و تجربه دریافت فایل را به شکلی شیک و حرفه ای به مخاطب تحویل دهید.',
    stat: 'لینک امن + QR',
  },
];

const featureColumns = [
  {
    label: 'عملیات',
    items: ['Upload Queue زنده', 'جستجوی سریع فایل', 'ساخت پوشه و مدیریت ساختار', 'پیش نمایش رسانه و اسناد'],
  },
  {
    label: 'امنیت',
    items: ['JWT و نقش های تیمی', 'محدودیت دانلود و انقضای لینک', 'مسدودسازی فایل های مشکوک', 'اجرای self-hosted بدون وابستگی runtime'],
  },
  {
    label: 'تجربه',
    items: ['داشبورد مدرن', 'صفحات عمومی برندپذیر', 'انیمیشن های نرم و هدفمند', 'رابط فارسی و واکنش گرا'],
  },
];

const timeline = [
  'ورود به لندینگ و آشنایی با قابلیت ها',
  'ثبت نام و ساخت workspace اولیه',
  'آپلود فایل، ساخت لینک و اشتراک گذاری',
  'استفاده روزمره از داشبورد، فایل ها و پروفایل عمومی',
];

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid min-h-[86vh] w-full max-w-7xl items-center gap-10 px-4 pb-20 pt-10 lg:grid-cols-[1.1fr_.9fr] lg:px-6 lg:pt-16">
        <div>
          <span className="eyebrow">پلتفرم ذخیره سازی، همکاری و تحویل فایل برای تیم های جدی</span>
          <h1 className="section-title mt-6 max-w-4xl">FVPlace Nova تجربه ای می سازد که از صفحه اصلی تا دانلود فایل، همه چیز حرفه ای، خوش استایل و قابل اتکا باشد.</h1>
          <p className="section-copy mt-6 max-w-3xl text-lg">
            این نسخه فقط یک هوم ساده نیست. ما برای مسیرهای اصلی سایت تجربه جداگانه می سازیم: معرفی محصول، راهکارها، امنیت، تعرفه، داشبورد داخلی، مدیریت فایل، صفحه اشتراک و پروفایل عمومی.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">ورود به پنل</Link>
            <Link href="/pricing" className="btn-secondary">دیدن تعرفه ها</Link>
            <Link href="/solutions" className="btn-ghost">دیدن سناریوهای استفاده</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {productHighlights.map((item) => (
              <div key={item} className="metric-card">
                <p className="text-sm leading-7 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel animate-drift rounded-[2.5rem] p-5 lg:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Live product surface</p>
              <h2 className="mt-2 text-2xl font-black">نمای زنده از تجربه کاربر</h2>
            </div>
            <span className="rounded-full bg-cyanGlow/15 px-3 py-1 text-sm text-cyanGlow">همه مسیرها متصل</span>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                <span>Landing</span>
                <span>Dashboard</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
                <div className="rounded-[1.4rem] bg-gradient-to-br from-cyanGlow/15 to-white/5 p-4">
                  <p className="text-sm text-cyanGlow">Hero</p>
                  <p className="mt-3 text-2xl font-black">معرفی روشن، CTA مشخص و مسیرهای متعدد</p>
                </div>
                <div className="rounded-[1.4rem] bg-gradient-to-br from-emberGlow/15 to-white/5 p-4">
                  <p className="text-sm text-amber-100">Share</p>
                  <p className="mt-3 text-xl font-black">لینک دانلود با تجربه برندپذیر</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {journeyCards.map((card) => (
                <div key={card.title} className="rounded-[1.6rem] border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{card.stat}</p>
                  <h3 className="mt-3 text-lg font-black">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <div className="panel rounded-[2.5rem] p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">ساختار سایت</span>
              <h2 className="section-title mt-4 text-4xl">این بار کاربر در مسیرهای مختلف، تجربه های مختلف می بیند.</h2>
            </div>
            <p className="section-copy max-w-2xl">به جای یک صفحه خشک، برای هر نیاز یک مقصد واقعی داریم: صفحه راهکارها، امنیت، تعرفه، پنل داخلی، صفحه فایل، صفحه اشتراک و پروفایل عمومی.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {featureColumns.map((column) => (
              <article key={column.label} className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-cyanGlow">{column.label}</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {column.items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[.9fr_1.1fr] lg:px-6">
        <div className="panel rounded-[2.5rem] p-6 lg:p-8">
          <span className="eyebrow">جریان کار</span>
          <h2 className="mt-4 text-4xl font-black">از معرفی برند تا تحویل فایل، همه چیز یک داستان واحد دارد.</h2>
          <div className="mt-8 space-y-4">
            {timeline.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyanGlow/15 text-lg font-black text-cyanGlow">{index + 1}</div>
                <p className="pt-1 text-sm leading-7 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel rounded-[2.5rem] p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.8rem] bg-gradient-to-br from-white/10 to-white/0 p-5 sm:col-span-2">
              <p className="text-sm text-slate-300">برای تیم هایی که زیبایی رابط را به اندازه امکانات جدی می گیرند</p>
              <h3 className="mt-3 text-3xl font-black">طراحی تازه با تاکید روی بافت، عمق، نور و حرکت</h3>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/10 p-5">
              <strong className="text-4xl font-black text-cyanGlow">1024MB</strong>
              <p className="mt-3 text-sm leading-7 text-slate-300">سقف آپلود یکپارچه برای فایل های سنگین در کل تجربه محصول</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/10 p-5">
              <strong className="text-4xl font-black text-amber-200">/share</strong>
              <p className="mt-3 text-sm leading-7 text-slate-300">صفحه اشتراک مستقل با حس برند، CTA مشخص و نمایش حرفه ای فایل</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/10 p-5">
              <strong className="text-4xl font-black text-violetGlow">/profile</strong>
              <p className="mt-3 text-sm leading-7 text-slate-300">پروفایل عمومی برای نمایش فایل های منتخب، هویت تیم و راه های ارتباط</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/10 p-5">
              <strong className="text-4xl font-black text-rose-200">/dashboard</strong>
              <p className="mt-3 text-sm leading-7 text-slate-300">داشبورد با داده، کارت، فعالیت، میانبر و مسیر مستقیم به مدیریت فایل</p>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
