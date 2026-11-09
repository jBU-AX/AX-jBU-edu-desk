# AX-jBU-edu-desk

jBU 공개교육 전체를 한 곳에서 관리하는 운영 데스크 초안입니다.

- **전체 탭**: 올해 공개교육 매출(월별·교육별), 모든 교육의 챙길 일, 기수 일정, 다시 온 기업·교차 참여 기업
- **교육 탭** (OKR 코치 자격증, 원온원코칭 자격증, 팀장스쿨, 직장인학교, 경영계획 실전워크샵, 가인지 파운더스): 기수 선택, 기수 일정, 참여자별 수료 요건 진도, 기수 할 일, 최근 기수 추이
- **고객·기업 CRM**: 공개교육을 들은 모든 기업과 참여 이력, 누적 결제, 다음에 권할 교육
- **자료함**: 구글 드라이브의 공개교육 텍스트 자료 검색

지금은 예시 데이터로 열립니다. 기업·사람·금액은 모두 가상입니다.

## 구조

| 위치 | 하는 일 |
| --- | --- |
| `src/lib/programs.ts` | 교육별 설정: 기준일 계산 규칙, 수료 요건, 할 일 템플릿, 정가·정원(예시 값) |
| `src/lib/metrics.ts` | 매출, 할 일, 진도, CRM 계산 |
| `src/lib/data.ts` | 데이터 출처. Supabase 환경변수가 있으면 Supabase, 없으면 예시 데이터 |
| `src/lib/demo.ts` | 예시 데이터 생성 |
| `src/app/` | 화면 (전체, `/p/[교육]`, `/crm`, `/library`) |
| `supabase/migrations/0001_init.sql` | DB 테이블, 집계 뷰, 회사 계정 권한 |
| `docs/ARCHITECTURE.md` | DB 선택 이유, 용량 추정, 단계별 계획 |

새 공개교육을 추가할 때는 `programs.ts`(나중에는 `programs` 테이블)에 한 덩어리만 추가하면 탭, 일정, 요건, 할 일이 같이 생깁니다.

## 로컬에서 보기

```bash
cd ~/Documents/AX-jBU-edu-desk
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 배포 (GitHub → Vercel)

```bash
cd ~/Documents/AX-jBU-edu-desk
git remote add origin https://github.com/gainge-consulting-group/AX-jBU-edu-desk.git
git push -u origin main
```

Vercel(gaingecampusai 계정)에서 저장소를 import 하면 Next.js로 자동 인식됩니다. 환경변수를 넣지 않으면 예시 데이터로 배포됩니다.

## Supabase 연결

1. Supabase에서 프로젝트를 만들고 SQL Editor에서 `supabase/migrations/0001_init.sql`을 실행합니다.
2. Vercel 환경변수에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 넣습니다. 서비스 키는 서버에서만 쓰이고 브라우저로 나가지 않습니다.
3. 로그인(회사 Google 계정만 허용)은 다음 단계에서 붙입니다. 붙이기 전에는 배포 주소를 외부에 공유하지 마세요.

## 확인

```bash
cd ~/Documents/AX-jBU-edu-desk
npm run typecheck
npm run build
```
