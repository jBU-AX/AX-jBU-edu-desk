'use client';
import { useMemo, useState } from 'react';
import { md } from '@/lib/dates';
import type { CompanyRow } from '@/lib/metrics';
import type { Cohort, Enrollment, Person, Program } from '@/lib/types';

interface Lite { programs: Program[]; cohorts: Cohort[]; people: Person[]; enrollments: Enrollment[] }
const manwon = (n: number) => Math.round(n / 1e4).toLocaleString('ko-KR') + '만원';
type Sort = 'revenue' | 'last' | 'cohorts';

export default function CrmTable({ rows: allRows, byYear, data }: { rows: CompanyRow[]; byYear: Record<string, CompanyRow[]>; data: Lite }) {
  const [year, setYear] = useState('');
  const rows = year ? byYear[year] : allRows;
  const [q, setQ] = useState('');
  const [prog, setProg] = useState('');
  const [onlyRepeat, setOnlyRepeat] = useState(false);
  const [onlyCross, setOnlyCross] = useState(false);
  const [sort, setSort] = useState<Sort>('revenue');
  const [open, setOpen] = useState<CompanyRow | null>(null);
  const [shown, setShown] = useState(50);
  const P = useMemo(() => new Map(data.programs.map((p) => [p.slug, p])), [data.programs]);

  const list = rows
    .filter((r) => !q || r.company.name.includes(q.trim()) || r.company.industry.includes(q.trim()))
    .filter((r) => !prog || r.programs.includes(prog))
    .filter((r) => !onlyRepeat || r.repeat)
    .filter((r) => !onlyCross || r.cross)
    .sort((a, b) => (sort === 'revenue' ? b.revenue - a.revenue : sort === 'last' ? b.last.localeCompare(a.last) : b.cohorts - a.cohorts));

  return (
    <>
      <div className="filters" role="search">
        <input type="search" placeholder="기업명이나 업종으로 찾기" value={q} onChange={(e) => setQ(e.target.value)} aria-label="기업 찾기" />
        <select value={prog} onChange={(e) => setProg(e.target.value)} aria-label="교육으로 거르기">
          <option value="">모든 교육</option>
          {data.programs.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="결제·등록 연도">
          <option value="">2024~2026년 전체</option>
          {Object.keys(byYear).sort().reverse().map((y) => <option key={y} value={y}>{y}년 결제·등록</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="정렬">
          <option value="revenue">누적 결제 많은 순</option>
          <option value="last">최근 결제·등록 순</option>
          <option value="cohorts">참여 횟수 많은 순</option>
        </select>
        <label><input type="checkbox" checked={onlyRepeat} onChange={(e) => setOnlyRepeat(e.target.checked)} /> 다시 온 기업만</label>
        <label><input type="checkbox" checked={onlyCross} onChange={(e) => setOnlyCross(e.target.checked)} /> 2개 이상 교육만</label>
        <span className="muted small">{list.length}곳</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>기업</th><th>업종 · 규모</th><th>들은 교육</th><th className="num">참여 횟수</th><th className="num">참여자</th><th className="num">누적 결제</th><th>최근 결제·등록</th><th>다음 제안</th></tr></thead>
          <tbody>
            {list.slice(0, shown).map((r) => (
              <tr key={r.company.id} className="clickable" onClick={() => setOpen(r)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(r); }}>
                <td><b>{r.company.name}</b></td>
                <td className="small muted">{r.company.industry} · {r.company.size}</td>
                <td><span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{r.programs.map((s) => <span key={s} className="chip"><i style={{ background: P.get(s)!.color }} />{P.get(s)!.short}</span>)}</span></td>
                <td className="num">{r.cohorts}회</td>
                <td className="num">{r.people}명</td>
                <td className="num"><b>{manwon(r.revenue)}</b></td>
                <td className="small">{r.last.slice(0, 7).replace('-', '.')}</td>
                <td>{r.suggest ? <span className="chip"><i style={{ background: P.get(r.suggest)!.color }} />{P.get(r.suggest)!.short}</span> : <span className="muted">–</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length > shown && <button className="linkbtn" onClick={() => setShown(shown + 100)}>{Math.min(100, list.length - shown)}곳 더 보기 (남은 {list.length - shown}곳)</button>}
      {list.length === 0 && <p className="empty">조건에 맞는 기업이 없습니다. 거르기 조건을 줄여 보세요.</p>}
      {open && <CompanyDrawer row={open} data={data} P={P} onClose={() => setOpen(null)} />}
    </>
  );
}

function CompanyDrawer({ row, data, P, onClose }: { row: CompanyRow; data: Lite; P: Map<string, Program>; onClose: () => void }) {
  const es = data.enrollments.filter((e) => e.companyId === row.company.id);
  const byCohort = new Map(data.cohorts.map((c) => [c.id, c]));
  const byPerson = new Map(data.people.map((x) => [x.id, x]));
  const groups = [...new Set(es.map((e) => e.cohortId))]
    .map((id) => byCohort.get(id)!)
    .sort((a, b) => b.start.localeCompare(a.start));
  return (
    <>
      <div className="drawer-back" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={row.company.name + ' 상세'}>
        <button className="close" onClick={onClose} aria-label="닫기">×</button>
        <h2>{row.company.name}</h2>
        <dl className="kv">
          <dt>업종</dt><dd>{row.company.industry}</dd>
          <dt>규모 · 지역</dt><dd>{row.company.size} · {row.company.region}</dd>
          <dt>첫 결제·등록</dt><dd>{row.first.replace(/-/g, '.')}</dd>
          <dt>누적 결제</dt><dd><b>{manwon(row.revenue)}</b> ({row.cohorts}회, {row.people}명)</dd>
        </dl>
        {row.suggest && <p className="suggest">{P.get(row.suggest)!.name}을(를) 아직 듣지 않았습니다. 다음 기수 안내 대상으로 볼 만합니다.</p>}
        <h3 style={{ fontSize: 15, margin: '22px 0 12px' }}>참여 이력</h3>
        <ul className="hist">
          {groups.map((c) => {
            const p = P.get(c.program)!;
            const ppl = es.filter((e) => e.cohortId === c.id);
            return (
              <li key={c.id} style={{ ['--c' as string]: p.color }}>
                <div><b>{p.name} {c.no}기</b> <span className="when">{c.start.slice(0, 4)}. {md(c.start)}</span></div>
                <div className="small">{ppl.map((e) => { const x = byPerson.get(e.personId)!; return `${x.name} ${x.title}${e.status === '수료' ? '' : ` (${e.status})`}`; }).join(', ')}</div>
                <div className="small muted">{manwon(ppl.reduce((s, e) => s + e.price, 0))} · {ppl[0].paidAt ? `${ppl[0].paidAt.replace(/-/g, '.')} 결제` : `${ppl[0].registeredAt.replace(/-/g, '.')} 등록, 결제 전`} · {ppl[0].channel}</div>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
