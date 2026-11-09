'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addDaysISO, dday, md } from '@/lib/dates';
import { manwon, pct, progressPct, requirementMet } from '@/lib/metrics';
import type { Cohort, Company, Enrollment, Person, Program, TaskDone } from '@/lib/types';
import TaskBoard, { type TaskView } from './TaskBoard';

interface Props { program: Program; cohorts: Cohort[]; enrollments: Enrollment[]; people: Person[]; companies: Company[]; tasksDone: TaskDone[]; today: string }

const end = (p: Program, c: Cohort) => addDaysISO(c.start, Math.max(...p.milestones.map((m) => m.offsetDays)));
const phaseOf = (p: Program, c: Cohort, today: string) => (today < c.start ? '모집' : today <= end(p, c) ? '진행' : '종료');

export default function CohortView({ program: p, cohorts, enrollments, people, companies, tasksDone, today }: Props) {
  const params = useSearchParams();
  const sorted = useMemo(() => [...cohorts].sort((a, b) => a.start.localeCompare(b.start)), [cohorts]);
  // 기본으로 보여 줄 기수: 진행 중 → 가장 가까운 모집 중 → 마지막
  const defaultNo = (sorted.find((c) => phaseOf(p, c, today) === '진행') || sorted.find((c) => phaseOf(p, c, today) === '모집') || sorted[sorted.length - 1])?.no;
  const [no, setNo] = useState<number | undefined>(Number(params.get('c')) || defaultNo);
  useEffect(() => { const q = Number(params.get('c')); if (q) setNo(q); }, [params]);
  const idx = sorted.findIndex((c) => c.no === no);
  const cohort = sorted[idx] || sorted[sorted.length - 1];
  const nearby = sorted.slice(Math.max(0, idx - 6), idx + 4);

  const byPerson = new Map(people.map((x) => [x.id, x]));
  const byCompany = new Map(companies.map((x) => [x.id, x]));
  const rows = enrollments.filter((e) => e.cohortId === cohort.id);
  const live = rows.filter((e) => e.status !== '취소');
  const revenue = live.reduce((s, e) => s + e.price, 0);
  const done = new Set(tasksDone.filter((t) => t.cohortId === cohort.id).map((t) => t.taskId));
  const tasks: TaskView[] = p.tasks.map((t) => {
    const off = p.milestones.find((m) => m.key === t.anchor)?.offsetDays ?? 0;
    return { key: cohort.id + ':' + t.id, title: t.title, due: addDaysISO(cohort.start, off + t.offsetDays), programName: p.short, programSlug: p.slug, color: p.color, cohortNo: cohort.no, done: done.has(t.id) };
  }).sort((a, b) => a.due.localeCompare(b.due));
  const ph = phaseOf(p, cohort, today);

  const history = sorted.filter((c) => c.start <= today).slice(-8).reverse().map((c) => {
    const es = enrollments.filter((e) => e.cohortId === c.id && e.status !== '취소');
    const fin = es.filter((e) => e.status === '수료').length;
    return { c, n: es.length, rev: es.reduce((s, e) => s + e.price, 0), comp: phaseOf(p, c, today) === '종료' && es.length ? fin / es.length : null };
  });

  return (
    <>
      <div className="cohort-pick" role="group" aria-label="기수 선택">
        {nearby.map((c) => {
          const cp = phaseOf(p, c, today);
          return (
            <button key={c.id} aria-pressed={c.id === cohort.id} onClick={() => setNo(c.no)}>
              {c.no}기<span className="ph">{cp === '종료' ? md(c.start) : cp === '진행' ? '진행 중' : dday(c.start, today)}</span>
            </button>
          );
        })}
      </div>

      <div className="timeline" aria-label={`${cohort.no}기 일정`}>
        {p.milestones.map((m, i) => {
          const d = addDaysISO(cohort.start, m.offsetDays);
          const next = p.milestones[i + 1] ? addDaysISO(cohort.start, p.milestones[i + 1].offsetDays) : null;
          const now = d <= today && (!next || today < next) && ph !== '종료';
          return (
            <div key={m.key} className={(d < today ? 'past ' : '') + (now ? 'now' : '')}>
              <div className="k">{m.label}</div>
              <div className="v">{md(d)} <span className="muted small" style={{ fontWeight: 400 }}>{dday(d, today)}</span></div>
            </div>
          );
        })}
        <div>
          <div className="k">참여 · 매출</div>
          <div className="v">{live.length}/{cohort.capacity}명 <span className="muted small" style={{ fontWeight: 400 }}>{manwon(revenue)}</span></div>
        </div>
      </div>

      <div className="grid g-main">
        <section className="sec" aria-labelledby="ppl-h">
          <div className="sec-h"><h2 id="ppl-h">참여자 {live.length}명</h2><span className="aside">수료 요건: {p.requirements.map((q) => q.label).join(', ')}</span></div>
          {rows.length === 0 ? <p className="empty">아직 신청자가 없습니다. 신청이 들어오면 여기에 바로 보입니다.</p> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>이름</th><th>기업</th>
                    {p.requirements.map((q) => <th key={q.key} title={q.source}>{q.label}</th>)}
                    <th>진행률</th><th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const person = byPerson.get(e.personId)!, comp = byCompany.get(e.companyId)!;
                    const pp = progressPct(p, e);
                    return (
                      <tr key={e.id}>
                        <td><b>{person.name}</b> <span className="muted small">{person.title}</span></td>
                        <td className="small">{comp.name}</td>
                        {p.requirements.map((q) => {
                          const v = e.progress[q.key];
                          const met = requirementMet(p, e, q.key);
                          const label = q.kind === 'check' ? (v ? '완료' : '–') : q.kind === 'count' ? `${v || 0}/${q.total}` : v ? `${v}점` : '미응시';
                          return <td key={q.key}><span className={'req' + (met ? ' met' : '')}>{label}</span></td>;
                        })}
                        <td className="small" style={{ whiteSpace: 'nowrap' }}><span className="meter"><b style={{ width: pp + '%' }} /></span>{pp}%</td>
                        <td><span className={'status s-' + e.status}>{e.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="sec" aria-labelledby="ct-h">
          <div className="sec-h"><h2 id="ct-h">{cohort.no}기 할 일</h2><span className="aside">{tasks.filter((t) => t.done).length}/{tasks.length} 완료</span></div>
          <TaskBoard key={cohort.id} showProgram={false} groups={[
            { title: '밀린 일', late: true, items: tasks.filter((t) => !t.done && t.due < today) },
            { title: '오늘', items: tasks.filter((t) => t.due === today) },
            { title: '남은 일', items: tasks.filter((t) => !t.done && t.due > today) },
            { title: '끝낸 일', folded: true, items: tasks.filter((t) => t.done && t.due !== today) }
          ]} />
        </section>
      </div>

      <hr className="rule" />
      <section className="sec" aria-labelledby="hist-h">
        <div className="sec-h"><h2 id="hist-h">최근 기수</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>기수</th><th>시작일</th><th className="num">인원</th><th className="num">정원 대비</th><th className="num">수료율</th><th className="num">매출</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.c.id} className="clickable" onClick={() => setNo(h.c.no)}>
                  <td><b>{h.c.no}기</b></td><td>{md(h.c.start)} <span className="muted small">{h.c.start.slice(0, 4)}</span></td>
                  <td className="num">{h.n}명</td><td className="num">{pct(h.n / h.c.capacity)}</td>
                  <td className="num">{h.comp == null ? '진행 중' : pct(h.comp)}</td><td className="num">{manwon(h.rev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
