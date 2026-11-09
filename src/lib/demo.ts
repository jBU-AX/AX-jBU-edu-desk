// 초안 확인용 예시 데이터. 실제 기업·사람이 아닙니다. Supabase를 연결하면 쓰지 않습니다.
import { PROGRAMS } from './programs';
import { addDays, toISO, mondayOnOrAfter, fromISO } from './dates';
import type { Cohort, Company, DeskData, DocumentRow, Enrollment, EnrollmentStatus, Person, TaskDone } from './types';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREFIX = ['한빛', '새온', '다온', '푸른', '온누리', '세움', '바른', '늘봄', '이음', '가람', '한결', '미래', '정우', '대성', '태림', '서한', '도담', '해솔', '누리', '청운', '우린', '모아', '하늘', '단비', '로운', '시온', '어울', '라온', '빛길', '참솔'];
const SUFFIX: [string, string][] = [
  ['정밀', '제조'], ['푸드', '식품'], ['메디컬', '의료'], ['치과', '의료'], ['테크', 'IT'], ['소프트', 'IT'], ['물산', '유통'], ['로지스', '물류'],
  ['건설', '건설'], ['디자인', '서비스'], ['세무회계', '전문서비스'], ['에듀', '교육'], ['바이오', '제약·바이오'], ['코스메틱', '뷰티'], ['인테리어', '건설']
];
const REGION = ['서울', '서울', '서울', '경기', '경기', '인천', '대전', '부산', '대구', '충남'];
const SIZE = ['10명 미만', '10~30명', '30~50명', '50~100명', '100명 이상'];
const SUR = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const GIVEN = ['민준', '서연', '도윤', '하은', '시우', '지민', '예준', '수아', '주원', '지우', '하준', '서윤', '은우', '채원', '현우', '다인', '건우', '유나', '우진', '소율', '선호', '가은', '태윤', '나연', '정훈', '미래', '성민', '보람', '재희', '하린'];
const TITLE_BY_PROGRAM: Record<string, string[]> = {
  'okr-coach': ['팀장', '차장', '부장', '실장', '이사', '본부장'],
  'one-on-one': ['팀장', '차장', '부장', '실장'],
  'team-leader': ['팀장', '파트장', '과장', '차장', '예비 팀장'],
  'office-school': ['사원', '주임', '대리', '사원', '신입'],
  'plan-workshop': ['대표', '대표', '이사', '본부장'],
  founders: ['대표', '대표', '공동대표']
};
const CHANNEL = ['캠퍼스 검색 CRM 문자', '지난 기수 참여 기업', '경영벙커 유튜브', '대표 추천', '가인지캠퍼스 배너', '영업 리퍼럴', '재참여'];

