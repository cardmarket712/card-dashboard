import { customerProfile } from "../services/customerProfile";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Info,
  ArrowRight,
  Lightbulb,
  TriangleAlert,
  CreditCard,
  Users,
  ChartNoAxesCombined,
  Wallet,
  UserCheck,
  CheckCheck,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { stages, definitions, colors, actions } from "../data/mockData";
import { change } from "../services/analytics";
import { money, num } from "../utils/format";
import { Panel, Badge, Delta, Empty } from "./common";
import { Sparkline, TrendChart } from "./charts";
export const kpis = [
  {
    key: "spend",
    label: "이용대금",
    icon: CreditCard,
    format: money,
    definition: "전체 카드 결제 이용대금 합계 (억원)",
  },
  {
    key: "members",
    label: "신규회원",
    icon: Users,
    format: (n: number) => num(n) + "명",
    definition: "기준월 신규 가입 회원 수",
  },
  {
    key: "valid",
    label: "유효율",
    icon: ChartNoAxesCombined,
    format: (n: number) => num(n, 1) + "%",
    definition: "유효 카드 수 ÷ 누적 발급 카드 수 × 100",
  },
  {
    key: "profit",
    label: "순이익",
    icon: Wallet,
    format: money,
    definition: "카드사업 수익 − 비용 (억원)",
  },
  {
    key: "active",
    label: "활성고객수",
    icon: UserCheck,
    format: (n: number) => num(n / 10000, 1) + "만명",
    definition: "기준월 결제 이용 이력이 있는 고객 수",
  },
] as const;
export function KPIOverview() {
  const { data: d, filters } = useDashboard();
  return (
    <div className="kpi-grid">
      {kpis.map(({ key, label, icon: Icon, format, definition }) => (
        <Link
          to={key === "profit" ? "/profitability" : `/overall?metric=${key}`}
          className="kpi"
          key={key}
        >
          <div className="kpi-label">
            <span>
              {label}{" "}
              <span
                title={`${definition} · ${filters.month} · 선택한 고객/상품 집계 · 전월 대비 (당월/전월−1)×100, 유효율은 %p 차이`}
              >
                <Info size={12} aria-label={definition} />
              </span>
            </span>
            <Icon size={19} />
          </div>
          <strong>{format(d.current[key])}</strong>
          <div className="kpi-comparison">
            <span>전월 대비</span>
            <Delta
              value={
                key === "valid"
                  ? d.current[key] - d.previous[key]
                  : change(d.current[key], d.previous[key])
              }
              unit={key === "valid" ? "%p" : "%"}
            />
          </div>
          <div className="spark">
            <Sparkline values={d.history.map((r) => r[key])} />
          </div>
          <small>
            전년 동월 대비{" "}
            <b>
              {key === "valid"
                ? num(d.current[key] - d.year[key], 1) + "%p"
                : num(change(d.current[key], d.year[key]), 1) + "%"}
            </b>
          </small>
        </Link>
      ))}
    </div>
  );
}
export function Targets() {
  const { data: d } = useDashboard();
  return (
    <Panel title="목표 대비 실적" subtitle="기준월 목표 달성 현황">
      {kpis
        .filter((k) => k.key !== "valid")
        .map((k, i) => {
          const actual = d.current[k.key],
            target = d.previous[k.key] * [1.1, 1.08, 1.1, 1.06][i],
            rate = target ? (actual / target) * 100 : 0;
          return (
            <div className="target" key={k.key}>
              <div>
                <b>{k.label}</b>
                <span
                  className={
                    rate >= 100 ? "positive" : rate < 90 ? "negative" : ""
                  }
                >
                  {rate.toFixed(1)}% {rate >= 100 ? "✓" : ""}
                </span>
              </div>
              <div className="track">
                <i
                  style={{
                    width: Math.min(100, rate) + "%",
                    background: rate >= 100 ? "#16a085" : undefined,
                  }}
                />
              </div>
              <small>
                {k.format(actual)} <span>목표 {k.format(target)}</span>
              </small>
            </div>
          );
        })}
    </Panel>
  );
}
export function Insights() {
  const { data: d } = useDashboard();
  return (
    <Panel
      title="고객여정 개선 인사이트"
      tools={<Lightbulb size={19} color="#d99b34" />}
    >
      <div className="insight-lead">
        <Badge>데이터 기반 분석</Badge>
        <span>샘플 고객 패널</span>
      </div>
      {[3, 1, 4].map((s) => {
        const j = d.journey;
        const rate = j.previous[s] ? (j.matrix[s][2] / j.previous[s]) * 100 : 0;
        return (
          <Link className="insight" key={s} to={`/journey/${s}`}>
            <span className={`dot dot-${s}`} />
            <div>
              <b>
                {s === 1
                  ? "활성화기 → 집중이용기 전환"
                  : `${stages[s]} 고객 관리`}
              </b>
              <p>
                {s === 1
                  ? `동일 고객 기준 전환율 ${rate.toFixed(1)}%`
                  : `전월 대비 고객 수 ${change(j.current[s], j.previous[s]).toFixed(1)}%`}
              </p>
              <small>추천 · {actions[s]}</small>
            </div>
            <ArrowRight size={14} />
          </Link>
        );
      })}
    </Panel>
  );
}
export function AlertsPanel() {
  const { data: d, filters } = useDashboard();
  return (
    <Panel
      title="이상징후 / 경보"
      link="/alerts"
      tools={<Badge tone="orange">{d.alerts.length}건</Badge>}
    >
      {d.alerts.length ? (
        d.alerts.slice(0, 3).map((a) => (
          <Link className="alert-item" to={`/alerts?id=${a.id}`} key={a.id}>
            <TriangleAlert
              size={18}
              className={a.level === "긴급" ? "negative" : "warning"}
            />
            <div>
              <b>{a.title}</b>
              <p>
                {filters.month} ·{" "}
                {a.id.startsWith("campaign-") ? "목표 대비" : "전월 대비"}{" "}
                <Delta value={a.change} reverse={a.stage !== undefined} />
              </p>
            </div>
            <Badge tone={a.level === "긴급" ? "red" : "orange"}>
              {a.level}
            </Badge>
          </Link>
        ))
      ) : (
        <Empty text="기준값을 초과한 경보가 없습니다." />
      )}
      <div className="panel-note">
        <CheckCheck size={13} /> 설정된 임계값 기준으로 자동 탐지
      </div>
    </Panel>
  );
}
export function JourneyFlow() {
  const { data: d, filters } = useDashboard();
  return (
    <Panel
      title="회원관리체계 기반 고객여정"
      subtitle="고객의 변화를 이해하고, 다음 행동으로 연결합니다."
      link="/journey"
    >
      <div className="journey-meta">
        <Badge>고객여정 5단계</Badge>
        <span>
          분석대상 <b>{num(d.journey.total)}명</b> · 전체 KPI 모집단과 별도인
          고정 샘플 패널
        </span>
      </div>
      <div className="journey-grid">
        {stages.map((s, i) => {
          const count = d.journey.current[i];
          return (
            <Link
              key={s}
              to={`/journey/${i}`}
              className={`journey-card ${filters.stage !== "전체" && Number(filters.stage) !== i ? "muted-stage" : ""}`}
              style={{ "--stage-color": colors[i] } as React.CSSProperties}
            >
              <div className="stage-head">
                <span>0{i + 1}</span>
                <b>{s}</b>
                <ArrowRight size={15} />
              </div>
              <p>{definitions[i]}</p>
              <div className="stage-value">
                {num(count / 10000, 1)}
                <small>만명</small>
                <span>
                  {d.journey.total
                    ? ((count / d.journey.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="stage-delta">
                전월 대비{" "}
                <Delta
                  value={change(count, d.journey.previous[i])}
                  reverse={i >= 3}
                />
              </div>
              <div className="stage-foot">
                단계 유지 <b>{num(d.journey.matrix[i][i])}명</b>
                <span>
                  패널 이용대금{" "}
                  {money(
                    customerProfile(filters, i).reduce(
                      (a, r) => a + r.spend * r.weight,
                      0,
                    ) / 1e8,
                  )}
                </span>
                <span>
                  관리 지표 ·{" "}
                  {i === 0
                    ? "첫 이용"
                    : i === 1
                      ? "집중이용 전환"
                      : i === 2
                        ? "이용 유지"
                        : i === 3
                          ? "거래 회복"
                          : "재이용 전환"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <p className="footnote">
        단계 순서는 관리체계의 배열입니다. 실제 양방향 이동 및 단계 건너뛰기는
        전환 분석에서 확인할 수 있습니다. 단계 필터와 관계없이 구성비 분모는
        전체 패널입니다.
      </p>
    </Panel>
  );
}
export function ProductRanking() {
  const { data: d } = useDashboard();
  const [metric, setMetric] = useState<
    "spend" | "issued" | "growth" | "margin"
  >("spend");
  const rows = [...d.ranking].sort((a, b) => b[metric] - a[metric]);
  const max = Math.max(...rows.map((r) => r[metric]), 1);
  return (
    <Panel title="주요 상품 실적" link="/products">
      <div className="tabs">
        {(
          [
            ["spend", "이용대금"],
            ["issued", "발급좌수"],
            ["growth", "성장률"],
            ["margin", "수익성"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={metric === key ? "active" : ""}
            onClick={() => setMetric(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {rows.map((r, i) => (
        <Link to={`/products/${r.id}`} className="ranking" key={r.id}>
          <span className="rank">{i + 1}</span>
          <div>
            <div>
              <b>{r.name}</b>
              <strong>
                {metric === "spend"
                  ? money(r.spend)
                  : num(r[metric], 1) + (metric === "issued" ? "좌" : "%")}
              </strong>
            </div>
            <div className="track">
              <i
                style={{
                  width: Math.max(0, (r[metric] / max) * 100) + "%",
                  background: r.color,
                }}
              />
            </div>
          </div>
        </Link>
      ))}
    </Panel>
  );
}
export function TaskPanel() {
  const { tasks, saveTasks } = useDashboard();
  return (
    <Panel
      title="주요 액션 과제"
      link="/tasks"
      subtitle="인사이트를 실행으로 연결하는 개선 활동"
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>개선과제</th>
              <th>담당부서</th>
              <th>목표 완료일</th>
              <th>진행상태</th>
              <th>관련 KPI</th>
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 4).map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tasks?id=${t.id}`}>{t.title}</Link>
                </td>
                <td>{t.department}</td>
                <td>{t.due}</td>
                <td>
                  <select
                    aria-label={`${t.title} 상태`}
                    className="status-select"
                    value={t.status}
                    onChange={(e) =>
                      saveTasks(
                        tasks.map((x) =>
                          x.id === t.id
                            ? {
                                ...x,
                                status: e.target.value as typeof t.status,
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    {["대기", "진행중", "완료", "지연"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>{t.kpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!tasks.length && <Empty />}
    </Panel>
  );
}
export function DashboardHome() {
  return (
    <>
      <KPIOverview />
      <div className="three-grid">
        <Targets />
        <Insights />
        <AlertsPanel />
      </div>
      <JourneyFlow />
      <div className="two-grid">
        <Panel
          title="이용대금 및 신규회원 추이"
          subtitle="선택 기간 월별 실적 · 샘플 데이터"
          link="/overall"
        >
          <TrendChart />
        </Panel>
        <ProductRanking />
      </div>
      <TaskPanel />
    </>
  );
}
