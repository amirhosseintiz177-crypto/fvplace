import './globals.css';

export const metadata = {
  title: 'FVPlace Nova — Futuristic Cloud Storage',
  description: 'Self-contained SaaS cloud storage with realtime collaboration, local storage, workspaces and sharing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
