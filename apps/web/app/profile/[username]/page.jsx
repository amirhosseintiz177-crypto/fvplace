export default function PublicProfilePage({ params }) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <section className="glass rounded-[2.5rem] p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-cyanGlow to-violetGlow text-3xl font-black text-nebula">{params.username.slice(0, 1).toUpperCase()}</div>
          <div><p className="text-cyanGlow">Public Profile</p><h1 className="text-4xl font-black">@{params.username}</h1><p className="mt-2 text-slate-300">فایل‌های Public و لینک اختصاصی کاربر.</p></div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{['Portfolio.pdf', 'Showreel.mp4', 'Open-source.zip'].map((file) => <article key={file} className="rounded-3xl bg-white/5 p-5"><h3 className="font-bold">{file}</h3><p className="mt-2 text-sm text-slate-400">Public file</p></article>)}</div>
      </section>
    </main>
  );
}
