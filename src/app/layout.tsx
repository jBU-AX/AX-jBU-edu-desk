import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Tabs, { UtilNav } from '@/components/Tabs';
import { PROGRAMS } from '@/lib/programs';

export const metadata: Metadata = {
  title: 'jBU 공개교육 데스크',
  description: '공개교육 전체의 기수 운영, 매출, 고객·기업 CRM을 한 화면에서 관리합니다.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tabs = [{ href: '/', label: '전체', color: '#18212C' }, ...PROGRAMS.map((p) => ({ href: `/p/${p.slug}/`, label: p.name, color: p.color }))];
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="top">
          <div className="bar">
            <Link href="/" className="brand">jBU 공개교육 데스크</Link>
            <UtilNav />
          </div>
          <Tabs tabs={tabs} />
        </header>
        {children}
      </body>
    </html>
  );
}
