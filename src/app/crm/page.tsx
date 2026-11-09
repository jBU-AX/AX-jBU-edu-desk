import { getData } from '@/lib/data';
import { companyRows, manwon } from '@/lib/metrics';
import { SCOPE } from '@/lib/scope';
import CrmTable from '@/components/CrmTable';
import DemoNote from '@/components/DemoNote';

export default async function CrmPage() {
  const data = await getData();
  const rows = companyRows(data);
  const years = [2026, 2025, 2024];
  const byYear = Object.fromEntries(years.map((y) => [String(y), companyRows(data, y)]));
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  const people = new Set(data.enrollments.filter((e) => e.status !== '취소').map((e) => e.personId)).size;
  return (
    <main className="sheet" style={{ ['--accent' as string]: '#18212C' }}>
      <DemoNote data={data} />
      <div className="page-h">
        <div>
          <h1>고객·기업 CRM</h1>
          <p>{SCOPE.label} · 기업 {rows.length}곳 · 참여자 {people.toLocaleString()}명 · 결제 합계 {manwon(total)}</p>
        </div>
      </div>
      <CrmTable rows={rows} byYear={byYear} data={{ programs: data.programs, cohorts: data.cohorts, people: data.people, enrollments: data.enrollments }} />
    </main>
  );
}
