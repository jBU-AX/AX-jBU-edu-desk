import type { DeskData } from '@/lib/types';

export default function DemoNote({ data }: { data: DeskData }) {
  if (data.source !== 'demo') return null;
  return <p className="demo-note">지금은 예시 데이터로 보이는 초안입니다. 기업·사람·금액은 모두 가상이고, Supabase를 연결하면 실제 데이터로 바뀝니다.</p>;
}
