// 화면에 필요한 계산을 한곳에 모읍니다. 데이터 출처(예시/Supabase)와 상관없이 같은 결과를 냅니다.
import { addDaysISO, diffDays } from './dates';
import type { Cohort, Company, DeskData, Enrollment, Program, TaskTemplate } from './types';

export type CohortPhase = '모집' | '진행' | '종료';

export function program(data: DeskData, slug: string): Program {
  const p = data.programs.find((x) => x.slug === slug);
  if (!p) throw new Error('없는 교육: ' + slug);
  return p;
}

export function milestoneDates(p: Program, c: Cohort) {
  return p.milestones.map((m) => ({ ...m, date: addDaysISO(c.start, m.offsetDays) }));
}

export function cohortEnd(p: Program, c: Cohort) {
  return addDaysISO(c.start, Math.max(...p.milestones.map((m) => m.offsetDays)));
}

export function phase(p: Program, c: Cohort, today: string): CohortPhase {
  if (today < c.start) return '모집';
  if (today <= cohortEnd(p, c)) return '진행';
  return '종료';
}

export function cohortLabel(p: Program, c: Cohort) {
  return `${p.short} ${c.no}기`;
}

export const active = (e: Enrollment) => e.status !== '취소';

/* ───────── 매출 ───────── */

export function revenueByYear(data: DeskData, year: number) {
  const byCohort = new Map(data.cohorts.map((c) => [c.id, c]));
  let total = 0, people = 0;
  for (const e of data.enrollments) {
    const c = byCohort.get(e.cohortId)!;
    if (!c.start.startsWith(String(year)) || !active(e)) continue;
    total += e.price; people++;
  }
  return { total, people };
}

/** 월별 매출 (교육 시작일 기준) — [{month:'2026-01', bySlug:{...}, total}] */
export function monthlyRevenue(data: DeskData, year: number) {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const rows = months.map((month) => ({ month, bySlug: {} as Record<string, number>, total: 0 }));
  const byCohort = new Map(data.cohorts.map((c) => [c.id, c]));
  for (const e of data.enrollments) {
    if (!active(e)) continue;
    const c = byCohort.get(e.cohortId)!;
    const idx = months.indexOf(c.start.slice(0, 7));
    if (idx < 0) continue;
    rows[idx].bySlug[c.program] = (rows[idx].bySlug[c.program] || 0) + e.price;
    rows[idx].total += e.price;
  }
  return rows;
}

export function programSummary(data: DeskData, slug: string, year: number) {
  const p = program(data, slug);
  const cohorts = data.cohorts.filter((c) => c.program === slug && c.start.startsWith(String(year)));
  const ids = new Set(cohorts.map((c) => c.id));
  const es = data.enrollments.filter((e) => ids.has(e.cohortId) && active(e));
  const finished = cohorts.filter((c) => phase(p, c, data.today) === '종료');
  const finIds = new Set(finished.map((c) => c.id));
  const finEs = es.filter((e) => finIds.has(e.cohortId));
  const revenue = es.reduce((s, e) => s + e.price, 0);
  const seats = cohorts.reduce((s, c) => s + c.capacity, 0);
  return {
    cohorts: cohorts.length,
    people: es.length,
    revenue,
    avgPrice: es.length ? Math.round(revenue / es.length) : 0,
    fillRate: seats ? es.length / seats : 0,
    completionRate: finEs.length ? finEs.filter((e) => e.status === '수료').length / finEs.length : null
  };
}

/* ───────── 할 일 ───────── */

export interface TaskItem {
  cohort: Cohort;
  program: Program;
  task: TaskTemplate;
  due: string;
  done: boolean;
}

export function tasksFor(data: DeskData, cohort: Cohort): TaskItem[] {
  const p = program(data, cohort.program);
  const done = new Set(data.tasksDone.filter((t) => t.cohortId === cohort.id).map((t) => t.taskId));
  return p.tasks
    .map((task) => {
      const anchor = p.milestones.find((m) => m.key === task.anchor)?.offsetDays ?? 0;
      return { cohort, program: p, task, due: addDaysISO(cohort.start, anchor + task.offsetDays), done: done.has(task.id) };
    })
    .sort((a, b) => a.due.localeCompare(b.due));
}

