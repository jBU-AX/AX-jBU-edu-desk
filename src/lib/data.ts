// 데이터 가져오기. Supabase 환경변수가 있으면 Supabase에서, 없으면 예시 데이터로 엽니다.
import { createClient } from '@supabase/supabase-js';
import { buildDemo } from './demo';
import { seoulToday } from './dates';
import { PROGRAMS } from './programs';
import type { DeskData } from './types';
import { SCOPE, customerDate } from './scope';

let cache: Promise<DeskData> | null = null;

export function getData(): Promise<DeskData> {
  if (!cache) cache = load();
  return cache;
}

async function load(): Promise<DeskData> {
  const today = process.env.DESK_TODAY || seoulToday();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const data = !url || !key ? buildDemo(today) : await fromSupabase(url, key, today);
  // 고객 범위: 결제일(없으면 등록일)이 SCOPE 안에 있는 신청만 다룹니다.
  data.enrollments = data.enrollments.filter((e) => {
    const d = customerDate(e);
    return d >= SCOPE.from && d <= SCOPE.to;
  });
  return data;
}

async function fromSupabase(url: string, key: string, today: string): Promise<DeskData> {
  const db = createClient(url, key, { auth: { persistSession: false } });
  const all = async <T,>(table: string): Promise<T[]> => {
    const { data, error } = await db.from(table).select('*');
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data || []) as T[];
  };
  const [programs, cohorts, companies, people, enrollments, tasksDone, documents] = await Promise.all([
    all<any>('programs'), all<any>('cohorts'), all<any>('companies'), all<any>('people'),
    all<any>('enrollments'), all<any>('task_done'), all<any>('documents')
  ]);
  return {
    programs: programs.length
      ? programs.map((p) => ({ slug: p.slug, name: p.name, short: p.short, color: p.color, format: p.format, listPrice: p.list_price, capacity: p.capacity, milestones: p.milestones, requirements: p.requirements, tasks: p.tasks, driveFolder: p.drive_folder }))
      : PROGRAMS,
    cohorts: cohorts.map((c) => ({ id: c.id, program: c.program, no: c.no, start: c.start_date, capacity: c.capacity, note: c.note })),
    companies: companies.map((c) => ({ id: c.id, name: c.name, industry: c.industry, size: c.size, region: c.region })),
    people: people.map((p) => ({ id: p.id, name: p.name, companyId: p.company_id, title: p.title, phone: p.phone })),
    enrollments: enrollments.map((e) => ({ id: e.id, cohortId: e.cohort_id, personId: e.person_id, companyId: e.company_id, price: e.price, registeredAt: e.registered_at, paidAt: e.paid_at, payer: e.payer, channel: e.channel, status: e.status, progress: e.progress || {} })),
    tasksDone: tasksDone.map((t) => ({ cohortId: t.cohort_id, taskId: t.task_id, doneAt: t.done_at })),
    documents: documents.map((d) => ({ id: d.id, program: d.program, year: d.year, title: d.title, kind: d.kind, driveUrl: d.drive_url, chars: d.chars, excerpt: d.excerpt, updatedAt: d.updated_at })),
    today,
    source: 'supabase'
  };
}
