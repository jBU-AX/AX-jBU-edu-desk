'use client';
import { useState } from 'react';
import RevenueChart from './RevenueChart';
import type { Program } from '@/lib/types';
import type { RevenueBasis } from '@/lib/scope';

interface View {
  total: number; people: number; sameLast: number; sameThis: number; lastTotal: number;
  rows: { month: string; bySlug: Record<string, number>; total: number }[];
}

const manwon = (n: number) => (n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '억' : Math.round(n / 1e4).toLocaleString('ko-KR') + '만') + '원';

/** 매출 머리글 + 월별 막대. 결제일 기준과 교육일 기준을 바꿔 볼 수 있습니다. */
export default function RevenuePanel({ year, today, programs, views }: { year: number; today: string; programs: Program[]; views: Record<RevenueBasis, View> }) {
  const [basis, setBasis] = useState<RevenueBasis>('paid');
  const v = views[basis];
  const diff = v.sameLast ? (v.sameThis - v.sameLast) / v.sameLast : 0;
  return (
    <>
      <div className="sec-h">
        <h2 id="rev-h">{year}년 매출</h2>
        <div className="seg" role="group" aria-label="매출 기준">
          <button aria-pressed={basis === 'paid'} onClick={() => setBasis('paid')}>결제일 기준</button>
          <button aria-pressed={basis === 'course'} onClick={() => setBasis('course')}>교육일 기준</button>
        </div>
      </div>
      <div className="rev-head">
        <span className="rev-num">{manwon(v.total)}</span>
        <span className="rev-sub">
          {v.people.toLocaleString()}명 · 오늘까지 작년 같은 기간보다{' '}
          <span className={diff >= 0 ? 'up' : 'down'}>{diff >= 0 ? '+' : ''}{Math.round(diff * 100)}%</span>
          {' '}· 작년 전체 {manwon(v.lastTotal)}
        </span>
      </div>
      <p className="muted small" style={{ margin: '4px 0 0' }}>
        {basis === 'paid' ? '실제로 결제된 금액을 결제한 달에 넣었습니다. 결제 전 신청은 빠집니다. VAT 별도.' : '기수가 열린 달에 넣었습니다. 결제 전 신청도 예정 매출로 포함됩니다. VAT 별도.'}
      </p>
      <RevenueChart rows={v.rows} programs={programs} today={today} dimFuture={basis === 'course'} />
      <div className="legend">
        {programs.map((p) => <span key={p.slug}><i style={{ background: p.color }} />{p.short}</span>)}
        {basis === 'course' && <span className="muted">흐린 막대는 아직 열리지 않은 기수(예정)</span>}
      </div>
    </>
  );
}
