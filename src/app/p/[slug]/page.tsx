import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getData } from '@/lib/data';
import { PROGRAMS } from '@/lib/programs';
import { programSummary, manwon, pct } from '@/lib/metrics';
import CohortView from '@/components/CohortView';
import DemoNote from '@/components/DemoNote';

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export default async function ProgramPage({ params }: { params: { slug: string } }) {
  const data = await getData();
  const p = data.programs.find((x) => x.slug === params.slug);
  if (!p) notFound();
  const year = Number(data.today.slice(0, 4));
  const s = programSummary(data, p.slug, year);
  const cohorts = data.cohorts.filter((c) => c.program === p.slug);
  const ids = new Set(cohorts.map((c) => c.id));
  const enrollments = data.enrollments.filter((e) => ids.has(e.cohortId));
  const peopleIds = new Set(enrollments.map((e) => e.personId));
  const people = data.people.filter((x) => peopleIds.has(x.id));
  const compIds = new Set(enrollments.map((e) => e.companyId));
  const companies = data.companies.filter((c) => compIds.has(c.id));
  const tasksDone = data.tasksDone.filter((t) => ids.has(t.cohortId));

  return (
    <main className="sheet" style={{ ['--accent' as string]: p.color }}>
      <DemoNote data={data} />
      <div className="page-h">
        <div>
          <h1>{p.name}</h1>
          <p>{p.format} · 정원 {p.capacity}명 · 정가 {manwon(p.listPrice)}</p>
        </div>
      </div>
      <div className="stats">
        <div><div className="k">{year}년 매출</div><div className="v">{manwon(s.revenue)}</div></div>
        <div><div className="k">{year}년 기수</div><div className="v">{s.cohorts}회</div></div>
        <div><div className="k">참여 인원</div><div className="v">{s.people}명</div></div>
        <div><div className="k">정원 대비</div><div className="v">{pct(s.fillRate)}</div></div>
        <div><div className="k">수료율</div><div className="v">{s.completionRate == null ? '–' : pct(s.completionRate)}</div></div>
      </div>
      <Suspense>
        <CohortView program={p} cohorts={cohorts} enrollments={enrollments} people={people} companies={companies} tasksDone={tasksDone} today={data.today} />
      </Suspense>
    </main>
  );
}
