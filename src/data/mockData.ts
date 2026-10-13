import type { Customer, Fact, Product, Stage, Task } from "../types";
export const months = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(Date.UTC(2024, 9 + i, 1));
  return d.toISOString().slice(0, 7);
});
export const stages = [
  "유입초기",
  "활성화기",
  "집중이용기",
  "거래감소기",
  "이탈징후기",
];
export const definitions = [
  "발급 후 첫 이용을 준비하는 고객",
  "초기 이용 습관을 형성하는 고객",
  "지속적으로 활발하게 이용하는 고객",
  "이전 대비 이용이 감소한 고객",
  "장기 미이용 전환 위험이 있는 고객",
];
export const actions = [
  "첫 이용 웰컴 프로그램",
  "이용빈도 확대 프로그램",
  "핵심고객 유지 및 우대",
  "선제적 이용 회복 캠페인",
  "고위험 고객 재이용 유도",
];
export const colors = ["#1789dc", "#0871c5", "#1254a4", "#4479aa", "#8b70c9"];
export const products: Product[] = [
  {
    id: "p1",
    name: "IBK 무민 카드",
    card: "신용",
    share: 0.29,
    color: "#1764b2",
  },
  {
    id: "p2",
    name: "IBK 기업 비즈니스",
    card: "신용",
    share: 0.25,
    color: "#254578",
  },
  {
    id: "p3",
    name: "IBK 일상의 기쁨",
    card: "신용",
    share: 0.2,
    color: "#378ad3",
  },
  {
    id: "p4",
    name: "IBK 나라사랑",
    card: "체크",
    share: 0.16,
    color: "#60a6df",
  },
  {
    id: "p5",
    name: "IBK I-ALL 체크",
    card: "체크",
    share: 0.1,
    color: "#97bddd",
  },
];
const counts = [1820, 1570, 1040, 610, 320];
export const customers: Customer[] = counts.flatMap((n, s) =>
  Array.from({ length: n }, (_, j) => {
    const id = counts.slice(0, s).reduce((a, b) => a + b, 0) + j;
    return {
      id: `SAMPLE-${String(id).padStart(6, "0")}`,
      customer: ["개인", "개인사업자", "법인"][
        id % 10 < 7 ? 0 : id % 10 < 9 ? 1 : 2
      ],
      product: products[id % 5].id,
      tenure: id % 4 === 0 ? "신규" : "기존",
      weight: 100,
      stages: months.map((_, m) => {
        if (m === 23) return s as Stage;
        const moving = (id * 17 + m * 13) % 100;
        return (
          s >= 3
            ? moving < 15
              ? 2
              : s
            : moving < 3
              ? s === 2
                ? 3
                : 4
              : moving < 15
                ? (s + 1) % 3
                : s
        ) as Stage;
      }),
    };
  }),
);
const customerShares = [0.68, 0.22, 0.1],
  tenureShares = [0.14, 0.86],
  stageShares = [0.12, 0.22, 0.47, 0.13, 0.06];
export const monthlyPerformance: Fact[] = months.flatMap((month, m) =>
  products.flatMap((p) =>
    ["개인", "개인사업자", "법인"].flatMap((customer, c) =>
      ["신규", "기존"].flatMap((tenure, t) =>
        stages.map((_, s) => {
          const growth =
            m === 23
              ? 1
              : m === 22
                ? 1 / 1.062
                : 0.69 + m * 0.012 + (m % 4) * 0.012;
          const share =
            p.share * customerShares[c] * tenureShares[t] * stageShares[s];
          const spend = 12800 * growth * share;
          const profit =
            184 *
            (m === 23 ? 1 : m === 22 ? 1 / 1.157 : 0.64 + m * 0.013) *
            share;
          return {
            month,
            product: p.id,
            customer,
            tenure,
            stage: s as Stage,
            spend,
            members:
              24530 *
              (m === 23 ? 1 : m === 22 ? 1 / 1.126 : 0.6 + m * 0.016) *
              share,
            active:
              862000 *
              (m === 23 ? 1 : m === 22 ? 1 / 1.043 : 0.76 + m * 0.009) *
              share,
            valid: m === 23 ? 0.724 : m === 22 ? 0.711 : 0.66 + m * 0.0025,
            issued: 1640000 * growth * share,
            revenue: spend * 0.024,
            cost: spend * 0.024 - profit,
          };
        }),
      ),
    ),
  ),
);
export const actionTasks: Task[] = [
  {
    id: "task-1",
    title: "거래감소기 고객 선제 케어 캠페인",
    department: "회원마케팅팀",
    created: "2026-09-15",
    due: "2026-10-23",
    status: "진행중",
    kpi: "거래감소기 고객 수",
    expected: "거래 회복 및 집중이용기 전환",
    actual: "측정 대기",
    alertId: "stage-3",
  },
  {
    id: "task-2",
    title: "활성화기 집중이용 전환 프로그램 강화",
    department: "카드사업기획팀",
    created: "2026-09-18",
    due: "2026-10-30",
    status: "대기",
    kpi: "집중이용기 전환율",
    expected: "초기 이용빈도 확대",
    actual: "측정 대기",
  },
  {
    id: "task-3",
    title: "고위험 고객 재활성화 캠페인",
    department: "고객관리팀",
    created: "2026-09-10",
    due: "2026-10-10",
    status: "지연",
    kpi: "재이용 전환율",
    expected: "이탈징후 고객의 재이용 유도",
    actual: "측정 대기",
    alertId: "stage-4",
  },
];
