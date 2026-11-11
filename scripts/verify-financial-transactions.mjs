/**
 * VAULTORA — Financial Transaction Reliability & UGX Validation Test
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';
const TEST_EMAIL = `fin_test_${Date.now()}@vaultora.test`;
const TEST_PASSWORD = 'FinPassword123!';
const TEST_NAME = 'Financial Auditor User';

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}: ${details}`);
    failed++;
  }
}

async function runFinancialTests() {
  console.log('====================================================');
  console.log('VAULTORA: Financial Transaction Reliability Verification');
  console.log('Target:', BASE_URL);
  console.log('====================================================\n');

  // 1. Register a test user
  const regRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      acceptTerms: true,
      currency: 'UGX'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test deposit below UGX 5,000 (must be rejected)
  const lowDepRes = await fetch(`${BASE_URL}/api/user/deposits`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 4999,
      currency: 'UGX',
      paymentMethod: 'MTN Mobile Money'
    })
  });
  const lowDepData = await lowDepRes.json();
  assert(
    lowDepRes.status === 400 && lowDepData.error.includes('minimum deposit is UGX 5,000'),
    'Reject deposit below UGX 5,000',
    `Status: ${lowDepRes.status}, Error: ${lowDepData.error}`
  );

  // 3. Test negative / invalid deposit amount
  const invalidDepRes = await fetch(`${BASE_URL}/api/user/deposits`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: -1000,
      currency: 'UGX'
    })
  });
  assert(invalidDepRes.status === 400, 'Reject negative or non-numeric deposit amount');

  // 4. Test valid deposit of UGX 5,000
  const validRef = `TEST-REF-${Date.now()}`;
  const validDepRes = await fetch(`${BASE_URL}/api/user/deposits`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 5000,
      currency: 'UGX',
      paymentMethod: 'MTN Mobile Money',
      reference: validRef
    })
  });
  const validDepData = await validDepRes.json();
  assert(
    validDepRes.status === 200 && validDepData.deposit?.amount === 5000 && validDepData.deposit?.currency === 'UGX',
    'Accept valid UGX 5,000 deposit',
    `Status: ${validDepRes.status}, Amount: ${validDepData.deposit?.amount}`
  );

  // 5. Test duplicate transaction reference prevention
  const dupRefRes = await fetch(`${BASE_URL}/api/user/deposits`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 10000,
      currency: 'UGX',
      paymentMethod: 'Airtel Money',
      reference: validRef // Same reference
    })
  });
  const dupRefData = await dupRefRes.json();
  assert(
    dupRefRes.status === 400 && dupRefData.error.includes('already been submitted'),
    'Prevent duplicate transaction reference',
    `Status: ${dupRefRes.status}, Error: ${dupRefData.error}`
  );

  // 6. Test savings allocation below UGX 5,000 (must be rejected)
  const lowSavRes = await fetch(`${BASE_URL}/api/user/savings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 2500,
      planName: 'Test Plan'
    })
  });
  const lowSavData = await lowSavRes.json();
  assert(
    lowSavRes.status === 400 && lowSavData.error.includes('minimum amount required to start a savings plan is UGX 5,000'),
    'Reject savings plan allocation below UGX 5,000',
    `Status: ${lowSavRes.status}, Error: ${lowSavData.error}`
  );

  // 7. Test savings allocation exceeding available balance (must be rejected)
  const highSavRes = await fetch(`${BASE_URL}/api/user/savings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 500000,
      planName: 'High Plan'
    })
  });
  const highSavData = await highSavRes.json();
  assert(
    highSavRes.status === 400 && highSavData.error.includes('Insufficient available balance'),
    'Reject savings plan exceeding available balance',
    `Status: ${highSavRes.status}, Error: ${highSavData.error}`
  );

  // 8. Confirm deposit via database simulation (admin approval) and test valid savings creation
  const dbPath = path.resolve(process.cwd(), 'vaultora_db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const userDep = db.deposits.find(d => d.id === validDepData.deposit?.id);
  if (userDep) {
    userDep.status = 'confirmed';
    userDep.reviewedAt = new Date().toISOString();
    userDep.reviewedBy = 'system_test';
  }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  // Verify dashboard reflects availableBalance = 5000 UGX
  const dashRes = await fetch(`${BASE_URL}/api/user/dashboard`, {
    headers: authHeaders
  });
  const dashData = await dashRes.json();
  assert(
    dashData.stats?.availableBalance === 5000 && dashData.stats?.originalPrincipal === 5000,
    'Dashboard accurately computes confirmed available balance (UGX 5,000)',
    `Available: ${dashData.stats?.availableBalance}`
  );

  // Allocate valid savings of UGX 5,000
  const validSavRes = await fetch(`${BASE_URL}/api/user/savings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 5000,
      planName: 'UGX High-Yield Savings'
    })
  });
  const validSavData = await validSavRes.json();
  assert(
    validSavRes.status === 200 && validSavData.savingsPlan?.amount === 5000,
    'Successfully allocate UGX 5,000 into high-yield savings plan',
    `Status: ${validSavRes.status}, Plan Amount: ${validSavData.savingsPlan?.amount}`
  );

  // 9. Verify dashboard balance updates after savings allocation
  const updatedDashRes = await fetch(`${BASE_URL}/api/user/dashboard`, {
    headers: authHeaders
  });
  const updatedDashData = await updatedDashRes.json();
  assert(
    updatedDashData.stats?.availableBalance === 0 && updatedDashData.stats?.activeSavings === 0, // In pending_waiting state, reserved from available
    'Available balance safely decreases after allocating to savings',
    `Remaining Available: ${updatedDashData.stats?.availableBalance}`
  );

  // Cleanup test user
  const cleanDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  cleanDb.users = cleanDb.users.filter(u => !u.email.includes('@vaultora.test'));
  cleanDb.deposits = cleanDb.deposits.filter(d => !d.userEmail?.includes('@vaultora.test'));
  cleanDb.savingsPlans = cleanDb.savingsPlans.filter(s => s.userId !== regData.user?.id);
  for (const [sToken, sRecord] of Object.entries(cleanDb.sessions || {})) {
    if (sRecord.email && sRecord.email.includes('@vaultora.test')) {
      delete cleanDb.sessions[sToken];
    }
  }
  fs.writeFileSync(dbPath, JSON.stringify(cleanDb, null, 2), 'utf8');
  console.log('[CLEANUP] Pruned financial test records.');

  console.log('\n====================================================');
  console.log(`Results: ${passed}/9 financial tests PASSED`);
  if (failed > 0) {
    console.error(`FAILED: ${failed} tests failed`);
    process.exit(1);
  } else {
    console.log('ALL FINANCIAL RELIABILITY TESTS PASSED PERFECTLY!');
  }
}

runFinancialTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
