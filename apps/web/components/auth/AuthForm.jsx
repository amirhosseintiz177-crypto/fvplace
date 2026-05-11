'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../../lib/api';
import { saveSession } from '../../lib/auth';

export function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');
      saveSession(data);
      router.push('/files');
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <aside className="panel rounded-[2.6rem] p-8 lg:p-10">
          <span className="eyebrow">FVPlace Nova Access</span>
          <h1 className="mt-5 text-4xl font-black md:text-5xl">{isRegister ? 'شروع یک محیط ابری مرتب، امن و خوش استایل' : 'بازگشت به پنل مدیریت فایل و تجربه کامل محصول'}</h1>
          <p className="section-copy mt-5 text-lg">بعد از ورود، کاربر فقط به یک داشبورد خشک نمی رسد. او وارد مجموعه ای از صفحه های هماهنگ می شود: داشبورد، فایل ها، اشتراک، پروفایل عمومی و مسیرهای معرفی محصول.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {['آپلود تا 1024MB', 'لینک اشتراک حرفه ای', 'پروفایل عمومی', 'ساختار تیمی'].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">{item}</div>
            ))}
          </div>
        </aside>

        <section className="panel rounded-[2.6rem] p-8 lg:p-10">
          <p className="text-cyanGlow">{isRegister ? 'ثبت نام' : 'ورود'}</p>
          <h2 className="mt-3 text-3xl font-black">{isRegister ? 'ساخت حساب جدید' : 'ورود به حساب'}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">{isRegister ? 'یک حساب بسازید و مسیرهای مختلف سایت را از داخل محصول تجربه کنید.' : 'برای باز کردن پنل فایل، داشبورد و ابزارهای اشتراک وارد شوید.'}</p>
          {error ? <div className="mt-5 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
          <form onSubmit={submit} className="mt-6 grid gap-4">
            {isRegister ? <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} placeholder="نام یا نام تیم" className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] px-5 py-4 outline-none transition focus:border-cyanGlow" /> : null}
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required type="email" placeholder="ایمیل" className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] px-5 py-4 outline-none transition focus:border-cyanGlow" />
            <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} type="password" placeholder="رمز عبور" className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] px-5 py-4 outline-none transition focus:border-cyanGlow" />
            <button disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-60">{loading ? 'در حال ارسال...' : isRegister ? 'ساخت حساب' : 'ورود به پنل'}</button>
          </form>
          <p className="mt-5 text-sm text-slate-400">
            {isRegister ? 'حساب دارید؟ ' : 'حساب ندارید؟ '}
            <Link className="text-cyanGlow" href={isRegister ? '/login' : '/register'}>{isRegister ? 'وارد شوید' : 'ثبت نام کنید'}</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
