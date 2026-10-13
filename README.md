# IBK기업은행 카드사업 통합 대시보드

React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui 스타일 Button(Radix Slot/CVA) · Recharts · Lucide · React Router 기반의 로컬 웹 애플리케이션입니다. 서버 및 DB 없이 실행됩니다. **모든 수치는 합성 샘플이며 실제 IBK 실적이 아닙니다.** 제공된 시안/공식 로고 이미지가 없어 요청서의 구성과 색상을 적용하고 텍스트 브랜드를 사용했습니다.

## GitHub Pages 배포

`.github/workflows/deploy-pages.yml`은 `main` 브랜치에 push되면 테스트 → 빌드 → GitHub Pages 배포를 실행합니다. 저장소의 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**로 설정합니다. GitHub 연결 및 대상 저장소가 필요하며 로컬 설정 파일만 생성한 상태는 배포 완료가 아닙니다.

저장소 하위 경로는 Pages 메타데이터로 자동 적용합니다. 배포 빌드에서는 해시 라우팅(`/#/journey/3`)을 사용해 상세 페이지 새로고침 시 404를 방지합니다. 개발 서버 경로는 기존과 동일합니다. 로컬 과제는 브라우저 출처별로 저장되므로 localhost의 과제가 배포 사이트로 자동 이전되지는 않습니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 로컬 실행

**Windows에서는 프로젝트 폴더의 `start.cmd`를 더블클릭하면 됩니다.** 서버가 백그라운드에서 실행되고 기본 브라우저가 자동으로 열립니다. 실행 창을 닫아도 서버는 유지됩니다. 실행 오류 로그는 `.local/server-error.log`에서 확인할 수 있습니다.

PowerShell의 현재 폴더가 다른 경우에는 아래 절대경로 명령을 사용하세요.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\wnstn\Desktop\바이브코딩\card-dashboard\start.ps1"
```

Node.js 22 이상 환경:

```powershell
npm ci
npm run dev
```

브라우저에서 http://127.0.0.1:5173 을 엽니다. 이 개발 PC에는 사용자 로컬 런타임을 준비했으므로 다음 명령으로도 실행할 수 있습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

`start.ps1`은 설치된 Node 또는 `%LOCALAPPDATA%\card-dashboard-runtime\node-v22.16.0-win-x64`를 사용합니다. 다른 PC에서는 Node.js 설치가 필요합니다.

```powershell
npm run build  # TypeScript 검사 + dist 빌드
npm run preview
npm test       # 집계/필터/동일 고객 전환 검증
node scripts/browser-check.mjs # dev 서버 실행 상태, 설치된 Edge로 브라우저 검증
```

## 기능

- 홈: 5개 KPI, 전월·전년 비교, 목표 달성률, 개선 인사이트, 임계값 경보, 고객여정, 월별 복합 차트, 상품 랭킹 탭, 과제 상태 변경.
- 실제 라우팅: 전체 현황, 고객여정 5개 상세, 전환 매트릭스/흐름/구성비, 상품 목록/상세, 수익성, 캠페인, 경보, 과제, 보고서.
- 공통 필터: 기준월, 조회기간, 고객유형, 카드유형, 고객여정, 상품, 신규/기존. 카드유형 변경 시 상품을 초기화하고 선택 가능한 상품을 제한합니다.
- 과제 추가·수정·상태·성과 기록 및 localStorage 보존. 저장 불가 시 안내합니다. 경보 및 단계 인사이트에서 과제를 등록할 수 있습니다.
- CSV: UTF-8 BOM, 셀 따옴표 이스케이프 및 스프레드시트 수식 실행 방지. XLSX는 별도 구현하지 않았으며 Excel에서 CSV를 열 수 있습니다.
- 데스크톱/모바일 반응형, 오류 경계, 빈 검색 결과, 키보드 초점 표시.

## 데이터 및 해석

기본 조회월은 **2026-09**, 화면에서 선택 가능한 기간은 2025-10~2026-09입니다. 전년 동월 비교를 위해 2024-10부터 24개월을 보관합니다. 기간 필터는 추이 차트 길이를 변경하고 KPI는 선택 기준월을 표시합니다.

`src/data/mockData.ts`에는 상품, 월별 실적 팩트, 익명 고객 패널 및 초기 과제가 있습니다. `src/services/analytics.ts`가 dashboardSummary / monthlyPerformance / customerJourneySummary / customerJourneyHistory / customerJourneyTransitions / cardProductPerformance / profitabilityPerformance / businessAlerts에 해당하는 파생 결과를 한 번에 계산합니다. 개선 인사이트는 전환 행렬에서 도출하며, 캠페인 합성 관측값은 `src/services/campaigns.ts`에서 산출하고 화면과 경보가 공유합니다. `customerProfile.ts`에는 단계별 행동 관측값 생성 로직이 있습니다.

- 전체 이용대금 기준값 12,800억원과 상품별 합계는 같은 팩트에서 집계됩니다. 신규회원 24,530명, 순이익 184억원, 유효율 72.4%, 활성고객 862,000명입니다.
- 월별 목표는 전월 실적에 샘플 목표 성장률을 적용합니다. 실제 확정 사업목표가 아닙니다.
- 여정 패널은 5,360개 익명 레코드 × 가중치 100명 = **536,000명**입니다. 2026-09 단계별 182,000 / 157,000 / 104,000 / 61,000 / 32,000명입니다. 실제 개인 정보는 없습니다.
- 전환은 동일 레코드의 전월/당월 상태를 교차 집계합니다. 행 합계는 전월 인원, 열 합계는 당월 인원입니다. 양방향·건너뛰기 포함. 패널은 고정되어 외부 유입/탈락은 없고, 단계 신규 진입은 다른 단계에서 이동한 고객입니다.
- 여정 단계 필터를 선택해도 전환 분모를 훼손하지 않도록 여정 매트릭스와 구성비는 모든 단계를 유지합니다. 단계는 강조 표시하고 전체 KPI/캠페인에는 단계 조건을 적용합니다.
- 전체 KPI와 고객여정 패널은 **다른 모집단**입니다. 패널 관측 이용대금과 전체 팩트 이용대금을 혼합하지 않습니다. 상세 화면에서 구분합니다.
- 샘플 신규 발급은 신규회원 1인 1좌, 유효회원은 유효카드 1인 1카드 가정입니다. 가중 실적 집계의 인원/좌수는 화면에서 반올림되므로 표시 합계에 반올림 차이가 생길 수 있습니다.
- 캠페인에는 대상/발송/응모/반응/이용을 구분합니다. 대조군 있는 경우에만 1인당 성과 차이를 이용해 증분을 추정합니다. ROI는 증분에 가정 기여이익률 2%를 적용한 뒤 비용을 차감합니다. 대조군 미보유 시 증분·ROI는 산출 불가, 종료 후 효과는 후속 관측 대기입니다.
- 과제 기대효과/실제성과는 사용자가 직접 기록하며 자동으로 성과를 확정하지 않습니다.
- 경보 임계값은 `src/data/alertRules.ts`에서 설정합니다. 실적 감소와 위험고객 증가의 평가 방향을 분리합니다.

## 구조 / API 교체 지점

```text
src/
  components/       공통 UI, 대시보드, 차트, 고객 행동 지표
  components/ui/    재사용 Button
  pages/            분석 및 운영 상세 화면
  data/             샘플 데이터, 경보 기준
  hooks/            필터와 과제 Context
  services/         집계 및 고객 프로파일, Repository 인터페이스
  types/            Filters, Fact, Customer, Product, Task, Alert
  utils/            한국어 포맷 및 CSV
