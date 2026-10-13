import { useState, Component, type ReactNode } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Route as RouteIcon,
  CreditCard,
  ChartPie,
  Megaphone,
  Bell,
  ListChecks,
  FileDown,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { DashboardProvider, useDashboard } from "./hooks/useDashboard";
import { FilterBar, Badge, Empty } from "./components/common";
import { DashboardHome } from "./components/dashboard";
import {
  Overall,
  JourneyOverview,
  JourneyDetail,
  Products,
  ProductDetail,
  Profitability,
} from "./pages/Analysis";
import { Alerts, Tasks, Campaigns, Reports } from "./pages/Operations";
import { stages } from "./data/mockData";
import { defaultFilters } from "./services/analytics";
const menus = [
  { path: "/", label: "대시보드 홈", icon: LayoutDashboard },
  { path: "/overall", label: "전체 현황", icon: ChartNoAxesCombined },
  { path: "/journey", label: "고객여정 5단계", icon: RouteIcon },
  { path: "/products", label: "상품 실적", icon: CreditCard },
  { path: "/profitability", label: "수익성 분석", icon: ChartPie },
  { path: "/campaigns", label: "캠페인 성과", icon: Megaphone },
  { path: "/alerts", label: "경보 / 이슈", icon: Bell },
  { path: "/tasks", label: "액션 과제", icon: ListChecks },
  { path: "/reports", label: "보고서 다운로드", icon: FileDown },
];
function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { data, filters, setFilters } = useDashboard();
  const menu = menus.find((m) =>
    m.path === "/" ? pathname === "/" : pathname.startsWith(m.path),
  );
  const title = menu?.label ?? "페이지를 찾을 수 없습니다";
  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <strong>
            <em>IBK</em>
            <span>기업은행</span>
          </strong>
          <small>Card Business Dashboard</small>
        </Link>
        <div className="nav-label">CARD BUSINESS</div>
        <nav>
          {menus.map(({ path, label, icon: Icon }, i) => (
            <div key={path} className={i === 6 ? "nav-section" : ""}>
              <div className="nav-row">
                <NavLink to={path} end={path === "/"} title={label}>
                  <Icon size={19} />
                  <span>{label}</span>
                  {path === "/alerts" && data.alerts.length > 0 && (
                    <b className="nav-count">{data.alerts.length}</b>
                  )}
                </NavLink>
                {path === "/journey" && !collapsed && (
                  <button
                    aria-label="고객여정 하위 메뉴"
                    aria-expanded={expanded}
                    className="expand"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: expanded ? "rotate(180deg)" : undefined,
                      }}
                    />
                  </button>
                )}
              </div>
              {path === "/journey" && expanded && !collapsed && (
                <div className="subnav">
                  {stages.map((s, i) => (
                    <NavLink key={s} to={`/journey/${i}`}>
                      {s}
                    </NavLink>
                  ))}
                  <NavLink end to="/journey">
                    고객여정 전환 분석
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="data-status">
            <ShieldCheck size={18} />
            <div>
              <b>샘플 데이터 환경</b>
              <small>실제 은행 실적과 무관합니다</small>
            </div>
          </div>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="사이드바 펼침/접힘"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>메뉴 접기</span>
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            카드사업 관리 <ChevronRight size={13} />
            <b>{title}</b>
          </div>
          <div className="topbar-right">
            <span className="online-dot" />
            샘플 데이터<Badge>내부 분석용</Badge>
            <Link to="/alerts" aria-label="경보 확인" className="notification">
              <Bell size={18} />
              {data.alerts.length > 0 && <i />}
            </Link>
            <div className="avatar">IBK</div>
            <span>카드사업부</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">IBK CARD BUSINESS INSIGHTS</div>
              <h1>{pathname === "/" ? "카드사업 통합 대시보드" : title}</h1>
              <p>
                {pathname === "/"
                  ? "실적을 한눈에, 고객을 더 깊이. 데이터로 연결하는 카드사업의 다음 성장."
                  : "데이터를 탐색하고, 실행 가능한 개선 방향을 확인하세요."}
              </p>
            </div>
            <div className="heading-actions">
              <span>
                기준일 <b>{filters.month.replace("-", ".")} 말일</b>
              </span>
              <Link className="button outline" to="/reports">
                <FileDown size={15} /> 보고서 다운로드
              </Link>
            </div>
          </div>
          <div className="filter-heading">
            <span>분석 조건</span>
            <button
              className="text-button"
              onClick={() => setFilters(defaultFilters)}
            >
              <RotateCcw size={12} /> 초기화
            </button>
          </div>
          <FilterBar />
          <div className="page-content" key={pathname}>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/overall" element={<Overall />} />
              <Route path="/journey" element={<JourneyOverview />} />
              <Route path="/journey/:stage" element={<JourneyDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/profitability" element={<Profitability />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/reports" element={<Reports />} />
              <Route
                path="*"
                element={
                  <Empty text="페이지를 찾을 수 없습니다. 왼쪽 메뉴에서 다시 이동해 주세요." />
                }
              />
            </Routes>
          </div>
          <footer>
            <span>IBK기업은행 · 카드사업 통합 대시보드</span>
            <span>
              샘플 데이터 · 실제 IBK 실적이 아닙니다 <ArrowUpRight size={12} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fatal">
        <h1>화면을 불러오지 못했습니다.</h1>
        <p>새로고침 후 다시 시도해 주세요. 저장된 과제는 유지됩니다.</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          새로고침
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;
  return (
    <ErrorBoundary>
      <Router>
        <DashboardProvider>
          <Layout />
        </DashboardProvider>
      </Router>
    </ErrorBoundary>
  );
}
