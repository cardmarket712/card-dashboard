import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Info, ChevronRight, Download } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { months, products, stages } from "../data/mockData";
import { Button } from "./ui/button";
import { csv } from "../utils/format";
export function Panel({
  title,
  subtitle,
  children,
  link,
  tools,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  link?: string;
  tools?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {tools}
        {link && (
          <Link className="more" to={link}>
            전체보기 <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Empty({
  text = "선택한 조건에 해당하는 데이터가 없습니다.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Info size={25} />
      <p>{text}</p>
    </div>
  );
}
export function Delta({
  value,
  unit = "%",
  reverse = false,
}: {
  value: number;
  unit?: string;
  reverse?: boolean;
}) {
  return (
    <span
      className={`delta ${(reverse ? value <= 0 : value >= 0) ? "positive" : "negative"}`}
    >
      <ArrowUpRight
        size={13}
        style={{ transform: value < 0 ? "rotate(90deg)" : undefined }}
      />
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}
      {unit}
    </span>
  );
}
export function FilterBar() {
  const { filters: f, setFilters } = useDashboard();
  function set(key: keyof typeof f, value: string) {
    setFilters({
      ...f,
      [key]: key === "period" ? Number(value) : value,
      ...(key === "card" ? { product: "전체" } : {}),
    });
  }
  return (
    <div className="filters">
      <label>
        기준월
        <select
          aria-label="기준월"
          value={f.month}
          onChange={(e) => set("month", e.target.value)}
        >
          {months
            .slice(12)
            .reverse()
            .map((m) => (
              <option key={m}>{m}</option>
            ))}
        </select>
      </label>
      <label>
        조회기간
        <select
          aria-label="조회기간"
          value={f.period}
          onChange={(e) => set("period", e.target.value)}
        >
          {[3, 6, 12].map((n) => (
            <option key={n} value={n}>
              최근 {n}개월
            </option>
          ))}
        </select>
      </label>
      {(
        [
          ["customer", "고객유형", ["전체", "개인", "개인사업자", "법인"]],
          ["card", "카드유형", ["전체", "신용", "체크"]],
          ["tenure", "고객구분", ["전체", "신규", "기존"]],
        ] as const
      ).map(([key, label, values]) => (
        <label key={key}>
          {label}
          <select
            aria-label={label}
            value={f[key]}
            onChange={(e) => set(key, e.target.value)}
          >
            {values.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      ))}
      <label>
        고객여정
        <select
          aria-label="고객여정"
          value={f.stage}
          onChange={(e) => set("stage", e.target.value)}
        >
          <option>전체</option>
          {stages.map((s, i) => (
            <option key={s} value={i}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        카드상품
        <select
          aria-label="카드상품"
          value={f.product}
          onChange={(e) => set("product", e.target.value)}
        >
          <option>전체</option>
          {products
            .filter((p) => f.card === "전체" || p.card === f.card)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
export function ExportButton({
  rows,
  name = "IBK-샘플데이터",
}: {
  rows: Record<string, unknown>[];
  name?: string;
}) {
  return (
    <Button
      variant="outline"
      disabled={!rows.length}
      onClick={() => csv(name, rows)}
    >
      <Download size={15} /> CSV 다운로드
    </Button>
  );
}
export function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
