import { stages, actions } from "../data/mockData";
import type { Filters } from "../types";
export function campaignPerformance(counts: number[], filters: Filters) {
  return stages
    .map((stage, i) => {
      const target = counts[i],
        sent = Math.floor(target * 0.8),
        applied = Math.floor(sent * 0.4),
        responded = Math.floor(applied * (0.6 + i * 0.025)),
        users = Math.floor(responded * 0.8);
      const average = 125000 + i * 30000;
      const spend = (users * average) / 1e8;
      const cost = (sent * 120) / 1e8;
      const control = i % 2 === 0;
      const controlSize = Math.floor(target * 0.1);
      const controlUsers = Math.floor(controlSize * 0.07);
      const controlSpend = (controlUsers * (average - 15000)) / 1e8;
      const increment = control
        ? spend - (controlSize ? (controlSpend / controlSize) * sent : 0)
        : null;
      const profit = increment === null ? null : increment * 0.02;
      const roi =
        profit === null || cost === 0 ? null : ((profit - cost) / cost) * 100;
      return {
        id: i,
        stage,
        title: actions[i],
        target,
        sent,
        applied,
        responded,
        users,
        spend,
        cost,
        control,
        controlSize,
        controlUsers,
        controlSpend,
        increment,
        roi,
        rate: sent ? (responded / sent) * 100 : 0,
        targetRate: 30,
      };
    })
    .filter((r) => filters.stage === "전체" || r.id === Number(filters.stage));
}
