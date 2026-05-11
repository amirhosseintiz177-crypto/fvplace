import './globals.css';

export const metadata = {
  title: 'FVPlace Nova | پلتفرم حرفه ای ذخیره سازی و اشتراک فایل',
  description: 'پلتفرم خودمیزبان ذخیره سازی فایل با داشبورد تیمی، امنیت بالا، اشتراک گذاری امن و رابط کاربری مدرن.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