tests/              집계 정합성 자동 검사
scripts/            Edge 브라우저 기능 검증
```

현 `DashboardRepository.load(filters)`는 동기 Mock 어댑터이며 `useDashboard.tsx`만 이를 사용합니다. API 연동 시 비동기 Repository로 교체하고 Hook에 loading/error/AbortController 상태를 추가하십시오. 컴포넌트가 사용하는 응답 형태는 `ReturnType<typeof analytics>`입니다.

권장 API 계약:

```http
GET /api/v1/card-business/dashboard?month=2026-09&period=12&customer=전체&card=전체&stage=전체&product=전체&tenure=전체
GET /api/v1/card-business/journey/customers?month=2026-09&stage=3
GET /api/v1/card-business/campaigns?month=2026-09
GET /api/v1/card-business/tasks
POST /api/v1/card-business/tasks
PATCH /api/v1/card-business/tasks/{id}
```

Dashboard 응답은 `current`, `previous`, `year`, `history`, `journey`(matrix/current/previous/total), `alerts`, `ranking`을 포함합니다. 금액 단위는 **억원**, 인원/발급은 **명/좌**, 비율은 **0~100**, 여정 단계는 **0~4**입니다. 실제 연동에서는 `asOf`, `populationDefinition`, `sample:false`, `currency:KRW`, `unit` 메타데이터와 없는 값의 `null` 표현을 추가하고 원천 데이터 중복/모집단 기준을 검증해야 합니다. 원천 고객 식별자는 서버에서 가명화해야 하며 브라우저에 내부 인증정보를 넣지 마십시오.

과제 저장 키는 `ibk-tasks-v1`이며 현재 브라우저/출처에만 저장됩니다. 조직 공용 사용에는 서버 저장 및 인증·권한 처리가 필요합니다. 정적 배포 시 SPA 경로를 `index.html`로 fallback 설정하십시오.

## 검증 및 산출물

`npm run build`, `npm test` 및 Edge 자동 점검을 수행합니다. 브라우저 점검은 전체 경로 렌더링, 필터 종속성, 랭킹 탭, 빈 검색, 과제 저장/상태 변경/새로고침 유지, CSV, 모바일 가로 넘침을 검사합니다. 로컬 화면 캡처는 `.local/`에 생성됩니다. 공식 시안 이미지가 없어 이미지 일치 여부는 검증할 수 없습니다.
