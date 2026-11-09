import type { Program } from '@/lib/types';

interface Row { month: string; bySlug: Record<string, number>; total: number }

/** 월별 매출 누적 막대. 막대 색은 교육 탭 색과 같습니다. */
export default function RevenueChart({ rows, programs, today, dimFuture = true }: { rows: Row[]; programs: Program[]; today: string; dimFuture?: boolean }) {
  const W = 720, H = 220, L = 44, B = 24, T = 8;
  const max = Math.max(1, ...rows.map((r) => r.total));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const bw = (W - L) / rows.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const curMonth = today.slice(0, 7);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="월별 공개교육 매출">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="var(--line-soft)" />
          <text x={L - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? '0' : Math.round(t / 1e6) + '백만'}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        let acc = 0;
        const x = L + i * bw + bw * 0.18;
        const w = bw * 0.64;
        const future = dimFuture && r.month > curMonth;
        return (
          <g key={r.month} opacity={future ? 0.45 : 1}>
            {programs.map((p) => {
              const v = r.bySlug[p.slug] || 0;
              if (!v) return null;
              const y1 = y(acc + v), h = y(acc) - y1;
              acc += v;
              return <rect key={p.slug} x={x} y={y1} width={w} height={Math.max(0, h - 1)} fill={p.color} rx={2}><title>{`${r.month} ${p.name} ${Math.round(v / 1e4).toLocaleString()}만원`}</title></rect>;
            })}
            <text x={x + w / 2} y={H - 6} textAnchor="middle" fontWeight={r.month === curMonth ? 700 : 400}>{Number(r.month.slice(5))}월</text>
          </g>
        );
      })}
    </svg>
  );
}

function niceStep(max: number) {
  const raw = max / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
