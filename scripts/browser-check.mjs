import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir(".local", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page
  .getByRole("heading", { name: "카드사업 통합 대시보드", exact: true })
  .waitFor();
await page.locator(".recharts-bar-rectangle").first().waitFor();
await page.screenshot({ path: ".local/dashboard-desktop.png", fullPage: true });
for (const route of [
  "/overall",
  "/journey",
  "/journey/0",
  "/journey/1",
  "/journey/2",
  "/journey/3",
  "/journey/4",
  "/products",
  "/products/p1",
  "/profitability",
  "/campaigns",
  "/alerts",
  "/tasks",
  "/reports",
]) {
  await page.goto("http://127.0.0.1:5173" + route);
  await page.locator("h1").waitFor();
  assert.equal(
    await page.getByText("화면을 불러오지 못했습니다.").count(),
    0,
    route,
  );
}
await page.goto("http://127.0.0.1:5173");
const initial = await page.locator(".kpi>strong").first().innerText();
await page.getByLabel("고객유형", { exact: true }).selectOption("법인");
assert.notEqual(await page.locator(".kpi>strong").first().innerText(), initial);
await page.getByLabel("카드유형", { exact: true }).selectOption("체크");
assert.equal(
  await page.getByLabel("카드상품", { exact: true }).locator("option").count(),
  3,
);
await page.getByRole("button", { name: "초기화", exact: true }).click();
await page.getByRole("button", { name: "발급좌수", exact: true }).click();
assert.match(await page.locator(".ranking strong").first().innerText(), /좌/);
await page.goto("http://127.0.0.1:5173/products");
await page.getByLabel("상품명 검색").fill("존재하지않음");
await page.getByText("선택한 조건에 해당하는 데이터가 없습니다.").waitFor();
await page.goto("http://127.0.0.1:5173/tasks");
await page.getByRole("button", { name: "과제 추가" }).click();
await page.getByLabel("과제명", { exact: true }).fill("브라우저 검증 과제");
await page.getByLabel("관련 KPI", { exact: true }).fill("전환율");
await page.getByRole("button", { name: "저장", exact: true }).click();
await page.getByText("브라우저 검증 과제", { exact: true }).waitFor();
await page.getByLabel("브라우저 검증 과제 상태").selectOption("완료");
await page.reload();
assert.equal(
  await page.getByLabel("브라우저 검증 과제 상태").inputValue(),
  "완료",
);
await page.goto("http://127.0.0.1:5173/alerts");
await page.locator(".alert-detail-row").first().click();
await page.getByRole("link", { name: "관련 개선과제 등록" }).click();
await page.getByRole("dialog").waitFor();
assert.ok(
  (await page.getByLabel("과제명", { exact: true }).inputValue()).length > 0,
);
await page.getByLabel("관련 KPI", { exact: true }).fill("위험고객 수");
await page.getByRole("button", { name: "저장", exact: true }).click();
await page.getByText("과제를 저장했습니다.").waitFor();
await page.goto("http://127.0.0.1:5173/campaigns");
await page
  .getByRole("button", { name: "첫 이용 웰컴 프로그램", exact: true })
  .click();
await page
  .getByRole("heading", { name: "첫 이용 웰컴 프로그램 · 효과 분석" })
  .waitFor();
await page.goto("http://127.0.0.1:5173/journey");
await page.getByLabel("출발 단계").selectOption("3");
assert.match(await page.locator(".flow-origin").innerText(), /거래감소기/);
await page.goto("http://127.0.0.1:5173/reports");
const download = page.waitForEvent("download");
await page.getByRole("button", { name: "CSV 다운로드" }).first().click();
assert.match((await download).suggestedFilename(), /\.csv$/);
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173");
await page.screenshot({ path: ".local/dashboard-mobile.png", fullPage: true });
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  "모바일 가로 넘침",
);
await browser.close();
assert.deepEqual(errors, []);
console.log(
  "PASS: 15 routes, filters, ranking tabs, empty search, task persistence, CSV download, mobile layout; no browser errors",
);
