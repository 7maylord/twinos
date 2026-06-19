import 'dotenv/config';
import { GET as callbackGet } from '../app/api/integrations/quickbooks/callback/route';
import { POST as qboSyncPost } from '../app/api/integrations/quickbooks/sync/route';
import { POST as shopifySyncPost } from '../app/api/integrations/shopify/sync/route';
import { POST as squareSyncPost } from '../app/api/integrations/square/sync/route';
import { POST as runPost } from '../app/api/scenarios/run/route';
import { prisma } from '../lib/db';
import { decrypt } from '../lib/encryption';
import assert from 'assert';

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

async function runTest() {
  console.log('\n--- Running TwinOS Integration Pipeline Test ---\n');

  // 1. Setup / Identify Business
  let business = await prisma.business.findFirst({
    include: { products: true, employees: true }
  });

  if (!business) {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'test-pipeline@example.com' }
      });
    }
    business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: 'Pipeline Test Cafe',
        industry: 'Food & Beverage',
        baselineRevenue: 150000.0,
        baselineFixedCosts: 25000.0,
        baselineMarketing: 10000.0,
        baselineInventory: 20000.0,
      },
      include: { products: true, employees: true }
    });
  }

  const businessId = business.id;
  console.log(`Using Business: ${business.name} (ID: ${businessId})`);
  console.log(`Original Baselines: Revenue=$${business.baselineRevenue}, Fixed Costs=$${business.baselineFixedCosts}`);
  console.log(`Original Counts: Products=${business.products.length}, Employees=${business.employees.length}\n`);

  // 2. Simulate QBO Connect (OAuth callback code exchange)
  console.log('Step 2: Simulating QuickBooks Online OAuth Callback...');
  const callbackUrl = `http://localhost/api/integrations/quickbooks/callback?code=mock-oauth-auth-code&state=${businessId}&realmId=test-company-123`;
  const callbackRequest = new Request(callbackUrl);
  const callbackResponse = await callbackGet(callbackRequest);
  
  assert.strictEqual(callbackResponse.status, 307, 'Should redirect on successful callback');
  
  let updatedBusiness = await prisma.business.findUnique({
    where: { id: businessId }
  });
  
  assert.ok(updatedBusiness?.qboAccessToken, 'Should have qboAccessToken in database');
  assert.ok(updatedBusiness?.qboRefreshToken, 'Should have qboRefreshToken in database');
  assert.strictEqual(updatedBusiness?.qboCompanyId, 'test-company-123', 'Should save correct QBO Company ID');
  
  const decryptedAccessToken = decrypt(updatedBusiness.qboAccessToken);
  assert.ok(decryptedAccessToken.startsWith('mock-access-token'), 'Token should be encrypted and decrypted correctly');
  console.log(green('✓ QuickBooks OAuth connect simulation succeeded. Tokens encrypted and saved.'));

  // 3. Simulate QBO Sync (Fetch Profit & Loss report and update baselines)
  console.log('\nStep 3: Simulating QuickBooks Online Financial Sync...');
  const syncUrl = `http://localhost/api/integrations/quickbooks/sync?businessId=${businessId}`;
  const syncRequest = new Request(syncUrl, {
    method: 'POST',
    body: JSON.stringify({ businessId })
  });
  const syncResponse = await qboSyncPost(syncRequest);
  assert.strictEqual(syncResponse.status, 200, 'Sync should return 200');
  
  const syncData = await syncResponse.json();
  assert.ok(syncData.success, 'Sync should indicate success');
  
  updatedBusiness = await prisma.business.findUnique({
    where: { id: businessId }
  });
  
  assert.strictEqual(updatedBusiness?.baselineRevenue, 220000.0, 'Baseline Revenue should be updated to synced value');
  assert.strictEqual(updatedBusiness?.baselineFixedCosts, 32000.0, 'Baseline Fixed Costs should be updated to synced value');
  console.log(green('✓ QuickBooks financial sync succeeded. Business baselines updated.'));

  // 4. Simulate Shopify Sync (Add products to catalog)
  console.log('\nStep 4: Simulating Shopify Product Sync...');
  const shopifyUrl = `http://localhost/api/integrations/shopify/sync`;
  const shopifyRequest = new Request(shopifyUrl, {
    method: 'POST',
    body: JSON.stringify({ businessId, shopifyStoreDomain: 'pipeline-test.myshopify.com' })
  });
  const shopifyResponse = await shopifySyncPost(shopifyRequest);
  assert.strictEqual(shopifyResponse.status, 200, 'Shopify sync should return 200');
  
  const shopifyData = await shopifyResponse.json();
  assert.ok(shopifyData.success, 'Shopify sync should indicate success');
  
  const shopifyProduct = await prisma.product.findFirst({
    where: { businessId, name: 'Shopify Matcha Latte' }
  });
  assert.ok(shopifyProduct, 'Shopify Matcha Latte product should exist in database');
  assert.strictEqual(shopifyProduct.price, 6.50);
  assert.strictEqual(shopifyProduct.cost, 1.80);
  console.log(green('✓ Shopify product sync succeeded. Imported product into catalog.'));

  // 5. Simulate Square POS Sync (Add employee to payroll)
  console.log('\nStep 5: Simulating Square POS Employee Shift Logs Sync...');
  const squareUrl = `http://localhost/api/integrations/square/sync`;
  const squareRequest = new Request(squareUrl, {
    method: 'POST',
    body: JSON.stringify({ businessId })
  });
  const squareResponse = await squareSyncPost(squareRequest);
  assert.strictEqual(squareResponse.status, 200, 'Square sync should return 200');
  
  const squareData = await squareResponse.json();
  assert.ok(squareData.success, 'Square sync should indicate success');
  
  const squareEmployee = await prisma.employee.findFirst({
    where: { businessId, name: 'Square Shift Barista' }
  });
  assert.ok(squareEmployee, 'Square Shift Barista employee should exist in database');
  assert.strictEqual(squareEmployee.salary, 3800.0);
  console.log(green('✓ Square POS employee sync succeeded. Imported employee to payroll roster.'));

  // 6. Run Scenario Simulation using Synced Data
  console.log('\nStep 6: Executing Scenario Simulation using updated pipelines...');
  const runUrl = `http://localhost/api/scenarios/run`;
  const runRequest = new Request(runUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Post-Integration Optimization Run',
      priceIncrease: 10,
      employeeCount: 12,
      marketingBudget: 15000,
      supplierDelay: 'none',
      businessId
    })
  });
  
  const runResponse = await runPost(runRequest);
  assert.strictEqual(runResponse.status, 200, 'Running scenario should succeed');
  
  const runResult = await runResponse.json();
  assert.ok(runResult.result, 'Should return simulation result record');
  
  console.log(`Simulation Output:`);
  console.log(`- Projected Revenue: $${runResult.result.projectedRevenue.toFixed(2)}`);
  console.log(`- Projected Profit: $${runResult.result.projectedProfit.toFixed(2)}`);
  console.log(`- Projected Inventory Risk: ${(runResult.result.projectedInventoryRisk * 100).toFixed(1)}%`);

  assert.ok(runResult.result.projectedRevenue > 220000.0, 'Projected revenue should reflect updated QuickBooks baseline revenue');
  console.log(green('✓ Scenario simulation executed and successfully integrated with synced data pipeline!'));

  console.log(green('\n--- ALL PIPELINE INTEGRATION TESTS PASSED SUCCESSFULLY ---\n'));
}

runTest().catch(err => {
  console.error(red('✗ Integration test failed:'), err);
  process.exit(1);
});
