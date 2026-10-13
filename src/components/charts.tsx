import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Legend,
} from "recharts";
import { useDashboard } from "../hooks/useDashboard";
import { colors, months, stages } from "../data/mockData";
import { journey } from "../services/analytics";
import { num } from "../utils/format";
const axis = { fontSize: 11, fill: "#8793a6" };
export function Sparkline({
  values,
  color = "#0879d5",
}: {
  values: number[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={values.map((value) => ({ value }))}>
        <Area
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.07}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function TrendChart({ profit = false }: { profit?: boolean }) {
  const { data } = useDashboard();
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data.history}
          margin={{ top: 12, right: 5, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 4"
            vertical={false}
            stroke="#edf0f5"
          />
          <XAxis
            dataKey="month"
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(v: number, name: string) => [num(v, 1), name]}
            contentStyle={{ borderRadius: 10, borderColor: "#e5eaf2" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          />
          <Bar
            isAnimationActive={false}
            yAxisId="left"
            dataKey={profit ? "revenue" : "spend"}
            name={profit ? "수익 (억원)" : "이용대금 (억원)"}
            fill="#2787d7"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
          {profit && (
            <Bar
              isAnimationActive={false}
              yAxisId="left"
              dataKey="cost"
              name="비용 (억원)"
              fill="#bacce2"
              radius={[4, 4, 0, 0]}
            />
          )}
          <Line
            isAnimationActive={false}
            yAxisId="right"
            type="monotone"
            dataKey={profit ? "profit" : "members"}
            name={profit ? "순이익 (억원)" : "신규회원 (명)"}
            stroke="#e3a24e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
export function StageHistory() {
  const { filters: f } = useDashboard();
  const m = months.indexOf(f.month);
  const rows = months.slice(m - f.period + 1, m + 1).map((month) => {
    const j = journey(f, month);
    return {
      month: month.slice(5),
      ...Object.fromEntries(
        j.current.map((v, i) => [stages[i], j.total ? (v / j.total) * 100 : 0]),
      ),
    };
  });
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid vertical={false} stroke="#edf0f5" />
          <XAxis dataKey="month" tick={axis} />
          <YAxis unit="%" tick={axis} />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {stages.map((s, i) => (
            <Bar
              isAnimationActive={false}
              key={s}
              dataKey={s}
              stackId="a"
              fill={colors[i]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function ComparisonChart({
  rows,
}: {
  rows: { name: string; value: number }[];
}) {
  return (
    <div className="chart short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ left: 15, right: 20 }}
        >
          <CartesianGrid horizontal={false} stroke="#edf0f5" />
          <XAxis type="number" tick={axis} />
          <YAxis
            type="category"
            dataKey="name"
            width={85}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(v: number) => num(v, 1)} />
          <Bar
            isAnimationActive={false}
            dataKey="value"
            name="값"
            fill="#2685d2"
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
