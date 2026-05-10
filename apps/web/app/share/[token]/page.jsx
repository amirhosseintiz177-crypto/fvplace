export default function ShareDownloadPage({ params }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="glass w-full max-w-2xl rounded-[2.5rem] p-8 text-center">
        <p className="text-cyanGlow">Secure Share Link</p>
        <h1 className="mt-3 text-4xl font-black">صفحه دانلود حرفه‌ای</h1>
        <p className="mt-4 text-slate-300">توکن لینک: {params.token}</p>
        <div className="mx-auto mt-6 grid h-44 w-44 place-items-center rounded-3xl bg-white text-nebula">QR</div>
        <button className="mt-8 rounded-2xl bg-cyanGlow px-6 py-3 font-black text-nebula shadow-neon">دانلود امن</button>
      </section>
    </main>
  );
}
