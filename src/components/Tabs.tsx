'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab { href: string; label: string; color: string }

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const path = usePathname() || '/';
  const isOn = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <nav className="tabs" aria-label="공개교육 선택">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className="tab" style={{ ['--c' as string]: t.color }} aria-current={isOn(t.href) ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function UtilNav() {
  const path = usePathname() || '/';
  const items = [
    { href: '/crm/', label: '고객·기업 CRM' },
    { href: '/library/', label: '자료함' }
  ];
  return (
    <nav className="util" aria-label="공통 메뉴">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path.startsWith(i.href.replace(/\/$/, '')) ? 'page' : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
