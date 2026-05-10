import Link from 'next/link';

const features = ['S3 Storage', 'JWT + OAuth', 'Realtime', 'Teams', 'Versioning', 'Secure Sharing'];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 lg:px-6">
      <nav className="glass flex items-center justify-between rounded-[2rem] px-5 py-4">
        <div className="flex items-center gap-3 font-black"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyanGlow text-nebula shadow-neon">☁</span>FVPlace Nova</div>
        <div className="flex gap-2"><Link href="/login" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black transition hover:bg-white/20">ورود</Link><Link href="/register" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-nebula transition hover:shadow-neon">شروع رایگان</Link></div>
      </nav>
      <section className="grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-4 text-cyanGlow">Cloud Storage SaaS · 2026</p>
          <h1 className="neon-text text-5xl font-black leading-tight md:text-7xl">فضای ابری آینده‌نگر برای تیم‌ها، فایل‌ها و اشتراک‌گذاری امن.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-300">بازطراحی کامل با Next.js، TailwindCSS، Express، MongoDB، Socket.io و S3 Compatible Storage؛ آماده توسعه Production و مقیاس‌پذیری.</p>
          <div className="mt-8 flex flex-wrap gap-3">{features.map((feature) => <span key={feature} className="rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-4 py-2 text-sm text-cyan-100">{feature}</span>)}</div>
        </div>
        <div className="glass animate-float rounded-[2.5rem] p-6 shadow-violet">
          <div className="mb-5 flex items-center justify-between"><span className="text-sm text-slate-300">Live Upload</span><span className="animate-pulseGlow text-cyanGlow">● Online</span></div>
          {[92, 68, 41].map((value, index) => <div key={value} className="mb-5 rounded-3xl bg-white/5 p-4"><div className="mb-2 flex justify-between text-sm"><span>Project-{index + 1}.zip</span><span>{value}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyanGlow" style={{ width: `${value}%` }} /></div></div>)}
        </div>
      </section>
    </main>
  );
}
