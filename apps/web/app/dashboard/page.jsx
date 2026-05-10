import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { StorageChart } from '../../components/dashboard/StorageChart';

const activities = ['Uploaded Launch-Trailer.mp4', 'Shared Brand-System.pdf', 'Renamed Q2 Roadmap', 'Invited Sara as Editor'];

export default function DashboardPage() {
  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-cyanGlow">Dashboard</p><h1 className="text-4xl font-black md:text-5xl">مرکز کنترل فضای ابری</h1></div>
        <button className="rounded-2xl bg-cyanGlow px-5 py-3 font-black text-nebula shadow-neon transition hover:scale-105">آپلود سریع</button>
      </header>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <GlassCard><StorageChart /></GlassCard>
        <GlassCard><h2 className="mb-4 font-black">Skeleton Loading</h2><Skeleton className="mb-3 h-16" /><Skeleton className="mb-3 h-16" /><Skeleton className="h-16" /></GlassCard>
        <GlassCard className="xl:col-span-1"><h2 className="mb-4 text-xl font-black">Recent Files</h2><div className="grid gap-3 md:grid-cols-2">{['Design.fig', 'Contract.pdf', 'Demo.mp4', 'Server.ts'].map((file) => <div key={file} className="rounded-3xl bg-white/5 p-4 transition hover:-translate-y-1 hover:shadow-neon"><p className="font-bold">{file}</p><p className="mt-2 text-sm text-slate-400">Updated now</p></div>)}</div></GlassCard>
        <GlassCard><h2 className="mb-4 text-xl font-black">Activity Timeline</h2><div className="space-y-4">{activities.map((activity) => <div key={activity} className="border-r border-cyanGlow/30 pr-4"><p className="font-bold">{activity}</p><p className="text-sm text-slate-400">Realtime event</p></div>)}</div></GlassCard>
      </div>
    </AppShell>
  );
}
