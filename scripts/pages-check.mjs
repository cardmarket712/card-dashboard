import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('http://127.0.0.1:4173/card-dashboard/');
  await page.getByRole('heading', { name: '카드사업 통합 대시보드', exact: true }).waitFor();
  await page.locator('nav').getByRole('link', { name: '상품 실적' }).click();
  assert.match(page.url(), /#\/products$/);
  await page.locator('.product-name').first().click();
  await page.reload();
  await page.getByRole('heading', { name: 'IBK 무민 카드', exact: true }).waitFor();
  await page.goto('http://127.0.0.1:4173/card-dashboard/#/journey/3');
  await page.getByRole('heading', { name: '거래감소기', exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: Pages subpath assets, menu routing, product detail refresh, journey direct link');
} finally {
  await browser.close();
}
