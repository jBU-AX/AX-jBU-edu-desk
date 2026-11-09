import Link from 'next/link';
import { addDaysISO, diffDays, md } from '@/lib/dates';
import { cohortEnd } from '@/lib/metrics';
import type { DeskData } from '@/lib/types';

/** 오늘을 중심으로 앞 3주, 뒤 10주 동안 모든 교육의 기수 일정을 한 줄씩 보여 줍니다. */
export default function ScheduleStrip({ data }: { data: DeskData }) {
  const from = addDaysISO(data.today, -21), to = addDaysISO(data.today, 70);
  const span = diffDays(to, from);
  const pos = (d: string) => Math.max(0, Math.min(100, (diffDays(d, from) / span) * 100));
  const weeks: string[] = [];
  for (let d = from; d <= to; d = addDaysISO(d, 14)) weeks.push(d);
  return (
    <div className="lanes">
      <div className="axis" aria-hidden="true">
        <div />
        <div className="axis-track">
          {weeks.map((w) => <span key={w} style={{ left: pos(w) + '%' }}>{md(w)}</span>)}
        </div>
      </div>
      {data.programs.map((p) => {
        const cs = data.cohorts.filter((c) => c.program === p.slug && cohortEnd(p, c) >= from && c.start <= to);
        return (
          <div className="lane" key={p.slug}>
            <div className="lane-name"><i style={{ background: p.color }} />{p.short}</div>
            <div className="lane-track">
              {cs.map((c) => {
                const end = cohortEnd(p, c);
                const left = pos(c.start), right = pos(end);
                const single = c.start === end;
                return (
                  <Link key={c.id} href={`/p/${p.slug}/?c=${c.no}`} className={'bar-c' + (single ? ' pt' : '')}
                    style={{ left: `calc(${left}% - ${single ? 10 : 0}px)`, width: single ? undefined : `max(${right - left}%, 26px)`, background: p.color }}
                    title={`${p.name} ${c.no}기 · ${md(c.start)}${single ? '' : ' ~ ' + md(end)}`}>
                    {single ? '' : `${c.no}기`}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="today-line" style={{ left: `calc(var(--ll) + (100% - var(--ll)) * ${pos(data.today) / 100})` }}>
        <span className="today-tag">오늘</span>
      </div>
    </div>
  );
}
