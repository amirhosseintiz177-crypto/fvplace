export default function PublicProfilePage({ params }) {
  const featuredFiles = [
    'Portfolio-Deck.pdf',
    'Brand-Reel.mp4',
    'Press-Kit.zip',
    'Case-Study.docx',
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-6">
      <section className="panel rounded-[2.8rem] p-6 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-cyanGlow via-white to-emberGlow text-4xl font-black text-nebula shadow-neon">
              {params.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="eyebrow">پروفایل عمومی</span>
              <h1 className="mt-4 text-4xl font-black">@{params.username}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-300">این صفحه نشان می دهد که محصول فقط برای داخل پنل نیست. هر کاربر یا تیم می تواند یک نمای عمومی شیک برای فایل های منتخب، معرفی کوتاه و مسیرهای دانلود داشته باشد.</p>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
            <p>نوع حساب: Creator / Team</p>
            <p className="mt-2">فایل های عمومی: 12</p>
            <p className="mt-2">آخرین به روزرسانی: امروز</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">درباره این پروفایل</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">یک بستر تمیز برای نمایش فایل های مهم، معرفی توانمندی ها و ارائه لینک های دانلود به مشتری یا همکار. این نما باید در همان سطح کیفی هوم و پنل اصلی باشد.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['نمونه کار', 'تحویل فایل', 'هویت عمومی'].map((item) => <div key={item} className="metric-card text-sm">{item}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyanGlow/10 via-white/[0.04] to-emberGlow/10 p-6">
            <h2 className="text-2xl font-black">دعوت به تعامل</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">کاربر عمومی می تواند از اینجا وارد صفحه اشتراک شود، نمونه فایل را باز کند یا برای همکاری بعدی مسیر پیدا کند.</p>
            <button className="btn-primary mt-6">درخواست فایل یا همکاری</button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredFiles.map((file) => (
            <article key={file} className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:shadow-neon">
              <h3 className="text-lg font-black">{file}</h3>
              <p className="mt-2 text-sm text-slate-400">فایل عمومی آماده نمایش و دانلود</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
