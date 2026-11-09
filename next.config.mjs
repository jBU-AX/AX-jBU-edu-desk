/** @type {import('next').NextConfig} */
// STATIC_EXPORT=1 이면 예시 데이터로 정적 미리보기(out/)를 만듭니다. Vercel 배포 때는 쓰지 않습니다.
const nextConfig = process.env.STATIC_EXPORT
  ? { output: 'export', trailingSlash: true, images: { unoptimized: true } }
  : {};
export default nextConfig;
