'use client';
import { useEffect, useState } from 'react';

const seedNotifications = [
  'آماده برای اتصال نوتیفیکیشن های لحظه ای به Socket.io',
  'سقف آپلود پروژه روی 1024MB هماهنگ شده است',
  'صفحات جدید سایت برای معرفی، امنیت و تعرفه در دسترس هستند',
];

export function NotificationDock() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setItems(seedNotifications.slice(0, 2).map((text, index) => ({ id: index + 1, text }))), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed left-4 top-4 z-40 grid w-[min(28rem,calc(100vw-2rem))] gap-2">
      {items.map((item) => (
        <div key={item.id} className="panel-soft rounded-[1.4rem] px-4 py-3 text-sm text-cyan-50 shadow-neon">
          {item.text}
        </div>
      ))}
    </div>
  );
}
