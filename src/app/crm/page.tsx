import { getData } from '@/lib/data';
import { companyRows, manwon } from '@/lib/metrics';
import CrmTable from '@/components/CrmTable';
import DemoNote from '@/components/DemoNote';

export default async function CrmPage() {
  const data = await getData();
  const rows = companyRows(data);
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  const people = new Set(data.enrollments.filter((e) => e.status !== '취소').map((e) => e.personId)).size;
  return (
    <main className="sheet" style={{ ['--accent' as string]: '#18212C' }}>
      <DemoNote data={data} />
      <div className="page-h">
        <div>
          <h1>고객·기업 CRM</h1>
          <p>공개교육을 들은 기업 {rows.length}곳 · 참여자 {people.toLocaleString()}명 · 누적 결제 {manwon(total)}</p>
        </div>
      </div>
      <CrmTable rows={rows} data={{ programs: data.programs, cohorts: data.cohorts, people: data.people, enrollments: data.enrollments }} />
    </main>
  );
}