/** 모든 교육의 오늘 할 일·밀린 일·다가오는 일 */
export function taskBoard(data: DeskData, slug?: string) {
  const today = data.today;
  const all = data.cohorts
    .filter((c) => !slug || c.program === slug)
    .filter((c) => {
      const p = program(data, c.program);
      return diffDays(c.start, today) <= 60 && diffDays(addDaysISO(cohortEnd(p, c), 14), today) >= 0;
    })
    .flatMap((c) => tasksFor(data, c));
  return {
    today: all.filter((t) => t.due === today),
    overdue: all.filter((t) => !t.done && t.due < today && diffDays(today, t.due) <= 14),
    upcoming: all.filter((t) => !t.done && t.due > today && diffDays(t.due, today) <= 7)
  };
}

/* ───────── 참여자 진도 ───────── */

export function requirementMet(p: Program, e: Enrollment, key: string) {
  const q = p.requirements.find((x) => x.key === key)!;
  const v = e.progress[key];
  if (q.kind === 'check') return v === true;
  if (q.kind === 'count') return Number(v || 0) >= (q.total ?? 1);
  return Number(v || 0) >= (q.pass ?? 0);
}

export function progressPct(p: Program, e: Enrollment) {
  const parts = p.requirements.map((q) => {
    const v = e.progress[q.key];
    if (q.kind === 'check') return v === true ? 1 : 0;
    if (q.kind === 'count') return Math.min(1, Number(v || 0) / (q.total ?? 1));
    return Number(v || 0) >= (q.pass ?? 0) ? 1 : 0;
  });
  return Math.round((parts.reduce((s, x) => s + x, 0) / parts.length) * 100);
}

/* ───────── CRM ───────── */

export interface CompanyRow {
  company: Company;
  people: number;
  enrollments: number;
  revenue: number;
  programs: string[];
  cohorts: number;
  first: string;
  last: string;
  repeat: boolean;
  cross: boolean;
  suggest: string | null;
}

/** 이 교육을 들은 기업에 다음으로 권할 만한 교육 (단순 규칙, 초안) */
const NEXT: Record<string, string[]> = {
  'office-school': ['team-leader'],
  'team-leader': ['office-school', 'okr-coach'],
  'okr-coach': ['one-on-one', 'plan-workshop'],
  'one-on-one': ['okr-coach'],
  'plan-workshop': ['okr-coach', 'team-leader'],
  founders: ['plan-workshop']
};

export function companyRows(data: DeskData): CompanyRow[] {
  const byCohort = new Map(data.cohorts.map((c) => [c.id, c]));
  const map = new Map<string, Enrollment[]>();
  for (const e of data.enrollments) {
    if (!active(e)) continue;
    if (!map.has(e.companyId)) map.set(e.companyId, []);
    map.get(e.companyId)!.push(e);
  }
  return data.companies
    .filter((c) => map.has(c.id))
    .map((company) => {
      const es = map.get(company.id)!;
      const cs = [...new Set(es.map((e) => e.cohortId))].map((id) => byCohort.get(id)!);
      const programs = [...new Set(cs.map((c) => c.program))];
      const dates = cs.map((c) => c.start).sort();
      const suggest = programs.flatMap((s) => NEXT[s] || []).find((s) => !programs.includes(s)) || null;
      return {
        company,
        people: new Set(es.map((e) => e.personId)).size,
        enrollments: es.length,
        revenue: es.reduce((s, e) => s + e.price, 0),
        programs,
        cohorts: cs.length,
        first: dates[0],
        last: dates[dates.length - 1],
        repeat: cs.length >= 2,
        cross: programs.length >= 2,
        suggest
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export const won = (n: number) => n.toLocaleString('ko-KR') + '원';
export const manwon = (n: number) => (n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '억' : Math.round(n / 1e4).toLocaleString('ko-KR') + '만') + '원';
export const pct = (x: number) => Math.round(x * 100) + '%';
