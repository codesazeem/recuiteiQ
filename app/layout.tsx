import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RecruitIQ',
  description: 'Centralized recruitment pipeline and candidate management for small and mid-sized organizations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
