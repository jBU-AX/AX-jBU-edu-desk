-- jBU 공개교육 데스크 초기 스키마 (Supabase / Postgres 15)
-- 화면 코드의 src/lib/types.ts 와 같은 모양입니다.

create extension if not exists pg_trgm;

-- ───────── 교육 과정 ─────────
-- 교육마다 다른 운영 규칙(기준일, 수료 요건, 할 일 템플릿)은 jsonb 설정으로 둡니다.
-- 새 공개교육이 생겨도 테이블을 바꾸지 않고 행 하나만 추가하면 됩니다.
create table programs (
  slug         text primary key,
  name         text not null,
  short        text not null,
  color        text not null default '#18212C',
  format       text,
  list_price   integer not null default 0,         -- 1인 정가, 원, VAT 별도
  capacity     integer not null default 20,
  milestones   jsonb not null default '[{"key":"start","label":"교육일","offsetDays":0}]',
  requirements jsonb not null default '[]',
  tasks        jsonb not null default '[]',
  drive_folder text,                                -- 구글 드라이브 폴더 id
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table cohorts (
  id          text primary key,                     -- 예: 'okr-coach-37'
  program     text not null references programs(slug) on update cascade,
  no          integer not null,
  start_date  date not null,                        -- milestones 'start' 기준일
  capacity    integer not null,
  note        text,
  created_at  timestamptz not null default now(),
  unique (program, no)
);
create index cohorts_start_idx on cohorts (start_date);

-- ───────── CRM ─────────
create table companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  biz_no     text unique,                           -- 사업자번호(있으면 같은 회사 판별에 사용)
  industry   text,
  size       text,
  region     text,
  memo       text,
  created_at timestamptz not null default now()
);
create index companies_name_trgm on companies using gin (name gin_trgm_ops);

create table people (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company_id uuid references companies(id) on delete set null,
  title      text,
  phone      text,
  email      text,
  memo       text,
  created_at timestamptz not null default now(),
  unique (name, phone)                              -- 같은 사람 중복 등록 방지
);
create index people_company_idx on people (company_id);

-- 신청 = 사람 × 기수. 매출과 진도는 여기에 쌓입니다.
create table enrollments (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  text not null references cohorts(id) on delete cascade,
  person_id  uuid not null references people(id),
  company_id uuid references companies(id),         -- 신청 당시 소속 (이직해도 이력 유지)
  price      integer not null default 0,            -- 실제 결제 금액, 원, VAT 별도
  registered_at date not null default current_date, -- 등록(신청)일
  paid_at    date,                                  -- 결제일 (결제 전이면 비움)
  payer      text check (payer in ('회사', '개인')),
  channel    text,                                  -- 신청 경로
  status     text not null default '신청' check (status in ('신청', '진행', '수료', '미수료', '취소')),
  progress   jsonb not null default '{}',           -- 수료 요건별 값 {"video": 7, "att": 1, "test": 85}
  created_at timestamptz not null default now(),
  unique (cohort_id, person_id)
);
create index enrollments_company_idx on enrollments (company_id);
-- 고객을 연도로 나눌 때 쓰는 날짜: 결제일, 결제 전이면 등록일 (데스크 범위는 2024~2026년)
create index enrollments_customer_date_idx on enrollments ((coalesce(paid_at, registered_at)));

create table task_done (
  cohort_id text not null references cohorts(id) on delete cascade,
  task_id   text not null,
  done_at   timestamptz not null default now(),
  done_by   text,
  primary key (cohort_id, task_id)
);

-- ───────── 자료함 (구글 드라이브 텍스트) ─────────
-- 원본 파일은 드라이브에 그대로 두고, 검색과 AI 활용을 위해 텍스트만 옮겨 둡니다.
create table documents (
  id            uuid primary key default gen_random_uuid(),
  drive_file_id text unique not null,
  program       text references programs(slug),     -- 공통 자료는 null
  cohort_id     text references cohorts(id),
  year          integer,
  title         text not null,
  kind          text,                               -- 문서/시트/슬라이드/PDF/폼 응답
  mime_type     text,
  drive_url     text,
  chars         integer,
  excerpt       text,
  content       text,                               -- 추출한 본문
  updated_at    timestamptz,                        -- 드라이브 수정 시각
  synced_at     timestamptz not null default now()
);
create index documents_title_trgm on documents using gin (title gin_trgm_ops);
create index documents_content_trgm on documents using gin (content gin_trgm_ops);
create index documents_program_year on documents (program, year);

-- 나중에 'AI에게 지난 기수 자료로 물어보기'를 붙일 때 사용 (pgvector)
-- create extension if not exists vector;
-- create table document_chunks (
--   id bigserial primary key,
--   document_id uuid references documents(id) on delete cascade,
--   chunk_no int, content text, embedding vector(1536)
-- );

-- ───────── 집계 뷰 ─────────
-- 결제일 기준 월 매출 (실제로 들어온 돈)
create view v_monthly_revenue_paid as
select date_trunc('month', e.paid_at)::date as month, c.program,
       sum(e.price) as revenue, count(*) as people
from enrollments e join cohorts c on c.id = e.cohort_id
where e.status <> '취소' and e.paid_at is not null
group by 1, 2;

-- 교육일 기준 월 매출 (그 달에 열린 기수, 결제 전 신청 포함)
create view v_monthly_revenue_course as
select date_trunc('month', c.start_date)::date as month, c.program,
       sum(e.price) as revenue, count(*) as people
from enrollments e join cohorts c on c.id = e.cohort_id
where e.status <> '취소'
group by 1, 2;

create view v_company_summary as
select co.id, co.name, co.industry,
       count(distinct e.cohort_id) as cohorts,
       count(distinct c.program)   as programs,
       count(distinct e.person_id) as people,
       sum(e.price)                as revenue,
       min(coalesce(e.paid_at, e.registered_at)) as first_date,
       max(coalesce(e.paid_at, e.registered_at)) as last_date
from companies co
join enrollments e on e.company_id = co.id and e.status <> '취소'
join cohorts c on c.id = e.cohort_id
group by co.id;

-- ───────── 권한 ─────────
-- 회사 Google 계정(@gainge.com)으로 로그인한 사람만 읽고 쓸 수 있습니다.
do $$
declare t text;
begin
  foreach t in array array['programs','cohorts','companies','people','enrollments','task_done','documents'] loop
    execute format('alter table %I enable row level security', t);
    execute format($p$create policy staff_all on %I for all to authenticated
                    using ((auth.jwt() ->> 'email') like '%%@gainge.com')
                    with check ((auth.jwt() ->> 'email') like '%%@gainge.com')$p$, t);
  end loop;
end $$;
