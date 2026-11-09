'use client';
import { useState } from 'react';
import Link from 'next/link';
import { md } from '@/lib/dates';

export interface TaskView { key: string; title: string; due: string; programName: string; programSlug: string; color: string; cohortNo: number; done: boolean }

/** 할 일 묶음. 초안에서는 체크가 이 브라우저 화면에만 반영됩니다 (Supabase 연결 후 저장). */
export default function TaskBoard({ groups, showProgram = true }: { groups: { title: string; late?: boolean; folded?: boolean; items: TaskView[] }[]; showProgram?: boolean }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [more, setMore] = useState<Record<string, boolean>>({});
  const LIMIT = 6;
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  if (!total) return <p className="empty">2주 안에 챙길 일이 없습니다.</p>;
  return (
    <div>
      {groups.filter((g) => g.items.length).map((g) => (
        <div key={g.title}>
          <div className={'tgroup' + (g.late ? ' late' : '')}>{g.title} {g.items.length}</div>
          <ul className="tasks">
            {(more[g.title] ? g.items : g.items.slice(0, g.folded ? 0 : LIMIT)).map((t) => {
              const on = done[t.key] ?? t.done;
              return (
                <li key={t.key} className={on ? 'done' : ''}>
                  <input type="checkbox" checked={on} onChange={() => setDone({ ...done, [t.key]: !on })} aria-label={t.title + ' 완료'} style={{ accentColor: t.color }} />
                  <div>
                    <div className="t">{t.title}</div>
                    <div className="m">
                      {showProgram && <Link href={`/p/${t.programSlug}/?c=${t.cohortNo}`} className="chip" style={{ textDecoration: 'none' }}><i style={{ background: t.color }} />{t.programName} {t.cohortNo}기</Link>}
                      <span>{md(t.due)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {g.items.length > (g.folded ? 0 : LIMIT) && !more[g.title] && (
            <button className="linkbtn" onClick={() => setMore({ ...more, [g.title]: true })}>{g.folded ? `${g.items.length}개 보기` : `${g.items.length - LIMIT}개 더 보기`}</button>
          )}
        </div>
      ))}
    </div>
  );
}
