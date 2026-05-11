import Link from 'next/link';
import { MarketingShell } from '../../components/layout/MarketingShell';

const solutions = [
  {
    title: 'استودیوهای خلاق و تولید محتوا',
    text: 'برای تحویل فایل های ویدیویی، آرشیو پروژه، بازخورد مشتری و ساخت لینک های دانلود شیک.',
    points: ['آپلودهای حجیم', 'پیش نمایش فایل', 'تحویل برندپذیر'],
  },
  {
    title: 'تیم های محصول و نرم افزار',
    text: 'برای مستندات، فایل های طراحی، خروجی build، همکاری تیمی و ردیابی تغییرات روزمره.',
    points: ['جستجو و پوشه بندی', 'فعالیت تیمی', 'مدیریت نقش ها'],
  },
  {
    title: 'شرکت های خدماتی و آژانس ها',
    text: 'برای مدیریت دارایی های مشتری، قراردادها، فایل های تحویلی و پورتال حرفه ای اشتراک.',
    points: ['پروفایل عمومی', 'اشتراک امن', 'محدودیت دانلود'],
  },
];

export default function SolutionsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-6">
        <div className="panel rounded-[2.8rem] p-6 lg:p-10">
          <span className="eyebrow">راهکارها</span>
          <h1 className="section-title mt-5">هر کسب و کار، نسخه متفاوتی از FVPlace را تجربه می کند.</h1>
          <p className="section-copy mt-5 max-w-3xl text-lg">این صفحه برای معرفی سناریوهای واقعی طراحی شده تا کاربر بفهمد محصول فقط یک فضای آپلود نیست، بلکه یک لایه کامل برای مدیریت، ارائه و تحویل فایل است.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {solutions.map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-2xl font-black">{item.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-300">{item.text}</p>
                <ul className="mt-5 space-y-3 text-sm text-cyan-100">
                  {item.points.map((point) => <li key={point}>• {point}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary">مقایسه پلن ها</Link>
            <Link href="/dashboard" className="btn-ghost">ورود به تجربه محصول</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
