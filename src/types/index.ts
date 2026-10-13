export type Stage = 0 | 1 | 2 | 3 | 4;
export interface Filters {
  month: string;
  period: number;
  customer: string;
  card: string;
  stage: string;
  product: string;
  tenure: string;
}
export interface Customer {
  id: string;
  customer: string;
  product: string;
  tenure: string;
  stages: Stage[];
  weight: number;
}
export interface Product {
  id: string;
  name: string;
  card: string;
  share: number;
  color: string;
}
export interface Fact {
  month: string;
  product: string;
  customer: string;
  tenure: string;
  stage: Stage;
  spend: number;
  members: number;
  active: number;
  valid: number;
  issued: number;
  revenue: number;
  cost: number;
}
export interface Task {
  id: string;
  title: string;
  department: string;
  created: string;
  due: string;
  status: "대기" | "진행중" | "완료" | "지연";
  kpi: string;
  expected: string;
  actual: string;
  alertId?: string;
}
export interface Alert {
  id: string;
  title: string;
  change: number;
  level: "긴급" | "주의";
  detail: string;
  stage?: number;
  recommendation: string;
}
