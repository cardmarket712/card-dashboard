import { CustomerBehavior } from "../components/customerBehavior";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CreditCard, Search } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import {
  Panel,
  Metric,
  ExportButton,
  Empty,
  Badge,
  Delta,
} from "../components/common";
import {
  TrendChart,
  StageHistory,
  ComparisonChart,
} from "../components/charts";
import {
  JourneyFlow,
  KPIOverview,
  Insights,
  kpis,
} from "../components/dashboard";
import {
  stages,
  definitions,
  actions,
  colors,
  months,
  products,
} from "../data/mockData";
import { change, journey, summary } from "../services/analytics";
import { money, num } from "../utils/format";
export function Overall() {
  const { data: d } = useDashboard();
  const [params] = useSearchParams();
  const metric = kpis.find((k) => k.key === params.get("metric"));
  return (
    <>
      <KPIOverview />
      {metric && (
        <Panel title={`${metric.label} 상세 분석`} subtitle={metric.definition}>
          <div className="metric-grid">
            <Metric label="당월" value={metric.format(d.current[metric.key])} />
            <Metric
              label="전월"
              value={metric.format(d.previous[metric.key])}
            />
            <Metric
              label="전년 동월"
              value={metric.format(d.year[metric.key])}
            />
            <Metric
              label="전월 대비"
              value={
                num(
                  metric.key === "valid"
                    ? d.current.valid - d.previous.valid
                    : change(d.current[metric.key], d.previous[metric.key]),
                  1,
                ) + (metric.key === "valid" ? "%p" : "%")
              }
            />
          </div>
        </Panel>
      )}
      <Panel
        title="월별 카드사업 실적"
        tools={<ExportButton rows={d.history} />}
      >
        <TrendChart />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>기준월</th>
                <th>이용대금</th>
                <th>신규회원</th>
                <th>유효율</th>
                <th>활성고객</th>
                <th>순이익</th>
              </tr>
            </thead>
            <tbody>
              {[...d.history].reverse().map((r) => (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td>{money(r.spend)}</td>
                  <td>{num(r.members)}명</td>
                  <td>{num(r.valid, 1)}%</td>
                  <td>{num(r.active)}명</td>
                  <td>{money(r.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="metric-grid">
        <Metric label="누적 발급좌수" value={num(d.current.issued) + "좌"} />
        <Metric
          label="유효 카드 수"
          value={num((d.current.issued * d.current.valid) / 100) + "좌"}
        />
        <Metric
          label="활성고객 1인당 이용대금"
          value={
            num(
              d.current.active ? (d.current.spend * 1e8) / d.current.active : 0,
            ) + "원"
          }
        />
      </div>
    </>
  );
}
export function JourneyOverview() {
  const { data: d, filters } = useDashboard();
  const j = d.journey;
  const [source, setSource] = useState(1);
  const total = j.previous[source];
  return (
    <>
      <JourneyFlow />
      <Panel
        title="고객여정 이동 매트릭스"
        subtitle="행: 전월 단계 → 열: 당월 단계 · 동일 고객 패널 · 이동 고객 수 및 행 기준 전환율"
        tools={
          <ExportButton
            rows={j.matrix.map((r, i) => ({
              이전단계: stages[i],
              ...Object.fromEntries(r.map((v, s) => [stages[s], v])),
            }))}
          />
        }
      >
        <div className="table-wrap">
          <table className="heatmap">
            <thead>
              <tr>
                <th>전월 ↓ / 당월 →</th>
                {stages.map((s) => (
                  <th key={s}>{s}</th>
                ))}
                <th>전월 고객 수</th>
              </tr>
            </thead>
            <tbody>
              {j.matrix.map((row, i) => (
                <tr key={i}>
                  <th>{stages[i]}</th>
                  {row.map((v, s) => (
                    <td
                      key={s}
                      style={{
                        background: `rgba(0,102,204,${0.035 + (j.previous[i] ? v / j.previous[i] : 0) * 0.65})`,
                      }}
                    >
                      <b>{num(v)}명</b>
                      <small>
                        {j.previous[i]
                          ? ((v / j.previous[i]) * 100).toFixed(1)
                          : 0}
                        %
                      </small>
                    </td>
                  ))}
                  <td>{num(j.previous[i])}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="footnote">
          전환율 = 해당 이동 고객 수 ÷ 전월 출발 단계 고객 수 × 100. 고정
          패널이므로 외부 신규 유입·이탈은 0명이며 단계 신규 진입은 타 단계에서
          유입된 고객입니다.
        </p>
      </Panel>
      <div className="two-grid">
        <Panel
          title="단계별 전환 흐름"
          tools={
            <select
              aria-label="출발 단계"
              value={source}
              onChange={(e) => setSource(Number(e.target.value))}
            >
              {stages.map((s, i) => (
                <option key={s} value={i}>
                  {s}
                </option>
              ))}
            </select>
          }
        >
          <div className="flow-origin">
            전월 {stages[source]} <b>{num(total)}명</b>
          </div>
          {j.matrix[source].map((v, i) => (
            <div className="flow-row" key={i}>
              <ArrowRight size={16} />
              <span>{stages[i]}</span>
              <div className="track">
                <i
                  style={{
                    width: (total ? (v / total) * 100 : 0) + "%",
                    background: colors[i],
                  }}
                />
              </div>
              <b>{num(v)}명</b>
              <small>{total ? ((v / total) * 100).toFixed(1) : 0}%</small>
            </div>
          ))}
        </Panel>
        <Panel
          title="월별 고객 구성비"
          subtitle={`최근 ${filters.period}개월 · 전체 패널 기준`}
        >
          <StageHistory />
        </Panel>
      </div>
      <div className="metric-grid">
        <Metric
          label="거래감소 → 집중이용 회복"
          value={num(j.matrix[3][2]) + "명"}
        />
        <Metric
          label="집중이용 → 거래감소"
          value={num(j.matrix[2][3]) + "명"}
        />
        <Metric
          label="이탈징후 → 활성·집중 재활성화"
          value={num(j.matrix[4][1] + j.matrix[4][2]) + "명"}
        />
        <Metric
          label="이탈징후 신규 진입"
          value={num(j.current[4] - j.matrix[4][4]) + "명"}
        />
      </div>
    </>
  );
}
export function JourneyDetail() {
  const { stage } = useParams();
  const s = Number(stage);
  const { filters: f } = useDashboard();
  if (!Number.isInteger(s) || s < 0 || s > 4)
    return <Empty text="존재하지 않는 고객여정 단계입니다." />;
  const j = journey(f);
  const count = j.current[s],
    prev = j.previous[s],
    kept = j.matrix[s][s];
  const rows = j.cohort.filter((c) => c.stages[months.indexOf(f.month)] === s);
  const stageSummary = summary({ ...f, stage: String(s) });
  const rate = (n: number, den = prev) =>
    `${num(den ? (n / den) * 100 : 0, 1)}%`;
  const metrics = [
    [
      ["신규 카드 발급", num(stageSummary.members) + "좌"],
      ["첫 이용 대상", num(count) + "명"],
      ["활성화기 전환율", rate(j.matrix[s][1])],
      ["직전 단계 유지", rate(kept)],
    ],
    [
      ["집중이용기 전환율", rate(j.matrix[s][2])],
      ["초기 이용대금", money(stageSummary.spend)],
      ["동일 단계 유지율", rate(kept)],
      ["집중이용 전환 고객", num(j.matrix[s][2]) + "명"],
    ],
    [
      ["전체 KPI 해당 단계 이용대금", money(stageSummary.spend)],
      ["핵심고객 유지율", rate(kept)],
      ["거래감소기 전환 고객", num(j.matrix[s][3]) + "명"],
      ["단계 순이익", money(stageSummary.profit)],
    ],
    [
      ["집중이용기 회복 고객", num(j.matrix[s][2]) + "명"],
      ["회복 전환율", rate(j.matrix[s][2])],
      ["이탈징후 이동 고객", num(j.matrix[s][4]) + "명"],
      ["전월 대비 고객 증감", num(count - prev) + "명"],
    ],
    [
      ["활성·집중 재이용 고객", num(j.matrix[s][1] + j.matrix[s][2]) + "명"],
      ["재활성화 전환율", rate(j.matrix[s][1] + j.matrix[s][2])],
      ["이탈징후 유지율", rate(kept)],
      ["타 단계 신규 진입", num(count - kept) + "명"],
    ],
  ][s];
  return (
    <>
      <div className="detail-banner" style={{ background: colors[s] }}>
        <div>
          <Badge tone="white">고객여정 0{s + 1}</Badge>
          <h2>{stages[s]}</h2>
          <p>{definitions[s]}</p>
        </div>
        <strong>
          {num(count)}
          <small> 명</small>
        </strong>
        <Link to="/journey">
          전환 분석 <ArrowRight size={16} />
        </Link>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <Metric key={label} label={label} value={value} />
        ))}
      </div>
      <div className="two-grid">
        <Panel title="고객유형별 구성" subtitle="해당 단계 샘플 고객 패널">
          <ComparisonChart
            rows={["개인", "개인사업자", "법인"].map((name) => ({
              name,
              value: rows
                .filter((r) => r.customer === name)
                .reduce((a, c) => a + c.weight, 0),
            }))}
          />
        </Panel>
        <Panel title="단계 고객 수 추이" subtitle="동일 패널 월별 상태">
          <ComparisonChart
            rows={months
              .slice(months.indexOf(f.month) - f.period + 1, months.indexOf(f.month) + 1)
              .map((m) => ({ name: m, value: journey(f, m).current[s] }))}
          />
        </Panel>
      </div>
      <CustomerBehavior stage={s} />
      <Panel title="관리 인사이트 및 추천 실행">
        <div className="insight-banner">
          <div>
            <h3>{actions[s]}</h3>
            <p>
              전월 {num(prev)}명에서 당월 {num(count)}명으로 변화했습니다. 동일
              단계 유지 {num(kept)}명, 타 단계 유입 {num(count - kept)}명, 타
              단계 유출 {num(prev - kept)}명입니다.
            </p>
            <p>
              전체 KPI 단계 이용대금 {money(stageSummary.spend)}은 위 고객
              패널과 다른 모집단입니다.
            </p>
          </div>
          <Link
            className="button primary"
            to={`/tasks?new=${encodeURIComponent(actions[s])}`}
          >
            개선과제 등록 <ArrowRight size={15} />
          </Link>
        </div>
      </Panel>
      <Panel
        title="상품별 고객 구성 및 마케팅 대상"
        subtitle="익명 샘플 패널 · 선택 조건 적용"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>카드상품</th>
                <th>고객 수</th>
                <th>구성비</th>
                <th>추천 조치</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) => rows.some((c) => c.product === p.id))
                .map((p) => {
                  const n = rows
                    .filter((r) => r.product === p.id)
                    .reduce((a, c) => a + c.weight, 0);
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{num(n)}명</td>
                      <td>{num(count ? (n / count) * 100 : 0, 1)}%</td>
                      <td>{actions[s]}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty />}
      </Panel>
    </>
  );
}
export function Products() {
  const { data: d } = useDashboard();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("spend");
  const rows = d.ranking
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sort as "spend"] - a[sort as "spend"]);
  return (
    <>
      <Panel
        title="카드상품별 실적"
        subtitle="동일 집계범위 상품 합계 = 전체 이용대금"
        tools={<ExportButton rows={rows} />}
      >
        <div className="table-toolbar">
          <label className="search">
            <Search size={16} />
            <input
              aria-label="상품명 검색"
              placeholder="카드상품명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="상품 정렬"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="spend">이용대금순</option>
            <option value="issued">발급좌수순</option>
            <option value="growth">성장률순</option>
            <option value="margin">수익성순</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>카드상품</th>
                <th>카드유형</th>
                <th>누적 발급</th>
                <th>신규회원</th>
                <th>활성고객</th>
                <th>이용대금</th>
                <th>전월 대비</th>
                <th>수익률</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="product-name" to={`/products/${r.id}`}>
                      <CreditCard color={r.color} size={25} />
                      {r.name}
                    </Link>
                  </td>
                  <td>
                    <Badge>{r.card}</Badge>
                  </td>
                  <td>{num(r.issued)}</td>
                  <td>{num(r.members)}</td>
                  <td>{num(r.active)}</td>
                  <td>{money(r.spend)}</td>
                  <td>
                    <Delta value={r.growth} />
                  </td>
                  <td>{num(r.margin, 1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>조회 상품 합계</th>
                <td colSpan={4} />
                <th>{money(rows.reduce((a, r) => a + r.spend, 0))}</th>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        {!rows.length && <Empty />}
      </Panel>
    </>
  );
}
export function ProductDetail() {
  const { id } = useParams();
  const { filters } = useDashboard();
  const p = products.find((p) => p.id === id);
  if (!p) return <Empty text="존재하지 않는 상품입니다." />;
  const f = { ...filters, product: p.id };
  const s = summary(f);
  const m = months.indexOf(f.month);
  const prev = summary(f, months[m - 1]);
  const year = summary(f, months[m - 12]);
  return (
    <>
      <Panel title={p.name} subtitle={`${p.card}카드 · 샘플 데이터`}>
        <div className="metric-grid">
          <Metric label="누적 발급좌수" value={num(s.issued) + "좌"} />
          <Metric
            label="신규 발급좌수"
            value={num(s.members) + "좌"}
            note="샘플에서 신규회원 1인 1좌"
          />
          <Metric
            label="유효회원"
            value={num((s.issued * s.valid) / 100) + "명"}
            note="샘플에서 회원 1인 1카드"
          />
          <Metric label="유효율" value={num(s.valid, 1) + "%"} />
          <Metric label="이용대금" value={money(s.spend)} />
          <Metric
            label="활성고객당 이용대금"
            value={num(s.active ? (s.spend * 1e8) / s.active : 0) + "원"}
          />
          <Metric
            label="수익 / 비용"
            value={`${num(s.revenue, 1)} / ${num(s.cost, 1)}억`}
          />
          <Metric
            label="순이익 / 수익률"
            value={`${num(s.profit, 1)}억 / ${num(s.revenue ? (s.profit / s.revenue) * 100 : 0, 1)}%`}
          />
          <Metric
            label="전월 / 전년 성장률"
            value={`${num(change(s.spend, prev.spend), 1)}% / ${num(change(s.spend, year.spend), 1)}%`}
          />
        </div>
      </Panel>
      <div className="two-grid">
        <Panel title="월별 이용대금 (억원)">
          <ComparisonChart
            rows={months
              .slice(m - f.period + 1, m + 1)
              .map((month) => ({
                name: month,
                value: summary(f, month).spend,
              }))}
          />
        </Panel>
        <Panel title="고객유형별 이용대금 (억원)">
          <ComparisonChart
            rows={["개인", "개인사업자", "법인"]
              .filter((c) => f.customer === "전체" || f.customer === c)
              .map((customer) => ({
                name: customer,
                value: summary({ ...f, customer }).spend,
              }))}
          />
        </Panel>
      </div>
      <Panel title="월별 발급 추이 (좌)">
        <ComparisonChart
          rows={months
            .slice(m - f.period + 1, m + 1)
            .map((month) => ({
              name: month,
              value: summary(f, month).members,
            }))}
        />
      </Panel>
    </>
  );
}
export function Profitability() {
  const { data: d, filters } = useDashboard();
  return (
    <>
      <div className="metric-grid">
        <Metric label="카드사업 수익" value={money(d.current.revenue)} />
        <Metric label="카드사업 비용" value={money(d.current.cost)} />
        <Metric label="순이익" value={money(d.current.profit)} />
        <Metric
          label="순이익률"
          value={
            num(
              d.current.revenue
                ? (d.current.profit / d.current.revenue) * 100
                : 0,
              1,
            ) + "%"
          }
          note="순이익 ÷ 수익 × 100"
        />
      </div>
      <Panel
        title="수익 및 비용 추이"
        tools={<ExportButton rows={d.history} />}
      >
        <TrendChart profit />
      </Panel>
      <div className="two-grid">
        <Panel title="상품별 순이익 (억원)">
          <ComparisonChart
            rows={d.ranking.map((r) => ({ name: r.name, value: r.profit }))}
          />
        </Panel>
        <Panel title="고객군별 순이익 (억원)">
          <ComparisonChart
            rows={["개인", "개인사업자", "법인"]
              .filter(
                (c) => filters.customer === "전체" || filters.customer === c,
              )
              .map((customer) => ({
                name: customer,
                value: summary({ ...filters, customer }).profit,
              }))}
          />
        </Panel>
      </div>
      <Insights />
    </>
  );
}