/** 프로그램별 기수 일정 (no, 시작일) — 예시 */
function schedule(slug: string): { no: number; start: string }[] {
  const out: { no: number; start: string }[] = [];
  const push = (no: number, d: Date) => out.push({ no, start: toISO(d) });
  if (slug === 'okr-coach') {
    // 37기 = 2026-10-26, 36기 = 2026-07-06 실제 일정 기준으로 앞뒤를 예시로 채움
    let d = new Date(2026, 9, 26), no = 37;
    while (d >= new Date(2024, 0, 1)) { push(no, d); d = addDays(d, -112); no--; }
    push(38, new Date(2027, 0, 25));
  } else if (slug === 'one-on-one') {
    let d = new Date(2026, 8, 7), no = 8;
    while (d >= new Date(2025, 0, 1)) { push(no, mondayOnOrAfter(d)); d = addDays(d, -84); no--; }
    push(9, new Date(2026, 11, 7));
  } else if (slug === 'team-leader') {
    let d = new Date(2026, 11, 2), no = 26;
    while (d >= new Date(2024, 0, 1)) { push(no, d); d = addDays(d, -63); no--; }
  } else if (slug === 'office-school') {
    let d = new Date(2026, 11, 9), no = 119;
    while (d >= new Date(2024, 0, 10)) { push(no, d); d = addDays(d, -30); no--; }
  } else if (slug === 'plan-workshop') {
    push(1, new Date(2024, 10, 21)); push(2, new Date(2025, 10, 20)); push(3, new Date(2026, 10, 26));
  } else if (slug === 'founders') {
    push(1, new Date(2026, 4, 22)); push(2, new Date(2026, 9, 23));
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function buildDemo(today: string): DeskData {
  const r = rng(20261109);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];

  const companies: Company[] = [];
  const used = new Set<string>();
  while (companies.length < 420) {
    const [suf, industry] = pick(SUFFIX);
    const name = (r() < 0.25 ? pick(['서울', '경기', '대한', '한국', '동방', '신한']) : '') + pick(PREFIX) + suf;
    if (used.has(name)) continue;
    used.add(name);
    companies.push({ id: 'c' + companies.length, name, industry, size: pick(SIZE), region: pick(REGION) });
  }

  const people: Person[] = [];
  const cohorts: Cohort[] = [];
  const enrollments: Enrollment[] = [];
  const tasksDone: TaskDone[] = [];
  const loyal = companies.slice(0, 30); // 여러 번 오는 기업

  for (const p of PROGRAMS) {
    for (const s of schedule(p.slug)) {
      const c: Cohort = { id: `${p.slug}-${s.no}`, program: p.slug, no: s.no, start: s.start, capacity: p.capacity };
      cohorts.push(c);
      const daysToStart = (Date.parse(s.start) - Date.parse(today)) / 864e5;
      const fill = daysToStart > 45 ? 0.15 : daysToStart > 14 ? 0.55 : 0.7 + r() * 0.3;
      const n = Math.max(3, Math.round(p.capacity * fill));
      let seat = 0;
      while (seat < n) {
        const comp = r() < 0.18 ? pick(loyal) : pick(companies);
        const group = p.slug === 'office-school' || p.slug === 'team-leader' ? 1 + Math.floor(r() * 3) : 1;
        for (let g = 0; g < group && seat < n; g++, seat++) {
          const person: Person = {
            id: 'u' + people.length,
            name: pick(SUR) + pick(GIVEN),
            companyId: comp.id,
            title: pick(TITLE_BY_PROGRAM[p.slug]),
            phone: '010-0000-' + String(people.length).padStart(4, '0')
          };
          people.push(person);
          const ended = daysToStart < -(p.milestones[p.milestones.length - 1].offsetDays + 1);
          const running = !ended && daysToStart <= 0;
          const roll = r();
          const status: EnrollmentStatus = ended ? (roll < 0.05 ? '취소' : roll < 0.15 ? '미수료' : '수료') : running ? '진행' : '신청';
          const disc = r() < 0.18 ? 0.85 : r() < 0.1 ? 0.9 : 1;
          enrollments.push({
            id: 'e' + enrollments.length,
            cohortId: c.id,
            personId: person.id,
            companyId: comp.id,
            price: status === '취소' ? 0 : Math.round((p.listPrice * disc) / 1000) * 1000,
            paidAt: toISO(addDays(fromISO(s.start), -Math.floor(7 + r() * 35))),
            payer: r() < 0.8 ? '회사' : '개인',
            channel: pick(CHANNEL),
            status,
            progress: progressFor(p.slug, status, daysToStart, r)
          });
        }
      }
      // 지난 기수 할 일은 대부분 완료
      for (const t of p.tasks) {
        const anchor = p.milestones.find((m) => m.key === t.anchor)?.offsetDays ?? 0;
        const due = addDays(fromISO(s.start), anchor + t.offsetDays);
        if (toISO(due) < today && r() < 0.93) tasksDone.push({ cohortId: c.id, taskId: t.id, doneAt: toISO(due) });
      }
    }
  }

  return { programs: PROGRAMS, cohorts, companies, people, enrollments, tasksDone, documents: demoDocuments(cohorts, r), today, source: 'demo' };
}

function progressFor(slug: string, status: EnrollmentStatus, daysToStart: number, r: () => number): Record<string, number | boolean> {
  const done = status === '수료';
  const prog = PROGRAMS.find((p) => p.slug === slug)!;
  const out: Record<string, number | boolean> = {};
  const elapsed = Math.max(0, -daysToStart);
  for (const q of prog.requirements) {
    if (status === '신청') { out[q.key] = q.kind === 'check' ? (q.key === 'survey' || q.key === 'pre' ? r() < 0.4 : false) : 0; continue; }
    if (q.kind === 'check') out[q.key] = done ? true : status === '진행' ? r() < 0.7 : r() < 0.5;
    else if (q.kind === 'count') {
      const total = q.total ?? 1;
      if (done) out[q.key] = total;
      else if (q.key === 'att') out[q.key] = elapsed >= 16 ? 2 : elapsed >= 9 ? (r() < 0.9 ? 1 : 0) : 0;
      else out[q.key] = Math.min(total, Math.floor(total * Math.min(1, elapsed / 22 + r() * 0.35)));
    } else out[q.key] = done ? 80 + Math.floor(r() * 21) : status === '진행' && elapsed > 16 ? (r() < 0.5 ? 60 + Math.floor(r() * 40) : 0) : 0;
  }
  return out;
}

function demoDocuments(cohorts: Cohort[], r: () => number): DocumentRow[] {
  const kinds: [DocumentRow['kind'], string[]][] = [
    ['슬라이드', ['마스터파일', '강의 교재', '오프닝 장표']],
    ['시트', ['참여자 명단', '학습 현황', '좌석배치도', 'NPS 기록']],
    ['폼 응답', ['사전설문 응답', '만족도 조사 응답']],
    ['문서', ['운영 체크리스트', '강사 안내문', '결과 리포트', '후기 블로그 원고']],
    ['PDF', ['수료증', '교재 인쇄본']]
  ];
  const docs: DocumentRow[] = [];
  const prog = (slug: string) => PROGRAMS.find((p) => p.slug === slug)!;
  for (const c of cohorts) {
    const p = prog(c.program);
    for (const [kind, names] of kinds) {
      if (r() < 0.35) continue;
      const title = `${p.name}_${c.no}기_${names[Math.floor(r() * names.length)]}`;
      const chars = kind === '슬라이드' ? 8000 + Math.floor(r() * 40000) : kind === '시트' ? 2000 + Math.floor(r() * 15000) : kind === 'PDF' ? 1500 + Math.floor(r() * 20000) : 1500 + Math.floor(r() * 9000);
      docs.push({
        id: 'd' + docs.length, program: p.slug, year: Number(c.start.slice(0, 4)), title, kind,
        driveUrl: '#', chars, excerpt: `${p.name} ${c.no}기 ${kind} 예시 자료입니다.`, updatedAt: c.start
      });
    }
  }
  for (const [y, t, k] of [[2024, '연간 공개교육 일정 세팅', '시트'], [2025, '공개교육 모집 실행안', '문서'], [2026, '공개교육 원칙 포스터 기획', '문서'], [2026, '공개교육 제안서', '문서']] as const) {
    docs.push({ id: 'd' + docs.length, program: 'common', year: y, title: t, kind: k, driveUrl: '#', chars: 6000, excerpt: '공개교육 공통 자료 예시입니다.', updatedAt: `${y}-06-01` });
  }
  return docs;
}
