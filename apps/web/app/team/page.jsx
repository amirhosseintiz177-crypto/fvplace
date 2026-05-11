import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';

const members = [
  { name: 'Sara Rahimi', role: 'Product Editor', status: 'Online', accent: 'text-cyanGlow' },
  { name: 'Amir Soltani', role: 'Workspace Admin', status: 'Reviewing assets', accent: 'text-amber-200' },
  { name: 'Nika Daryaei', role: 'Motion Designer', status: 'Uploading video', accent: 'text-violetGlow' },
  { name: 'Pouya Karimi', role: 'Client Manager', status: 'Shared a link', accent: 'text-rose-200' },
];

export default function TeamPage() {
  return (
    <AppShell>
      <section className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Team Surface</span>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">اعضای تیم هم حالا یک مقصد مستقل و خوش ساخت دارند.</h1>
            <p className="section-copy mt-4 max-w-3xl">این صفحه برای نمایش نقش ها، وضعیت اعضا و مسیر دعوت یا مدیریت همکاری ساخته شد تا لایه تیمی محصول فقط در حد یک مفهوم باقی نماند.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">دعوت عضو جدید</button>
            <Link href="/workspaces" className="btn-ghost">مدیریت Workspace</Link>
          </div>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {members.map((member, index) => (
            <GlassCard key={member.name}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`grid h-14 w-14 place-items-center rounded-[1.3rem] bg-white/10 text-xl font-black ${member.accent}`}>{index + 1}</div>
                  <div>
                    <h2 className="text-2xl font-black">{member.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">{member.status}</div>
              </div>
            </GlassCard>
          ))}
        </div>
        <GlassCard>
          <h2 className="text-xl font-black">کنترل های تیم</h2>
          <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-300">
            <li>• نقش های Owner / Admin / Editor / Viewer</li>
            <li>• دعوت سریع به ورک اسپیس ها</li>
            <li>• مشاهده وضعیت و اکتیویتی اعضا</li>
            <li>• پایه مناسب برای اتصال بعدی به API واقعی اعضا</li>
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
