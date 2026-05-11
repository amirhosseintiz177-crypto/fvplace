import Link from 'next/link';
import { MarketingShell } from '../../components/layout/MarketingShell';

const plans = [
  {
    name: 'Starter',
    price: 'رایگان',
    caption: 'برای تست محصول و شروع سریع',
    points: ['یک workspace', 'آپلود تا 1024MB', 'پیش نمایش و لینک اشتراک'],
    cta: '/register',
  },
  {
    name: 'Studio',
    price: 'محبوب تیم ها',
    caption: 'برای تیم هایی که تحویل فایل و همکاری برایشان مهم است',
    points: ['چند workspace', 'فعالیت تیمی', 'پروفایل عمومی و صفحه اشتراک حرفه ای'],
    cta: '/dashboard',
  },
  {
    name: 'Enterprise',
    price: 'سفارشی',
    caption: 'برای استقرار داخلی و سیاست های امنیتی سخت گیرانه',
    points: ['استقرار self-hosted', 'سفارشی سازی مسیرها', 'پشتیبانی از فرایندهای داخلی'],
    cta: '/security',
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-6">
        <div className="panel rounded-[2.8rem] p-6 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">تعرفه ها</span>
              <h1 className="section-title mt-5">چیدمان تعرفه ها هم باید شیک باشد، هم واضح، هم متناسب با حس محصول.</h1>
            </div>
            <p className="section-copy max-w-2xl">این صفحه الان نقش یک مقصد واقعی را بازی می کند؛ نه صرفا یک باکس قیمت. کاربر می تواند پلن مناسب خود را بفهمد و وارد همان تجربه شود.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article key={plan.name} className={`rounded-[2rem] border p-6 ${index === 1 ? 'border-cyanGlow/30 bg-cyanGlow/10 shadow-neon' : 'border-white/10 bg-white/[0.04]'}`}>
                <p className="text-sm text-slate-300">{plan.name}</p>
                <h2 className="mt-3 text-3xl font-black">{plan.price}</h2>
                <p className="mt-3 text-sm leading-8 text-slate-300">{plan.caption}</p>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-200">
                  {plan.points.map((point) => <li key={point}>• {point}</li>)}
                </ul>
                <Link href={plan.cta} className={`mt-8 inline-flex ${index === 1 ? 'btn-primary' : 'btn-ghost'}`}>انتخاب مسیر</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
