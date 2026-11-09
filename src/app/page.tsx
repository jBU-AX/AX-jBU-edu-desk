import Link from 'next/link';
import { getData } from '@/lib/data';
import { companyRows, manwon, monthlyRevenue, pct, programSummary, revenueByYear, taskBoard } from '@/lib/metrics';
import { toView } from '@/lib/views';
import { ymd } from '@/lib/dates';
import RevenuePanel from '@/components/RevenuePanel';
import { SCOPE, type RevenueBasis } from '@/lib/scope';
import ScheduleStrip from '@/components/ScheduleStrip';
import TaskBoard from '@/components/TaskBoard';
import DemoNote from '@/components/DemoNote';

export default async function Overview() {
  const data = await getData();
  const year = Number(data.today.slice(0, 4));
  const md = data.today.slice(5);
  const view = (basis: RevenueBasis) => ({
    ...revenueByYear(data, year, basis),
    sameThis: revenueByYear(data, year, basis, md).total,
    sameLast: revenueByYear(data, year - 1, basis, md).total,
    lastTotal: revenueByYear(data, year - 1, basis).total,
    rows: monthlyRevenue(data, year, basis)
  });
  const views = { paid: view('paid'), course: view('course') };
  const board = taskBoard(data);
  const crm = companyRows(data);
  const repeat = crm.filter((c) => c.repeat);
  const cross = crm.filter((c) => c.cross);
  const suggest = crm.filter((c) => c.suggest && c.last >= `${year - 1}-01-01`).slice(0, 6);

  return (
    <main className="sheet" style={{ ['--accent' as string]: '#18212C' }}>
      <DemoNote data={data} />
      <div className="page-h">
        <div>
          <h1>공개교육 전체</h1>
          <p>{ymd(data.today)} 기준 · 교육 {data.programs.length}개 · {SCOPE.label}</p>
        </div>
      </div>

      <div className="grid g-main">
        <section className="sec" aria-labelledby="rev-h">
          <RevenuePanel year={year} today={data.today} programs={data.programs} views={views} />

          <div className="sec-h" style={{ marginTop: 36 }}><h2 id="sch-h">기수 일정</h2><span className="aside">막대를 누르면 그 기수 화면으로 갑니다</span></div>
          <ScheduleStrip data={data} />
        </section>

        <section className="sec" aria-labelledby="task-h">
          <div className="sec-h"><h2 id="task-h">챙길 일</h2><span className="aside">매일 AM 9:00 구글챗으로도 보냅니다</span></div>
          <TaskBoard groups={[
            { title: '밀린 일', late: true, items: board.overdue.map(toView) },
            { title: '오늘', items: board.today.map(toView) },
            { title: '7일 안', items: board.upcoming.map(toView) }
          ]} />
        </section>
      </div>


      <hr className="rule" />

      <section className="sec" aria-labelledby="prog-h">
        <div className="sec-h"><h2 id="prog-h">교육별 {year}년 현황</h2><span className="aside">{year}년에 열린 기수 기준</span></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>교육</th><th className="num">기수</th><th className="num">참여 인원</th><th className="num">정원 대비</th><th className="num">수료율</th><th className="num">1인 평균</th><th className="num">매출</th></tr></thead>
            <tbody>
              {data.programs.map((p) => {
                const s = programSummary(data, p.slug, year);
                return (
                  <tr key={p.slug}>
                    <td><Link className="pname" href={`/p/${p.slug}/`}><i style={{ background: p.color }} />{p.name}</Link></td>
                    <td className="num">{s.cohorts}</td>
                    <td className="num">{s.people.toLocaleString()}명</td>
                    <td className="num">{pct(s.fillRate)}</td>
                    <td className="num">{s.completionRate == null ? '–' : pct(s.completionRate)}</td>
                    <td className="num">{manwon(s.avgPrice)}</td>
                    <td className="num"><b>{manwon(s.revenue)}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="rule" />

      <section className="sec" aria-labelledby="crm-h">
        <div className="sec-h"><h2 id="crm-h">고객·기업</h2><Link className="aside" href="/crm/">CRM 전체 보기</Link></div>
        <div className="split3">
          <div>
            <div className="muted small">다시 온 기업</div>
            <div className="big-k">{repeat.length}곳 <span className="muted small" style={{ fontWeight: 400 }}>/ 참여 기업 {crm.length}곳 ({pct(repeat.length / Math.max(1, crm.length))})</span></div>
            <ul className="mini">
              {repeat.slice(0, 5).map((c) => <li key={c.company.id}><span>{c.company.name}</span><span className="muted">{c.cohorts}회 · {manwon(c.revenue)}</span></li>)}
            </ul>
          </div>
          <div>
            <div className="muted small">두 가지 이상 교육을 들은 기업</div>
            <div className="big-k">{cross.length}곳</div>
            <ul className="mini">
              {cross.slice(0, 5).map((c) => (
                <li key={c.company.id}><span>{c.company.name}</span>
                  <span style={{ display: 'flex', gap: 4 }}>{c.programs.map((s) => { const p = data.programs.find((x) => x.slug === s)!; return <i key={s} title={p.name} style={{ width: 9, height: 9, borderRadius: 2, background: p.color, display: 'inline-block', alignSelf: 'center' }} />; })}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="muted small">다음 교육을 권해 볼 기업</div>
            <ul className="mini" style={{ marginTop: 6 }}>
              {suggest.map((c) => { const p = data.programs.find((x) => x.slug === c.suggest)!; return <li key={c.company.id}><span>{c.company.name}</span><span className="chip"><i style={{ background: p.color }} />{p.short}</span></li>; })}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
