// 공개교육 통합 데스크의 데이터 모양. supabase/migrations/0001_init.sql 의 테이블과 1:1로 맞춥니다.

export type ProgramSlug = string;

/** 기수 날짜를 계산하는 기준점. 'start' 는 기수마다 입력하는 기준일이고, 나머지는 거기서 며칠 뒤인지로 정합니다. */
export interface Milestone {
  key: string;
  label: string;
  offsetDays: number;
}

/** 수료 요건 한 줄. count 는 n개 중 몇 개, check 는 했다/안 했다, score 는 점수(합격선 있음). */
export interface Requirement {
  key: string;
  label: string;
  kind: 'count' | 'check' | 'score';
  total?: number;
  pass?: number;
  source?: string; // 어디서 채워지는지 (예: '하열사뱅크', '구글폼 응답', '직접 체크')
}

export interface TaskTemplate {
  id: string;
  anchor: string; // Milestone.key
  offsetDays: number;
  title: string;
  category: '모집' | '고객소통' | '강사소통' | '운영' | 'CRM';
}

export interface Program {
  slug: ProgramSlug;
  name: string;
  short: string;
  color: string;
  format: string; // 예: '온라인 영상 + 오프라인 2회'
  listPrice: number; // 1인 정가(원, VAT 별도)
  capacity: number;
  milestones: Milestone[];
  requirements: Requirement[];
  tasks: TaskTemplate[];
  driveFolder?: string;
}

export interface Cohort {
  id: string;
  program: ProgramSlug;
  no: number;
  start: string; // YYYY-MM-DD, Milestone 'start'
  capacity: number;
  note?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string; // 예: '30~50명'
  region: string;
}

export interface Person {
  id: string;
  name: string;
  companyId: string;
  title: string;
  phone: string;
}

export type EnrollmentStatus = '신청' | '진행' | '수료' | '미수료' | '취소';

export interface Enrollment {
  id: string;
  cohortId: string;
  personId: string;
  companyId: string;
  price: number; // 실제 결제 금액(원, VAT 별도)
  registeredAt: string; // 등록(신청)일
  paidAt: string | null; // 결제일. 아직 결제 전이면 null
  payer: '회사' | '개인';
  channel: string; // 신청 경로
  status: EnrollmentStatus;
  progress: Record<string, number | boolean>;
}

export interface TaskDone {
  cohortId: string;
  taskId: string;
  doneAt: string;
}

export interface DocumentRow {
  id: string;
  program: ProgramSlug | 'common';
  year: number;
  title: string;
  kind: '문서' | '시트' | '슬라이드' | 'PDF' | '폼 응답';
  driveUrl: string;
  chars: number;
  excerpt: string;
  updatedAt: string;
}

export interface DeskData {
  programs: Program[];
  cohorts: Cohort[];
  companies: Company[];
  people: Person[];
  enrollments: Enrollment[];
  tasksDone: TaskDone[];
  documents: DocumentRow[];
  today: string;
  source: 'demo' | 'supabase';
}
