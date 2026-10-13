import { months } from "../data/mockData";
import type { Filters } from "../types";
import { journey } from "./analytics";
export function customerProfile(f: Filters, stage: number) {
  const m = months.indexOf(f.month);
  return journey(f)
    .cohort.filter((c) => c.stages[m] === stage)
    .map((c) => {
      const seed = Number(c.id.slice(7));
      const firstDays = 1 + (seed % 24);
      const frequency = [
        seed % 4,
        3 + (seed % 8),
        15 + (seed % 20),
        2 + (seed % 7),
        seed % 3,
      ][stage];
      const baseline = 300000 + (seed % 20) * 65000;
      const spend = Math.round(
        baseline * [0.15, 0.65, 1.15, 0.48, 0.12][stage],
      );
      return {
        ...c,
        channel: ["영업점", "모바일 앱", "제휴 채널"][seed % 3],
        age: ["20대", "30대", "40대", "50대 이상"][seed % 4],
        firstDays,
        firstUsed: seed % 10 < 7,
        monthUsage: [seed % 10 < 6, seed % 10 < 7, seed % 10 < 8],
        reused: seed % 10 < 6,
        frequency,
        baseline,
        spend,
        decline: (spend / baseline - 1) * 100,
        declineMonths: 1 + (seed % 4),
        industry: ["생활·쇼핑", "음식·카페", "교통·여행", "온라인 결제"][
          seed % 4
        ],
        lastDays: [
          seed % 20,
          seed % 15,
          seed % 5,
          20 + (seed % 40),
          60 + (seed % 80),
        ][stage],
        contacted: seed % 10 < 7,
        responded: seed % 10 < 2,
        risk: seed % 3 === 0 ? "높음" : seed % 3 === 1 ? "중간" : "낮음",
        profit: spend * 0.014,
      };
    });
}
