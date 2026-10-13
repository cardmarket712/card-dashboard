import {
  customers,
  monthlyPerformance,
  months,
  products,
  stages,
  actions,
} from "../data/mockData";
import { alertRules } from "../data/alertRules";
import { campaignPerformance } from "./campaigns";
import type { Filters, Fact, Alert } from "../types";
export const defaultFilters: Filters = {
  month: "2026-09",
  period: 12,
  customer: "전체",
  card: "전체",
  stage: "전체",
  product: "전체",
  tenure: "전체",
};
export const sum = (
  rows: Fact[],
  key: Exclude<
    keyof Fact,
    "month" | "product" | "customer" | "tenure" | "stage"
  >,
) => rows.reduce((a, r) => a + r[key], 0);
export const change = (a: number, b: number) => (b ? (a / b - 1) * 100 : 0);
export function selectFacts(f: Filters, month = f.month) {
  return monthlyPerformance.filter(
    (r) =>
      r.month === month &&
      (f.customer === "전체" || r.customer === f.customer) &&
      (f.tenure === "전체" || r.tenure === f.tenure) &&
      (f.stage === "전체" || r.stage === Number(f.stage)) &&
      (f.product === "전체" || r.product === f.product) &&
      (f.card === "전체" ||
        products.find((p) => p.id === r.product)?.card === f.card),
  );
}
export function summary(f: Filters, month = f.month) {
  const r = selectFacts(f, month);
  const issued = sum(r, "issued");
  return {
    spend: sum(r, "spend"),
    members: sum(r, "members"),
    active: sum(r, "active"),
    profit: sum(r, "revenue") - sum(r, "cost"),
    valid: issued
      ? (r.reduce((a, x) => a + x.valid * x.issued, 0) / issued) * 100
      : 0,
    issued,
    revenue: sum(r, "revenue"),
    cost: sum(r, "cost"),
  };
}
export function journey(f: Filters, month = f.month) {
  const m = months.indexOf(month);
  const cohort = customers.filter(
    (c) =>
      (f.customer === "전체" || c.customer === f.customer) &&
      (f.product === "전체" || c.product === f.product) &&
      (f.card === "전체" ||
        products.find((p) => p.id === c.product)?.card === f.card) &&
      (f.tenure === "전체" || c.tenure === f.tenure),
  );
  const matrix = stages.map(() => stages.map(() => 0));
  cohort.forEach((c) => {
    if (m > 0) matrix[c.stages[m - 1]][c.stages[m]] += c.weight;
  });
  const current = stages.map((_, s) =>
    cohort.filter((c) => c.stages[m] === s).reduce((a, c) => a + c.weight, 0),
  );
  const previous = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  return {
    matrix,
    current,
    previous,
    total: current.reduce((a, b) => a + b, 0),
    cohort,
  };
}
export function analytics(f: Filters) {
  const m = months.indexOf(f.month),
    current = summary(f),
    previous = summary(f, months[m - 1]),
    year = summary(f, months[m - 12]);
  const history = months
    .slice(Math.max(0, m - f.period + 1), m + 1)
    .map((month) => ({
      month: month.slice(2).replace("-", "."),
      ...summary(f, month),
    }));
  const j = journey(f);
  const alerts: Alert[] = [];
  for (const key of ["spend", "members", "valid"] as const) {
    const delta =
      key === "valid"
        ? current.valid - previous.valid
        : change(current[key], previous[key]);
    const rule = alertRules[key];
    if (delta <= -rule.warning)
      alerts.push({
        id: key,
        title: {
          spend: "이용대금 감소",
          members: "신규회원 감소",
          valid: "유효율 하락",
        }[key],
        change: delta,
        level: delta <= -rule.urgent ? "긴급" : "주의",
        detail: `전월 ${previous[key].toFixed(1)} → 당월 ${current[key].toFixed(1)}. 경보 기준 ${rule.warning}${key === "valid" ? "%p" : "%"} 이상 하락.`,
        recommendation: "고객군별 원인 분석 및 활성화 캠페인",
      });
  }
  for (const s of [3, 4]) {
    if (f.stage !== "전체" && Number(f.stage) !== s) continue;
    const delta = change(j.current[s], j.previous[s]);
    if (delta >= alertRules.risk.warning)
      alerts.push({
        id: `stage-${s}`,
        title: `${stages[s]} 고객 증가`,
        change: delta,
        level: delta >= alertRules.risk.urgent ? "긴급" : "주의",
        detail: `전월 ${j.previous[s].toLocaleString()}명 → 당월 ${j.current[s].toLocaleString()}명. 동일 고객 패널 기준 순증감입니다.`,
        stage: s,
        recommendation: actions[s],
      });
  }
  const ranking = products
    .filter(
      (p) =>
        (f.card === "전체" || p.card === f.card) &&
        (f.product === "전체" || p.id === f.product),
    )
    .map((p) => {
      const r = selectFacts({ ...f, product: p.id });
      const old = selectFacts({ ...f, product: p.id }, months[m - 1]);
      const spend = sum(r, "spend"),
        revenue = sum(r, "revenue"),
        cost = sum(r, "cost");
      return {
        ...p,
        spend,
        issued: sum(r, "issued"),
        members: sum(r, "members"),
        active: sum(r, "active"),
        revenue,
        cost,
        profit: revenue - cost,
        margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
        growth: change(spend, sum(old, "spend")),
      };
    });
  for (const p of ranking) {
    if (p.growth <= -alertRules.product.warning)
      alerts.push({
        id: `product-${p.id}`,
        title: `${p.name} 이용대금 감소`,
        change: p.growth,
        level: p.growth <= -alertRules.product.urgent ? "긴급" : "주의",
        detail: `전월 대비 ${p.growth.toFixed(1)}% 감소. 상품별 이용 추이와 고객 구성을 확인하세요.`,
        recommendation: `${p.name} 이용 활성화 검토`,
      });
  }
  const campaigns = campaignPerformance(j.current, f);
  for (const c of campaigns) {
    const gap = change(c.rate, c.targetRate);
    if (c.sent && gap <= -alertRules.campaign.warning)
      alerts.push({
        id: `campaign-${c.id}`,
        title: `${c.stage} 캠페인 목표 미달`,
        change: gap,
        level: gap <= -alertRules.campaign.urgent ? "긴급" : "주의",
        detail: `반응률 ${c.rate.toFixed(1)}%, 목표 ${c.targetRate}%. 목표 대비 ${gap.toFixed(1)}% 미달이며 전월 증감이 아닙니다.`,
        recommendation: `${c.title} 반응률 개선`,
      });
  }
  return {
    current,
    previous,
    year,
    history,
    journey: j,
    alerts,
    ranking,
    campaigns,
  };
}
export interface DashboardRepository {
  load(filters: Filters): ReturnType<typeof analytics>;
}
export const mockRepository: DashboardRepository = { load: analytics };
