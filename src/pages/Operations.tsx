import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  FileText,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import {
  Panel,
  Metric,
  Badge,
  Delta,
  Empty,
  ExportButton,
} from "../components/common";
import { Button } from "../components/ui/button";
import { useDashboard } from "../hooks/useDashboard";
import { actions, stages } from "../data/mockData";
import { num, money, csv } from "../utils/format";
import type { Task } from "../types";
export function Campaigns() {
  const { data: d, filters } = useDashboard();
  const [selected, setSelected] = useState<number | null>(null);
  const rows = d.campaigns;
  const detail = rows.find((r) => r.id === selected);
  return (
    <>
      <div className="metric-grid">
        <Metric label="운영 캠페인" value={rows.length + "건"} />
        <Metric
          label="발송 고객"
          value={num(rows.reduce((a, r) => a + r.sent, 0)) + "명"}
        />
        <Metric
          label="단순 이용대금"
          value={money(rows.reduce((a, r) => a + r.spend, 0))}
        />
        <Metric
          label="마케팅 비용"
          value={money(rows.reduce((a, r) => a + r.cost, 0))}
        />
      </div>
      <Panel
        title="고객여정별 캠페인 성과"
        subtitle="샘플 캠페인 · 이용대금과 대조군 기반 증분 추정을 구분합니다."
        tools={<ExportButton rows={rows} />}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>캠페인 / 대상 단계</th>
                <th>대상 / 발송</th>
                <th>응모 / 반응 / 이용</th>
                <th>반응률</th>
                <th>이용대금</th>
                <th>증분 이용대금</th>
                <th>비용</th>
                <th>추정 ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setSelected(r.id)}
                    >
                      {r.title}
                    </button>
                    <small className="block">
                      {r.stage} · {filters.month}-01 ~ 말일 · 종료
                    </small>
                  </td>
                  <td>
                    {num(r.target)} / {num(r.sent)}
                  </td>
                  <td>
                    {num(r.applied)} / {num(r.responded)} / {num(r.users)}
                  </td>
                  <td>{num(r.rate, 1)}%</td>
                  <td>{money(r.spend)}</td>
                  <td>
                    {r.increment === null
                      ? "대조군 없음"
                      : money(r.increment) + " (추정)"}
                  </td>
                  <td>{money(r.cost)}</td>
                  <td>{r.roi === null ? "산출 불가" : num(r.roi, 1) + "%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {detail && (
        <Panel title={`${detail.title} · 효과 분석`}>
          <div className="metric-grid">
            <Metric
              label="대상군 1인당 이용대금"
              value={
                num(detail.sent ? (detail.spend * 1e8) / detail.sent : 0) + "원"
              }
            />
            <Metric
              label="대조군 인원 / 이용 고객"
              value={
                detail.control
                  ? `${num(detail.controlSize)} / ${num(detail.controlUsers)}명`
                  : "대조군 없음"
              }
            />
            <Metric
              label="대조군 1인당 이용대금"
              value={
                detail.control
                  ? num(
                      detail.controlSize
                        ? (detail.controlSpend * 1e8) / detail.controlSize
                        : 0,
                    ) + "원"
                  : "산출 불가"
              }
            />
            <Metric label="종료 후 지속효과" value="후속 관측 대기" />
          </div>
          <p className="footnote">
            증분 추정 = (대상군 1인당 이용대금 − 대조군 1인당 이용대금) × 발송
            인원. ROI = (증분 이용대금 × 가정 기여이익률 2% − 마케팅 비용) ÷
            마케팅 비용 × 100. 무작위 배정 검증이 없는 샘플 추정치이며
            인과효과를 확정하지 않습니다.
          </p>
        </Panel>
      )}
      <Panel title="성과 해석 기준">
        <p className="body-copy">
          모든 캠페인은 합성 샘플입니다. 대조군이 없는 캠페인은 관측 이용대금만
          표시하며 증분 효과와 ROI를 산출하지 않습니다. 종료 후 지속효과는 후속
          기간을 수집한 뒤 비교하도록 구분했습니다.
        </p>
      </Panel>
    </>
  );
}
export function Alerts() {
  const { data: d, filters } = useDashboard();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(params.get("id") ?? "");
  const alert = d.alerts.find((a) => a.id === selected);
  return (
    <>
      <div className="metric-grid">
        <Metric label="전체 경보" value={d.alerts.length + "건"} />
        <Metric
          label="긴급"
          value={d.alerts.filter((a) => a.level === "긴급").length + "건"}
        />
        <Metric
          label="주의"
          value={d.alerts.filter((a) => a.level === "주의").length + "건"}
        />
        <Metric label="집계 기준월" value={filters.month} />
      </div>
      <Panel
        title="주요 경보 및 이상징후"
        subtitle="고객 위험지표는 증가를, 실적지표는 감소를 위험으로 평가합니다."
      >
        {d.alerts.map((a) => (
          <button
            key={a.id}
            className={`alert-detail-row ${a.id === selected ? "selected" : ""}`}
            onClick={() => setSelected(a.id)}
          >
            <TriangleAlert
              className={a.level === "긴급" ? "negative" : "warning"}
              size={21}
            />
            <b>{a.title}</b>
            <Delta value={a.change} reverse={a.stage !== undefined} />
            <span>{filters.month} 말일</span>
            <Badge tone={a.level === "긴급" ? "red" : "orange"}>
              {a.level}
            </Badge>
            <ArrowRight size={17} />
          </button>
        ))}
        {!d.alerts.length && (
          <Empty text="선택한 조건에서 기준값을 초과한 경보가 없습니다." />
        )}
      </Panel>
      {alert && (
        <Panel title={`${alert.title} · 원인 분석`}>
          <p className="body-copy">{alert.detail}</p>
          <div className="insight-banner">
            <div>
              <b>추천 조치</b>
              <p>{alert.recommendation}</p>
            </div>
            <Link
              className="button primary"
              to={`/tasks?new=${encodeURIComponent(alert.recommendation)}&alert=${alert.id}`}
            >
              관련 개선과제 등록 <Plus size={15} />
            </Link>
          </div>
          {alert.stage !== undefined && (
            <Link className="more" to={`/journey/${alert.stage}`}>
              고객여정 상세 분석 <ArrowRight size={14} />
            </Link>
          )}
        </Panel>
      )}
    </>
  );
}
const emptyTask = (title = "", alertId?: string): Task => ({
  id: crypto.randomUUID(),
  title,
  department: "회원마케팅팀",
  created: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  ),
  due: "2026-10-30",
  status: "대기",
  kpi: "",
  expected: "",
  actual: "측정 대기",
  alertId,
});
export function Tasks() {
  const { tasks, saveTasks, storageError } = useDashboard();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Task | null>(() =>
    params.has("new")
      ? emptyTask(params.get("new") ?? "", params.get("alert") ?? undefined)
      : (tasks.find((t) => t.id === params.get("id")) ?? null),
  );
  const [status, setStatus] = useState("전체");
  const [department, setDepartment] = useState("전체");
  const [notice, setNotice] = useState("");
  const shown = tasks.filter(
    (t) =>
      (status === "전체" || t.status === status) &&
      (department === "전체" || t.department === department),
  );
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editing.title.trim() || editing.due < editing.created)
      return;
    const next = tasks.some((t) => t.id === editing.id)
      ? tasks.map((t) => (t.id === editing.id ? editing : t))
      : [editing, ...tasks];
    saveTasks(next);
    setEditing(null);
    setParams({});
    setNotice("과제를 저장했습니다.");
  }
  return (
    <>
      <div className="metric-grid">
        <Metric label="전체 개선과제" value={tasks.length + "건"} />
        <Metric
          label="진행중"
          value={tasks.filter((t) => t.status === "진행중").length + "건"}
        />
        <Metric
          label="완료율"
          value={
            num(
              tasks.length
                ? (tasks.filter((t) => t.status === "완료").length /
                    tasks.length) *
                    100
                : 0,
              1,
            ) + "%"
          }
        />
        <Metric
          label="지연"
          value={tasks.filter((t) => t.status === "지연").length + "건"}
        />
      </div>
      {(storageError || notice) && (
        <div role="status" className="notice">
          {storageError || notice}
        </div>
      )}
      <Panel
        title="개선과제 관리"
        subtitle="등록부터 실행, 성과 확인까지 한곳에서 관리합니다."
        tools={
          <Button onClick={() => setEditing(emptyTask())}>
            <Plus size={15} /> 과제 추가
          </Button>
        }
      >
        <div className="table-toolbar">
          <select
            aria-label="과제 상태 필터"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["전체", "대기", "진행중", "완료", "지연"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="담당부서 필터"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {["전체", ...new Set(tasks.map((t) => t.department))].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ExportButton rows={shown.map((t) => ({ ...t }))} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>과제명 / 관련 KPI</th>
                <th>담당부서</th>
                <th>등록일 / 목표 완료일</th>
                <th>상태</th>
                <th>기대효과</th>
                <th>실제 성과</th>
                <th>수정</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id}>
                  <td>
                    <b>{t.title}</b>
                    <small className="block">
                      {t.kpi || "미지정"} {t.alertId && "· 경보 연계"}
                    </small>
                  </td>
                  <td>{t.department}</td>
                  <td>
                    {t.created}
                    <small className="block">{t.due}</small>
                  </td>
                  <td>
                    <select
                      aria-label={`${t.title} 상태`}
                      value={t.status}
                      onChange={(e) =>
                        saveTasks(
                          tasks.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  status: e.target.value as Task["status"],
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
                  <td>{t.expected || "미등록"}</td>
                  <td>{t.actual || "측정 대기"}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`${t.title} 수정`}
                      onClick={() => setEditing(t)}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!shown.length && <Empty />}
      </Panel>
      {editing && (
        <div
          className="modal-backdrop"
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-title"
          >
            <h2 id="task-title">
              {tasks.some((t) => t.id === editing.id)
                ? "개선과제 수정"
                : "새 개선과제 등록"}
            </h2>
            <form onSubmit={save}>
              <label>
                과제명
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label>
                  담당부서
                  <input
                    required
                    value={editing.department}
                    onChange={(e) =>
                      setEditing({ ...editing, department: e.target.value })
                    }
                  />
                </label>
                <label>
                  목표 완료일
                  <input
                    type="date"
                    required
                    min={editing.created}
                    value={editing.due}
                    onChange={(e) =>
                      setEditing({ ...editing, due: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                관련 KPI
                <input
                  required
                  value={editing.kpi}
                  onChange={(e) =>
                    setEditing({ ...editing, kpi: e.target.value })
                  }
                />
              </label>
              <label>
                기대효과
                <textarea
                  value={editing.expected}
                  onChange={(e) =>
                    setEditing({ ...editing, expected: e.target.value })
                  }
                />
              </label>
              <label>
                실제 성과 / 이전 기간 또는 대조군 비교
                <textarea
                  placeholder="예: 시행 전 8.1% → 시행 후 9.2%, 동일 고객 기준"
                  value={editing.actual}
                  onChange={(e) =>
                    setEditing({ ...editing, actual: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setParams({});
                  }}
                >
                  취소
                </Button>
                <Button type="submit">저장</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
export function Reports() {
  const { data: d, filters, tasks } = useDashboard();
  const reports = [
    {
      title: "월간 카드사업 보고서",
      description: "주요 KPI 및 월별 이용대금·신규회원 추이",
      rows: d.history,
    },
    {
      title: "고객여정 분석 보고서",
      description: "5단계 고객 구성 및 동일 고객 전환 매트릭스",
      rows: d.journey.matrix.map((r, i) => ({
        단계: stages[i],
        당월고객: d.journey.current[i],
        전월고객: d.journey.previous[i],
        ...Object.fromEntries(r.map((v, s) => [stages[s] + " 이동", v])),
      })),
    },
    {
      title: "상품별 실적 보고서",
      description: "발급·이용대금·성장률·수익성 비교",
      rows: d.ranking,
    },
    {
      title: "개선과제 실행 보고서",
      description: "담당부서·진행상태·기대효과·실제 성과",
      rows: tasks.map((t) => ({ ...t })),
    },
  ];
  return (
    <>
      <div className="report-intro">
        <FileText size={30} />
        <div>
          <h2>데이터를 다음 의사결정으로</h2>
          <p>
            {filters.month} · 현재 필터가 적용된 샘플 데이터를 CSV로
            다운로드합니다.
          </p>
        </div>
      </div>
      <div className="two-grid">
        {reports.map((r) => (
          <Panel key={r.title} title={r.title} subtitle={r.description}>
            <div className="report-body">
              <FileText size={38} strokeWidth={1.3} />
              <span>
                {r.rows.length}개 행 · UTF-8 BOM · Excel에서 열기 지원
              </span>
            </div>
            <Button
              disabled={!r.rows.length}
              variant="outline"
              onClick={() => csv(`${r.title}-${filters.month}-샘플`, r.rows)}
            >
              CSV 다운로드
            </Button>
          </Panel>
        ))}
      </div>
      <p className="footnote">
        모든 자료는 개발용 샘플입니다. 실제 IBK 경영정보가 아니며, 과제 보고서는
        분석 필터와 별개의 전체 로컬 과제를 포함합니다.
      </p>
    </>
  );
}
