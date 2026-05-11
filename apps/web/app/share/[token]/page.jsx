export default function ShareDownloadPage({ params }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_.98fr]">
        <div className="panel rounded-[2.8rem] p-6 lg:p-10">
          <span className="eyebrow">Secure Share Surface</span>
          <h1 className="mt-5 text-4xl font-black md:text-5xl">دانلود فایل باید شبیه یک تجربه حرفه ای و برنددار باشد، نه یک صفحه خام.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">در این صفحه، لینک اشتراک شما می تواند وضعیت فایل، توضیح، CTA واضح و نشانه های اعتماد را یکجا نشان بدهد. این همان چیزی است که هنگام ارسال فایل به مشتری تفاوت ایجاد می کند.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card"><span className="text-sm text-slate-400">توکن</span><strong className="mt-2 text-2xl">{params.token}</strong></div>
            <div className="metric-card"><span className="text-sm text-slate-400">محدودیت</span><strong className="mt-2 text-2xl">25 دانلود</strong></div>
            <div className="metric-card"><span className="text-sm text-slate-400">وضعیت</span><strong className="mt-2 text-2xl">Active</strong></div>
          </div>
        </div>

        <div className="panel rounded-[2.8rem] p-6 lg:p-10 text-center">
          <p className="text-sm text-cyanGlow">Preview of delivery page</p>
          <h2 className="mt-3 text-3xl font-black">Brand-System.pdf</h2>
          <p className="mt-3 text-sm leading-8 text-slate-300">لینک اشتراک برای ارائه حرفه ای فایل به مشتری، تیم یا همکار. می توانید این صفحه را با توضیح کوتاه، پیش نمایش و CTA واضح غنی تر کنید.</p>
          <div className="mx-auto mt-6 grid h-44 w-44 place-items-center rounded-[2rem] bg-white text-nebula shadow-neon">QR</div>
          <button className="btn-primary mt-8 w-full">دانلود امن فایل</button>
          <button className="btn-ghost mt-3 w-full">درخواست نسخه جدید</button>
        </div>
      </section>
    </main>
  );
}
