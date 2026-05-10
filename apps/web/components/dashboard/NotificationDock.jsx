'use client';
import { useEffect, useState } from 'react';

export function NotificationDock() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => setItems([{ id: 1, text: 'Realtime notifications آماده اتصال به Socket.io است.' }]), 700);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed left-4 top-4 z-40 grid gap-2">
      {items.map((item) => <div key={item.id} className="glass rounded-2xl px-4 py-3 text-sm text-cyan-100 shadow-neon">{item.text}</div>)}
    </div>
  );
}
