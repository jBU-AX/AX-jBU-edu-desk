'use client';
import { useState } from 'react';
import type { DocumentRow } from '@/lib/types';

interface P { slug: string; name: string; short: string; color: string }

export default function DocLibrary({ docs, programs }: { docs: DocumentRow[]; programs: P[] }) {
  const [q, setQ] = useState('');
  const [prog, setProg] = useState('');
  const [year, setYear] = useState('');
  const [kind, setKind] = useState('');
  const P = new Map(programs.map((p) => [p.slug, p]));
  const years = [...new Set(docs.map((d) => d.year))].sort().reverse();
  const kinds = [...new Set(docs.map((d) => d.kind))];
  const list = docs
    .filter((d) => !q || d.title.includes(q.trim()) || d.excerpt.includes(q.trim()))
    .filter((d) => !prog || d.program === prog)
    .filter((d) => !year || String(d.year) === year)
    .filter((d) => !kind || d.kind === kind)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <div className="filters" role="search">
        <input type="search" placeholder="제목이나 본문으로 찾기" value={q} onChange={(e) => setQ(e.target.value)} aria-label="자료 찾기" />
        <select value={prog} onChange={(e) => setProg(e.target.value)} aria-label="교육">
          <option value="">모든 교육</option>
          {programs.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          <option value="common">공통</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="연도">
          <option value="">모든 연도</option>
          {years.map((y) => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="종류">
          <option value="">모든 종류</option>
          {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <span className="muted small">{list.length.toLocaleString()}건</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>제목</th><th>교육</th><th>종류</th><th className="num">글자 수</th><th>날짜</th></tr></thead>
          <tbody>
            {list.slice(0, 150).map((d) => {
              const p = P.get(d.program);
              return (
                <tr key={d.id}>
                  <td><a href={d.driveUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontWeight: 500 }}>{d.title}</a><div className="small muted">{d.excerpt}</div></td>
                  <td>{p ? <span className="chip"><i style={{ background: p.color }} />{p.short}</span> : <span className="chip">공통</span>}</td>
                  <td className="small">{d.kind}</td>
                  <td className="num small">{d.chars.toLocaleString()}</td>
                  <td className="small">{d.updatedAt.replace(/-/g, '.')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {list.length > 150 && <p className="muted small">앞의 150건만 보입니다. 검색어나 조건으로 좁혀 보세요.</p>}
      {list.length === 0 && <p className="empty">찾는 자료가 없습니다. 다른 검색어로 찾아보세요.</p>}
    </>
  );
}
