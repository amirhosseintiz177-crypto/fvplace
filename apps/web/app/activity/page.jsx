import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';

const feed = [
  { action: 'آپلود', title: 'Launch-Film-v7.mp4', time: '2 دقیقه پیش', accent: 'text-cyanGlow' },
  { action: 'اشتراک', title: 'Brand-System.pdf', time: '9 دقیقه پیش', accent: 'text-amber-200' },
  { action: 'جابجایی', title: 'Client Assets / Final', time: '26 دقیقه پیش', accent: 'text-violetGlow' },
  { action: 'دعوت عضو', title: 'Sara Rahimi', time: '1 ساعت پیش', accent: 'text-rose-200' },
];

export default function ActivityPage() {
  return (
    <AppShell>
      <section className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <span className="eyebrow">Activity Feed</span>
        <h1 className="mt-4 text-4xl font-black md:text-5xl">مسیر اکتیویتی هم الان یک صفحه مستقل و تمیز دارد.</h1>
        <p className="section-copy mt-4 max-w-3xl">وقتی چند نفر داخل یک workspace کار می کنند، جریان رویدادها خودش باید یک مقصد مهم باشد. این صفحه برای خوانایی، پیگیری و حس زنده بودن محصول ساخته شد.</p>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <GlassCard>
          <div className="space-y-4">
            {feed.map((item, index) => (
              <div key={`${item.action}-${item.title}`} className="flex gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-white/8 font-black ${item.accent}`}>0{index + 1}</div>
                <div>
                  <p className="text-sm text-slate-400">{item.action}</p>
                  <h2 className="mt-1 text-xl font-black">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-xl font-black">فایده این صفحه</h2>
          <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-300">
            <li>• مشاهده رویدادهای کلیدی بدون ورود به تک تک بخش ها</li>
            <li>• حس زنده بودن تیم و محصول</li>
            <li>• پایه مناسب برای اتصال بعدی به Socket.io واقعی</li>
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
