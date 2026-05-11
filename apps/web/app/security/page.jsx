import Link from 'next/link';
import { MarketingShell } from '../../components/layout/MarketingShell';

const securityLayers = [
  'استفاده از JWT برای نشست های کاربری و API خصوصی',
  'لینک های اشتراک با انقضا، محدودیت دانلود و امکان گسترش برای رمز',
  'فیلتر نوع فایل برای جلوگیری از برخی فرمت های پرخطر',
  'ذخیره سازی محلی self-hosted بدون وابستگی runtime به سرویس خارجی',
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="panel rounded-[2.8rem] p-6 lg:p-10">
            <span className="eyebrow">امنیت و اعتماد</span>
            <h1 className="section-title mt-5">صفحه امنیت باید حس اطمینان بدهد، نه فقط چند جمله پراکنده.</h1>
            <p className="section-copy mt-5 max-w-2xl text-lg">برای همین این بخش را به عنوان مقصد مستقل ساخته ایم تا مشتری یا تیم فنی شما دقیقا ببیند کنترل فایل، کنترل دسترسی و تجربه اشتراک گذاری چطور مدیریت می شود.</p>
            <div className="mt-8 space-y-4">
              {securityLayers.map((item, index) => (
                <div key={item} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Layer 0{index + 1}</p>
                  <p className="mt-2 text-sm leading-8 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel rounded-[2.8rem] p-6 lg:p-10">
            <div className="rounded-[2rem] border border-cyanGlow/20 bg-cyanGlow/10 p-5">
              <p className="text-sm text-cyan-100">خلاصه وضعیت محصول</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="metric-card"><span className="text-sm text-slate-300">حداکثر آپلود</span><strong>1024MB</strong></div>
                <div className="metric-card"><span className="text-sm text-slate-300">اشتراک</span><strong>Secure</strong></div>
                <div className="metric-card"><span className="text-sm text-slate-300">مدل استقرار</span><strong>Self-hosted</strong></div>
                <div className="metric-card"><span className="text-sm text-slate-300">معماری</span><strong>API + Web</strong></div>
              </div>
            </div>
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/10 p-5">
              <h2 className="text-2xl font-black">وقتی کاربر روی /share یا /profile می رود، هنوز داخل همان هویت امن و حرفه ای باقی می ماند.</h2>
              <p className="mt-4 text-sm leading-8 text-slate-300">این یک تفاوت مهم است: امنیت فقط داخل API نیست؛ در طراحی تجربه کاربر هم باید اعتماد، وضوح و پیش بینی پذیری دیده شود.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/share/demo" className="btn-primary">دیدن صفحه اشتراک</Link>
              <Link href="/profile/nova" className="btn-ghost">دیدن پروفایل عمومی</Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
