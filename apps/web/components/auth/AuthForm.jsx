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
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="glass w-full max-w-xl rounded-[2.5rem] p-8">
        <p className="text-cyanGlow">FVPlace Nova</p>
        <h1 className="mt-3 text-4xl font-black">{isRegister ? 'ساخت حساب ابری' : 'ورود به فضای ابری'}</h1>
        <p className="mt-3 text-slate-300">برای اتصال داشبورد و File Manager به API واقعی وارد شوید.</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4">
          {isRegister ? <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} placeholder="نام" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 outline-none focus:border-cyanGlow" /> : null}
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required type="email" placeholder="ایمیل" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 outline-none focus:border-cyanGlow" />
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} type="password" placeholder="رمز عبور" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 outline-none focus:border-cyanGlow" />
          <button disabled={loading} className="rounded-2xl bg-cyanGlow px-5 py-4 font-black text-nebula shadow-neon disabled:opacity-60">{loading ? 'در حال ارسال...' : isRegister ? 'ثبت‌نام' : 'ورود'}</button>
        </form>
        <p className="mt-5 text-sm text-slate-400">
          {isRegister ? 'حساب دارید؟ ' : 'حساب ندارید؟ '}
          <Link className="text-cyanGlow" href={isRegister ? '/login' : '/register'}>{isRegister ? 'وارد شوید' : 'ثبت‌نام کنید'}</Link>
        </p>
      </section>
    </main>
  );
}
