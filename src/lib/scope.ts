import type { Enrollment } from './types';

/** 데스크가 다루는 고객 범위. 결제일(결제 전이면 등록일) 기준입니다. */
export const SCOPE = { from: '2024-01-01', to: '2026-12-31', label: '2024~2026년 결제·등록 고객' };

/** 고객을 연도로 나눌 때 쓰는 날짜: 결제일, 결제 전이면 등록일 */
export const customerDate = (e: Enrollment) => e.paidAt || e.registeredAt;

export type RevenueBasis = 'paid' | 'course';
export const BASIS_LABEL: Record<RevenueBasis, string> = { paid: '결제일 기준', course: '교육일 기준' };
