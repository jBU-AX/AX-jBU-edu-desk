import type { Program, TaskTemplate } from './types';
import okrTasks from './okr-tasks.json';

// 공개교육별 설정. 운영 규칙이 바뀌면 여기(나중에는 programs 테이블)만 고칩니다.
// 정가·정원은 초안용 예시 값입니다. 실제 값으로 바꿔 주세요.

const oneDay = (prefix: string, extra: TaskTemplate[] = []): TaskTemplate[] => [
  { id: `${prefix}-01`, anchor: 'start', offsetDays: -42, title: '상세페이지 오픈, 모집 공지', category: '모집' },
  { id: `${prefix}-02`, anchor: 'start', offsetDays: -28, title: '지난 기수 참여 기업 CRM 문자 발송', category: '모집' },
  { id: `${prefix}-03`, anchor: 'start', offsetDays: -14, title: '모집 현황 점검 (폐강 마지노선 확인)', category: '모집' },
  { id: `${prefix}-04`, anchor: 'start', offsetDays: -10, title: '사전설문 발송', category: '고객소통' },
  { id: `${prefix}-05`, anchor: 'start', offsetDays: -7, title: '강사별 교재·토크시트 취합 요청', category: '강사소통' },
  { id: `${prefix}-06`, anchor: 'start', offsetDays: -3, title: '교재 발주, 간식 주문', category: '운영' },
  { id: `${prefix}-07`, anchor: 'start', offsetDays: -2, title: '일시·장소·주차 안내 문자', category: '고객소통' },
  { id: `${prefix}-08`, anchor: 'start', offsetDays: -1, title: '이름표·좌석배치도 출력, 자리 세팅', category: '운영' },
  { id: `${prefix}-09`, anchor: 'start', offsetDays: 0, title: '출석 체크, 현장 운영', category: '운영' },
  { id: `${prefix}-10`, anchor: 'start', offsetDays: 1, title: '만족도(NPS) 설문 발송·기록', category: '고객소통' },
  { id: `${prefix}-11`, anchor: 'start', offsetDays: 2, title: '후기 블로깅, 수료증 발송', category: '운영' },
  ...extra
];

