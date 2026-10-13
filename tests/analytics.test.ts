import test from "node:test";
import assert from "node:assert/strict";
import {
  analytics,
  defaultFilters,
  journey,
  summary,
} from "../src/services/analytics";
import { months, products } from "../src/data/mockData";
test("기본 KPI와 상품 합계가 일치한다", () => {
  const d = analytics(defaultFilters);
  assert.ok(Math.abs(d.current.spend - 12800) < 1e-7);
  assert.ok(Math.abs(d.current.profit - 184) < 1e-7);
  assert.ok(Math.abs(d.current.members - 24530) < 1e-7);
  assert.ok(
    Math.abs(d.ranking.reduce((a, r) => a + r.spend, 0) - d.current.spend) <
      1e-7,
  );
  assert.deepEqual(d.journey.current, [182000, 157000, 104000, 61000, 32000]);
  assert.equal(d.journey.total, 536000);
});
test("모든 월과 필터에서 이동 행렬이 동일 패널의 전월·당월 인원과 일치한다", () => {
  for (const month of months.slice(12))
    for (const customer of ["전체", "개인", "개인사업자", "법인"])
      for (const product of ["전체", ...products.map((p) => p.id)]) {
        const f = { ...defaultFilters, month, customer, product };
        const j = journey(f);
        const prev = journey(f, months[months.indexOf(month) - 1]);
        assert.deepEqual(j.previous, prev.current);
        assert.deepEqual(
          j.current,
          j.current.map((_, i) => j.matrix.reduce((a, r) => a + r[i], 0)),
        );
        assert.equal(j.total, prev.total);
        const d = analytics(f);
        assert.ok(
          Math.abs(
            d.current.spend - d.ranking.reduce((a, r) => a + r.spend, 0),
          ) < 1e-7,
        );
      }
});
test("종속 카드 필터 및 빈 결과가 일관되게 적용된다", () => {
  const f = { ...defaultFilters, card: "체크" };
  const d = analytics(f);
  assert.ok(d.ranking.every((p) => p.card === "체크"));
  assert.ok(d.current.spend < summary(defaultFilters).spend);
  const empty = analytics({ ...f, product: "p1" });
  assert.equal(empty.current.spend, 0);
  assert.equal(empty.journey.total, 0);
  assert.equal(empty.current.valid, 0);
});
test("전월과 전년 비교를 위한 24개월 데이터가 존재한다", () => {
  for (const month of months.slice(12)) {
    const d = analytics({ ...defaultFilters, month });
    assert.equal(d.history.length, 12);
    assert.ok(d.previous.spend > 0);
    assert.ok(d.year.spend > 0);
  }
});
test("경보는 방향과 임계값에 따라 발생하고 캠페인 증분은 대조군을 필요로 한다", () => {
  const d = analytics(defaultFilters);
  assert.ok(d.alerts.some((a) => a.id === "stage-3"));
  for (const c of d.campaigns) {
    assert.ok(
      c.target >= c.sent &&
        c.sent >= c.applied &&
        c.applied >= c.responded &&
        c.responded >= c.users,
    );
    if (!c.control) {
      assert.equal(c.increment, null);
      assert.equal(c.roi, null);
    } else {
      assert.ok(c.increment !== null);
      assert.ok(Number.isFinite(c.roi));
    }
  }
  const empty = analytics({ ...defaultFilters, card: "체크", product: "p1" });
  assert.equal(empty.alerts.length, 0);
});
