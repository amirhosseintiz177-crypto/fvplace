import Link from 'next/link';
import { MarketingShell } from '../../components/layout/MarketingShell';

const tourSteps = [
  {
    title: 'Landing با پیام واضح',
    body: 'کاربر به جای یک صفحه خالی، یک هوم قدرتمند می بیند که محصول، مسیرها و مزیت ها را شفاف معرفی می کند.',
  },
  {
    title: 'Dashboard با حس اتاق فرمان',
    body: 'ورود به اپ به یک پنل جدی منتهی می شود؛ داده، کارت، فعالیت و مسیر عملیات همگی حاضر هستند.',
  },
  {
    title: 'File Hub با مدیریت واقعی',
    body: 'آپلود، جستجو، پیش نمایش، ساخت پوشه، ساخت لینک و کنترل صف آپلود در یک سطح حرفه ای جمع شده اند.',
  },
  {
    title: 'Share و Profile برای بیرون از اپ',
    body: 'وقتی فایل را با کسی بیرون از تیم به اشتراک می گذارید، تجربه همچنان برنددار، تمیز و قابل اتکاست.',
  },
];

export default function TourPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-6">
        <div className="panel rounded-[2.8rem] p-6 lg:p-10">
          <span className="eyebrow">تور محصول</span>
          <h1 className="section-title mt-5">اگر کاربر بخواهد کل سایت را حس کند، اینجا مسیر کامل تجربه را می بیند.</h1>
          <p className="section-copy mt-5 max-w-3xl text-lg">این صفحه برای این ساخته شد که معرفی محصول فقط در یک Hero تمام نشود. حالا می توانیم مراحل مختلف تجربه را جداگانه نمایش بدهیم و محصول را خیلی حرفه ای تر ارائه کنیم.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {tourSteps.map((step, index) => (
              <article key={step.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Step 0{index + 1}</p>
                <h2 className="mt-3 text-2xl font-black">{step.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-300">{step.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">شروع از داشبورد</Link>
            <Link href="/files" className="btn-secondary">دیدن هاب فایل</Link>
            <Link href="/security" className="btn-ghost">مرور امنیت</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
