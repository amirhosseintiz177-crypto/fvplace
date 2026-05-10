import './globals.css';

export const metadata = {
  title: 'FVPlace Nova — Futuristic Cloud Storage',
  description: 'Modern SaaS cloud storage with realtime collaboration, S3 storage, workspaces and sharing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
