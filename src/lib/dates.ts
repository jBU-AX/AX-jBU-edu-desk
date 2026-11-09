// 날짜는 모두 한국 시간 기준 'YYYY-MM-DD' 문자열로 다룹니다.
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
export function addDaysISO(s: string, n: number): string {
  return toISO(addDays(fromISO(s), n));
}
export function diffDays(a: string, b: string): number {
  return Math.round((fromISO(a).getTime() - fromISO(b).getTime()) / 864e5);
}
export function mondayOnOrAfter(d: Date): Date {
  const x = addDays(d, 0);
  while (x.getDay() !== 1) x.setDate(x.getDate() + 1);
  return x;
}
export function md(s: string): string {
  const d = fromISO(s);
  return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
}
export function ymd(s: string): string {
  const d = fromISO(s);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
export function seoulToday(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date());
}
export function dday(target: string, today: string): string {
  const n = diffDays(target, today);
  return n === 0 ? 'D-day' : n > 0 ? `D-${n}` : `D+${-n}`;
}
