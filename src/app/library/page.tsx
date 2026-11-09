import { getData } from '@/lib/data';
import DocLibrary from '@/components/DocLibrary';
import DemoNote from '@/components/DemoNote';

export default async function LibraryPage() {
  const data = await getData();
  const chars = data.documents.reduce((s, d) => s + d.chars, 0);
  return (
    <main className="sheet" style={{ ['--accent' as string]: '#18212C' }}>
      <DemoNote data={data} />
      <div className="page-h">
        <div>
          <h1>자료함</h1>
          <p>구글 드라이브의 공개교육 자료 {data.documents.length.toLocaleString()}건 · 글자 수 약 {Math.round(chars / 1e4).toLocaleString()}만 자 · 이미지는 담지 않습니다</p>
        </div>
      </div>
      <DocLibrary docs={data.documents} programs={data.programs.map((p) => ({ slug: p.slug, name: p.name, short: p.short, color: p.color }))} />
    </main>
  );
}
