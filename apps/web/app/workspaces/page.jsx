import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';

const workspaces = [
  { name: 'Nova Product', role: 'Owner', members: 8, storage: '4.2 GB' },
  { name: 'Client Delivery', role: 'Admin', members: 14, storage: '7.9 GB' },
  { name: 'Studio Vault', role: 'Editor', members: 5, storage: '2.1 GB' },
];

export default function WorkspacesPage() {
  return (
    <AppShell>
      <section className="panel mb-6 rounded-[2.4rem] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Workspaces</span>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">فضاهای کاری را هم به یک مقصد واقعی داخل محصول تبدیل کردم.</h1>
            <p className="section-copy mt-4 max-w-3xl">این صفحه برای زمانی است که کاربر چند تیم، چند مشتری یا چند جریان تحویل فایل دارد و باید بین آن ها جابه جا شود بدون اینکه تجربه محصول از هم بپاشد.</p>
          </div>
          <Link href="/files" className="btn-primary">باز کردن فایل های Workspace</Link>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {workspaces.map((workspace) => (
            <GlassCard key={workspace.name}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{workspace.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">نقش شما: {workspace.role}</p>
                </div>
                <div className="grid gap-2 text-sm text-slate-300 md:text-left">
                  <span>اعضا: {workspace.members}</span>
                  <span>حجم مصرفی: {workspace.storage}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        <GlassCard>
          <h2 className="text-xl font-black">چرا این صفحه مهم است؟</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">وقتی سایت فقط داشبورد و فایل داشته باشد، محصول ناقص حس می شود. ورک اسپیس ها لایه سازمانی محصول را قابل لمس می کنند.</p>
        </GlassCard>
      </div>
    </AppShell>
  );
}
