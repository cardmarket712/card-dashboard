import { useDashboard } from "../hooks/useDashboard";
import { customerProfile } from "../services/customerProfile";
import { num, money } from "../utils/format";
import { Panel, Metric, Empty, ExportButton } from "./common";
import { ComparisonChart } from "./charts";
export function CustomerBehavior({ stage }: { stage: number }) {
  const { filters } = useDashboard();
  const rows = customerProfile(filters, stage);
  const total = rows.reduce((a, r) => a + r.weight, 0);
  const weighted = (
    key:
      | "spend"
      | "baseline"
      | "firstDays"
      | "frequency"
      | "lastDays"
      | "declineMonths"
      | "profit",
  ) => rows.reduce((a, r) => a + r[key] * r.weight, 0);
  const count = (fn: (r: (typeof rows)[number]) => boolean) =>
    rows.filter(fn).reduce((a, r) => a + r.weight, 0);
  const avg = (key: Parameters<typeof weighted>[0]) =>
    total ? weighted(key) / total : 0;
  const rate = (n: number) => num(total ? (n / total) * 100 : 0, 1) + "%";
  const metrics = [
    [
      ["발급 이후 첫 이용률", rate(count((r) => r.firstUsed))],
      ["첫 이용까지 평균 소요일", num(avg("firstDays"), 1) + "일"],
      ["미이용 마케팅 대상", num(count((r) => !r.firstUsed)) + "명"],
      ["패널 이용대금", money(weighted("spend") / 1e8)],
    ],
    [
      ["발급 후 1개월 이용률", rate(count((r) => r.monthUsage[0]))],
      ["발급 후 2개월 이용률", rate(count((r) => r.monthUsage[1]))],
      ["발급 후 3개월 이용률", rate(count((r) => r.monthUsage[2]))],
      ["최초 이용 후 재이용률", rate(count((r) => r.reused))],
      ["미활성 고객 비중", rate(count((r) => !r.firstUsed))],
      ["패널 초기 이용대금", money(weighted("spend") / 1e8)],
    ],
    [
      ["고객당 월평균 이용대금", num(avg("spend")) + "원"],
      ["월평균 이용횟수", num(avg("frequency"), 1) + "회"],
      ["고객당 수익 기여", num(avg("profit")) + "원"],
      ["평균 최근 이용 경과일", num(avg("lastDays"), 1) + "일"],
    ],
    [
      [
        "이전 정상 수준 대비 이용대금 감소율",
        num(
          weighted("baseline")
            ? (weighted("spend") / weighted("baseline") - 1) * 100
            : 0,
          1,
        ) + "%",
      ],
      ["감소 추세 평균 지속기간", num(avg("declineMonths"), 1) + "개월"],
      ["선제 마케팅 접촉 고객", num(count((r) => r.contacted)) + "명"],
      [
        "접촉 고객 반응률",
        num(
          count((r) => r.contacted)
            ? (count((r) => r.responded) / count((r) => r.contacted)) * 100
            : 0,
          1,
        ) + "%",
      ],
    ],
    [
      ["고위험 고객", num(count((r) => r.risk === "높음")) + "명"],
      ["평균 최근 이용 경과일", num(avg("lastDays"), 1) + "일"],
      ["90일 이상 미이용", num(count((r) => r.lastDays >= 90)) + "명"],
      ["마케팅 접촉 고객", num(count((r) => r.contacted)) + "명"],
    ],
  ][stage];
  const key =
    stage === 0
      ? "channel"
      : stage === 2
        ? "industry"
        : stage === 4
          ? "risk"
          : "age";
  const values = [...new Set(rows.map((r) => r[key]))];
  return (
    <>
      <Panel
        title="단계별 행동 및 관리지표"
        subtitle="동일 고객 패널의 합성 관측값 · 전체 KPI와 별도 모집단"
      >
        <div className="metric-grid">
          {metrics.map(([label, value]) => (
            <Metric key={label} label={label} value={value} />
          ))}
        </div>
        {!total && <Empty />}
      </Panel>
      <div className="two-grid">
        <Panel
          title={
            stage === 0
              ? "유입채널별 고객 분포"
              : stage === 2
                ? "주요 소비 업종"
                : stage === 4
                  ? "이탈 위험 수준별 고객 분포"
                  : "고객 연령별 분포"
          }
        >
          <ComparisonChart
            rows={values.map((name) => ({
              name,
              value: count((r) => r[key] === name),
            }))}
          />
        </Panel>
        <Panel
          title="고객 행동 관측"
          subtitle="익명 샘플 20개 레코드 · 1개 레코드당 100명 가중치"
          tools={
            <ExportButton
              name="익명-고객행동-샘플"
              rows={rows.map((r) => ({
                익명ID: r.id,
                가중치: r.weight,
                연령: r.age,
                이용대금: r.spend,
                최근이용경과일: r.lastDays,
                감소지속개월: r.declineMonths,
                접촉: r.contacted ? "Y" : "N",
              }))}
            />
          }
        >
          <div className="table-wrap" style={{ maxHeight: 235 }}>
            <table>
              <thead>
                <tr>
                  <th>익명 식별번호</th>
                  <th>이용대금</th>
                  <th>최근 이용</th>
                  <th>접촉</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{num(r.spend)}원</td>
                    <td>{r.lastDays}일 전</td>
                    <td>{r.contacted ? "완료" : "미접촉"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
