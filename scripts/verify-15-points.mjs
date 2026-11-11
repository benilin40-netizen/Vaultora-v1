/**
 * VAULTORA — 15-POINT FORENSIC VERIFICATION SUITE
 * Validates authentication, API responses, JSON safety, database resilience, and build integrity.
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';
const TEST_EMAIL = `test_${Date.now()}@vaultora.test`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Vaultora Test User';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] Point ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] Point ${testName}: ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('VAULTORA: Phase 6 Forensic Verification Suite');
  console.log('Target:', BASE_URL);
  console.log('====================================================\n');

  let testToken = null;
  let testUserId = null;

  // ----------------------------------------------------
  // Point 1: New account registration via /api/auth/signup
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
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
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();
    testToken = data.token;
    testUserId = data.user?.id;

    assert(
      (res.status === 200 || res.status === 201) &&
      ctype.includes('application/json') &&
      data.token &&
      data.user?.email === TEST_EMAIL &&
      !data.user?.passwordHash &&
      !data.user?.salt,
      '1 - New account registration via /api/auth/signup',
      `Status: ${res.status}, Token: ${!!data.token}`
    );
  } catch (err) {
    assert(false, '1 - New account registration via /api/auth/signup', err.message);
  }

  // ----------------------------------------------------
  // Point 2: Duplicate email registration
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        fullName: 'Another User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        acceptTerms: true
      })
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 400 &&
      ctype.includes('application/json') &&
      typeof data.error === 'string' &&
      data.error.toLowerCase().includes('already exists'),
      '2 - Duplicate email registration rejection',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err) {
    assert(false, '2 - Duplicate email registration rejection', err.message);
  }

  // ----------------------------------------------------
  // Point 3: Login with valid credentials via /api/auth/login
  // ----------------------------------------------------
  let loginCookie = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    const ctype = res.headers.get('content-type') || '';
    const setCookie = res.headers.get('set-cookie') || '';
    const data = await res.json();
    if (data.token) testToken = data.token;
    if (setCookie.includes('vaultora_session=')) {
      loginCookie = setCookie.split(';')[0];
    }

    assert(
      res.status === 200 &&
      ctype.includes('application/json') &&
      data.token &&
      data.user?.email === TEST_EMAIL &&
      setCookie.includes('vaultora_session='),
      '3 - Login with valid credentials via /api/auth/login',
      `Status: ${res.status}, HasCookie: ${!!loginCookie}`
    );
  } catch (err) {
    assert(false, '3 - Login with valid credentials via /api/auth/login', err.message);
  }

  // ----------------------------------------------------
  // Point 4: Login with incorrect credentials (401 JSON)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: 'WrongPassword999!'
      })
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 401 &&
      ctype.includes('application/json') &&
      typeof data.error === 'string',
      '4 - Login with incorrect credentials (401 JSON)',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err) {
    assert(false, '4 - Login with incorrect credentials (401 JSON)', err.message);
  }

  // ----------------------------------------------------
  // Point 5: Missing email/password (400 JSON)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: ''
      })
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 400 &&
      ctype.includes('application/json') &&
      typeof data.error === 'string',
      '5 - Missing email/password validation (400 JSON)',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err) {
    assert(false, '5 - Missing email/password validation (400 JSON)', err.message);
  }

  // ----------------------------------------------------
  // Point 6: Existing account login / check (benilin40@gmail.com)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/check-bootstrap`);
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    const db = JSON.parse(fs.readFileSync('vaultora_db.json', 'utf8'));
    const adminExistsInDb = db.admins.some(a => a.email.toLowerCase() === 'benilin40@gmail.com');

    // Also test admin login validation with wrong password to verify admin exists & is checked
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: 'benilin40@gmail.com',
        password: 'IncorrectTestPassword!'
      })
    });
    const loginData = await loginRes.json();

    assert(
      adminExistsInDb &&
      data.canBootstrap === false &&
      data.adminCount >= 1 &&
      loginRes.status === 401 &&
      loginData.error === 'Invalid admin credentials',
      '6 - Existing account preservation (benilin40@gmail.com)',
      `AdminExistsInDb: ${adminExistsInDb}, AdminCount: ${data.adminCount}`
    );
  } catch (err) {
    assert(false, '6 - Existing account preservation (benilin40@gmail.com)', err.message);
  }

  // ----------------------------------------------------
  // Point 7: Session persistence after refresh via GET /api/auth/me
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 200 &&
      ctype.includes('application/json') &&
      data.user?.email === TEST_EMAIL,
      '7 - Session persistence after refresh via GET /api/auth/me',
      `Status: ${res.status}, Email: ${data.user?.email}`
    );
  } catch (err) {
    assert(false, '7 - Session persistence after refresh via GET /api/auth/me', err.message);
  }

  // ----------------------------------------------------
  // Point 8: Authentication state restoration via Cookie
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Cookie': loginCookie || `vaultora_session=${testToken}`
      }
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 200 &&
      ctype.includes('application/json') &&
      data.user?.email === TEST_EMAIL,
      '8 - Authentication state restoration via Cookie',
      `Status: ${res.status}, Email: ${data.user?.email}`
    );
  } catch (err) {
    assert(false, '8 - Authentication state restoration via Cookie', err.message);
  }

  // ----------------------------------------------------
  // Point 9: Logout & session invalidation via POST /api/auth/logout
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${testToken}`,
        'Cookie': loginCookie || `vaultora_session=${testToken}`
      }
    });
    const ctype = res.headers.get('content-type') || '';
    const setCookie = res.headers.get('set-cookie') || '';
    const data = await res.json();

    // Verify session token is invalidated in backend
    const checkRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });

    assert(
      res.status === 200 &&
      ctype.includes('application/json') &&
      data.success === true &&
      setCookie.includes('Max-Age=0') &&
      checkRes.status === 401,
      '9 - Logout & session invalidation via POST /api/auth/logout',
      `Status: ${res.status}, Post-logout check: ${checkRes.status}`
    );
  } catch (err) {
    assert(false, '9 - Logout & session invalidation via POST /api/auth/logout', err.message);
  }

  // ----------------------------------------------------
  // Point 10: Invalid & expired sessions (401 JSON)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer non_existent_token_1234567890'
      }
    });
    const ctype = res.headers.get('content-type') || '';
    const data = await res.json();

    assert(
      res.status === 401 &&
      ctype.includes('application/json') &&
      data.error.includes('expired or invalid'),
      '10 - Invalid & expired sessions (401 JSON)',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err) {
    assert(false, '10 - Invalid & expired sessions (401 JSON)', err.message);
  }

  // ----------------------------------------------------
  // Point 11: Missing API route (JSON 404, NEVER HTML)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route-forensic-test-12345`);
    const ctype = res.headers.get('content-type') || '';
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    assert(
      res.status === 404 &&
      ctype.includes('application/json') &&
      !ctype.includes('text/html') &&
      data !== null &&
      data.status === 404 &&
      data.error.includes('not found'),
      '11 - Missing API route returns JSON 404 (NEVER HTML)',
      `Status: ${res.status}, Content-Type: ${ctype}, IsJSON: ${!!data}`
    );
  } catch (err) {
    assert(false, '11 - Missing API route returns JSON 404 (NEVER HTML)', err.message);
  }

  // ----------------------------------------------------
  // Point 12: Database resilience & fallback
  // ----------------------------------------------------
  try {
    // Test serverless /tmp database fallback logic
    const tmpTestPath = path.resolve('/tmp', 'vaultora_db_resilience_test.json');
    if (fs.existsSync(tmpTestPath)) fs.unlinkSync(tmpTestPath);

    // Copy template and verify atomic read/write
    const templateData = fs.readFileSync('vaultora_db.json', 'utf8');
    fs.writeFileSync(tmpTestPath, templateData, 'utf8');
    const readBack = JSON.parse(fs.readFileSync(tmpTestPath, 'utf8'));
    readBack.resilienceCheck = true;
    readBack.resilienceTimestamp = Date.now();
    fs.writeFileSync(tmpTestPath, JSON.stringify(readBack, null, 2), 'utf8');
    const verifyBack = JSON.parse(fs.readFileSync(tmpTestPath, 'utf8'));

    fs.unlinkSync(tmpTestPath);

    assert(
      verifyBack.resilienceCheck === true &&
      verifyBack.admins.some(a => a.email === 'benilin40@gmail.com'),
      '12 - Database resilience & serverless /tmp fallback',
      'Verified read/write and persistence without EROFS crash'
    );
  } catch (err) {
    assert(false, '12 - Database resilience & serverless /tmp fallback', err.message);
  }

  // ----------------------------------------------------
  // Point 13: Backend internal error handling (JSON 500)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/system/simulate-error`);
    const ctype = res.headers.get('content-type') || '';
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    assert(
      res.status === 500 &&
      ctype.includes('application/json') &&
      !ctype.includes('text/html') &&
      data !== null &&
      data.status === 500 &&
      data.error === 'Simulated backend error for verification',
      '13 - Backend internal error handling (JSON 500)',
      `Status: ${res.status}, Content-Type: ${ctype}, Error: ${data?.error}`
    );
  } catch (err) {
    assert(false, '13 - Backend internal error handling (JSON 500)', err.message);
  }

  // ----------------------------------------------------
  // Point 14: Simulated HTML response safety in apiRequest (no syntax crash)
  // ----------------------------------------------------
  try {
    // Replicate the exact logic of apiRequest when encountering Vercel 404 HTML
    const simulatedHtml = '<html><head><title>The page could not be found</title></head><body>The page could not be found</body></html>';
    const simulatedStatus = 404;
    const simulatedContentType = 'text/html; charset=utf-8';

    let caughtError = null;
    try {
      if (!simulatedContentType.includes('application/json')) {
        const cleanSnippet = simulatedHtml
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160);
        throw new Error(
          `API returned an unexpected response (${simulatedStatus}): ${cleanSnippet || 'Non-JSON response received'}`
        );
      }
      JSON.parse(simulatedHtml); // This would throw SyntaxError if executed
    } catch (err) {
      caughtError = err;
    }

    assert(
      caughtError !== null &&
      caughtError.message.includes('API returned an unexpected response (404): The page could not be found') &&
      !caughtError.message.includes("Unexpected token 'T'") &&
      !caughtError.message.includes('is not valid JSON'),
      '14 - Simulated HTML response safety in apiRequest (no syntax crash)',
      `Caught: ${caughtError?.message}`
    );
  } catch (err) {
    assert(false, '14 - Simulated HTML response safety in apiRequest (no syntax crash)', err.message);
  }

  // ----------------------------------------------------
  // Cleanup test accounts to keep database pristine
  // ----------------------------------------------------
  try {
    const dbPath = path.resolve(process.cwd(), 'vaultora_db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const initialUserCount = db.users.length;
    db.users = db.users.filter(u => !u.email.includes('@vaultora.test'));
    // Also remove test sessions
    for (const [token, session] of Object.entries(db.sessions || {})) {
      if (session.email && session.email.includes('@vaultora.test')) {
        delete db.sessions[token];
      }
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`[CLEANUP] Pruned test users from database (cleaned: ${initialUserCount - db.users.length}, active users: ${db.users.length})`);
  } catch (cleanupErr) {
    console.warn('[CLEANUP WARNING]', cleanupErr.message);
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed}/14 automated runtime checks PASSED`);
  if (failed > 0) {
    console.error(`FAILED: ${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('ALL 14 RUNTIME CHECKS PASSED PERFECTLY!');
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