export const PROGRAMS: Program[] = [
  {
    slug: 'okr-coach',
    name: 'OKR 코치 자격증',
    short: '오코자',
    color: '#2546B8',
    format: '온라인 필수영상 12개 + 오프라인 2회',
    listPrice: 1500000,
    capacity: 16,
    milestones: [
      { key: 'start', label: '과정 시작', offsetDays: 0 },
      { key: 'o1', label: '1회차', offsetDays: 9 },
      { key: 'o2', label: '2회차', offsetDays: 16 },
      { key: 'end', label: '수료 마감', offsetDays: 25 }
    ],
    requirements: [
      { key: 'video', label: '필수영상', kind: 'count', total: 12, source: '하열사뱅크' },
      { key: 'quiz', label: '퀴즈', kind: 'count', total: 12, source: '구글폼 응답' },
      { key: 'att', label: '출석', kind: 'count', total: 2, source: '직접 체크' },
      { key: 'hw', label: '실습과제', kind: 'count', total: 3, source: '직접 체크' },
      { key: 'test', label: '코칭 TEST', kind: 'score', pass: 80, source: '구글폼 응답' }
    ],
    tasks: okrTasks as TaskTemplate[]
  },
  {
    slug: 'one-on-one',
    name: '원온원코칭 자격증',
    short: '원온원',
    color: '#6A4C9C',
    format: '온라인 영상 + 오프라인 2회 + 실습',
    listPrice: 1500000,
    capacity: 16,
    milestones: [
      { key: 'start', label: '과정 시작', offsetDays: 0 },
      { key: 'o1', label: '1회차', offsetDays: 9 },
      { key: 'o2', label: '2회차', offsetDays: 16 },
      { key: 'end', label: '수료 마감', offsetDays: 25 }
    ],
    requirements: [
      { key: 'video', label: '필수영상', kind: 'count', total: 8, source: '하열사뱅크' },
      { key: 'att', label: '출석', kind: 'count', total: 2, source: '직접 체크' },
      { key: 'practice', label: '실습 대화', kind: 'count', total: 3, source: '원온원 시뮬레이터' },
      { key: 'eval', label: '평가', kind: 'score', pass: 80, source: '구글폼 응답' }
    ],
    tasks: [
      { id: 'one-01', anchor: 'start', offsetDays: -28, title: '모집 시작, 상세페이지 점검', category: '모집' },
      { id: 'one-02', anchor: 'start', offsetDays: -3, title: '단톡방 오픈, 영상 시청 안내', category: '고객소통' },
      { id: 'one-03', anchor: 'o1', offsetDays: -1, title: '1회차 일시·장소 안내', category: '고객소통' },
      { id: 'one-04', anchor: 'o1', offsetDays: 0, title: '1회차 출석 체크', category: '운영' },
      { id: 'one-05', anchor: 'o1', offsetDays: 2, title: '실습 대화 진행 현황 안내', category: '고객소통' },
      { id: 'one-06', anchor: 'o2', offsetDays: 0, title: '2회차 출석, 평가 링크 전달', category: '운영' },
      { id: 'one-07', anchor: 'end', offsetDays: 0, title: '수료 요건 최종 확인', category: '운영' },
      { id: 'one-08', anchor: 'end', offsetDays: 3, title: '자격증 발급', category: '운영' }
    ]
  },
  {
    slug: 'team-leader',
    name: '팀장스쿨',
    short: '팀장스쿨',
    color: '#2F6B4F',
    format: '오프라인 1일 (AM 9:00~PM 5:30)',
    listPrice: 690000,
    capacity: 24,
    milestones: [{ key: 'start', label: '교육일', offsetDays: 0 }],
    requirements: [
      { key: 'survey', label: '사전설문', kind: 'check', source: '구글폼 응답' },
      { key: 'att', label: '출석', kind: 'check', source: '직접 체크' },
      { key: 'nps', label: '만족도', kind: 'check', source: '구글폼 응답' }
    ],
    tasks: oneDay('tl', [
      { id: 'tl-12', anchor: 'start', offsetDays: 4, title: '결제자 대상 다음 한 분 15% 지원 문자', category: 'CRM' }
    ])
  },
  {
    slug: 'office-school',
    name: '직장인학교',
    short: '직장인학교',
    color: '#A86A12',
    format: '오프라인 1일',
    listPrice: 390000,
    capacity: 24,
    milestones: [{ key: 'start', label: '교육일', offsetDays: 0 }],
    requirements: [
      { key: 'survey', label: '사전설문', kind: 'check', source: '구글폼 응답' },
      { key: 'att', label: '출석', kind: 'check', source: '직접 체크' },
      { key: 'goal', label: '데일리 목표카드', kind: 'check', source: '직접 체크' }
    ],
    tasks: oneDay('os', [
      { id: 'os-12', anchor: 'start', offsetDays: 1, title: '학부모 CRM 문자 1차', category: 'CRM' },
      { id: 'os-13', anchor: 'start', offsetDays: 4, title: '학부모 CRM 문자 2차', category: 'CRM' }
    ])
  },
  {
    slug: 'plan-workshop',
    name: '경영계획 실전워크샵',
    short: '경영계획',
    color: '#1C6E80',
    format: '오프라인 워크샵',
    listPrice: 990000,
    capacity: 20,
    milestones: [{ key: 'start', label: '워크샵', offsetDays: 0 }],
    requirements: [
      { key: 'pre', label: '사전과제', kind: 'check', source: '구글폼 응답' },
      { key: 'att', label: '출석', kind: 'check', source: '직접 체크' },
      { key: 'output', label: '경영계획서 제출', kind: 'check', source: '직접 체크' }
    ],
    tasks: oneDay('pw')
  },
  {
    slug: 'founders',
    name: '가인지 파운더스',
    short: '파운더스',
    color: '#9A3B57',
    format: '경영자 네트워킹',
    listPrice: 500000,
    capacity: 30,
    milestones: [{ key: 'start', label: '행사일', offsetDays: 0 }],
    requirements: [
      { key: 'att', label: '참석', kind: 'check', source: '직접 체크' },
      { key: 'follow', label: '후속 미팅', kind: 'check', source: '직접 체크' }
    ],
    tasks: oneDay('fd')
  }
];

export const programBySlug = (slug: string) => PROGRAMS.find((p) => p.slug === slug);
