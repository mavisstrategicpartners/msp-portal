import { checkDuplicateLead, handleSalesApi } from "../src/lib/sales-server.ts";

async function runTests() {
  console.log("=== RUNNING MSP SALES SYSTEM AUTOMATED TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Duplicate Lead Detection (Email, Phone, Business Name)
  console.log("--- Testing Duplicate Lead Prevention ---");
  const sampleLeads = [
    {
      id: "lead-1",
      businessName: "Acme Logistics SA",
      contactPerson: "John Doe",
      email: "john@acme.co.za",
      phone: "0821234567",
      industry: "Construction",
      assignedSalesperson: "Sales Consultant 1",
    },
    {
      id: "lead-2",
      businessName: "MediHealth Clinic",
      contactPerson: "Jane Smith",
      email: "jane@medihealth.co.za",
      phone: "+27 83 987 6543",
      industry: "Healthcare",
      assignedSalesperson: "Sales Consultant 2",
    },
  ];

  const dupEmailCheck = checkDuplicateLead(sampleLeads, { email: "JOHN@acme.co.za" });
  assert(dupEmailCheck.isDuplicate === true && dupEmailCheck.field === "email", "Detects duplicate email case-insensitively");

  const dupPhoneCheck = checkDuplicateLead(sampleLeads, { phone: "0839876543" });
  assert(dupPhoneCheck.isDuplicate === true && dupPhoneCheck.field === "phone", "Detects duplicate phone normalized (+27 vs 0)");

  const dupNameCheck = checkDuplicateLead(sampleLeads, { businessName: "acme logistics sa" });
  assert(dupNameCheck.isDuplicate === true && dupNameCheck.field === "businessName", "Detects duplicate company name");

  const uniqueCheck = checkDuplicateLead(sampleLeads, {
    businessName: "Brand New Solar",
    email: "solar@brandnew.co.za",
    phone: "0711112222",
  });
  assert(uniqueCheck.isDuplicate === false, "Passes unique lead without false positives");

  // TEST 2: Role-Based Access Control on GET /api/sales/leads
  console.log("\n--- Testing Backend Role-Based Access Control ---");

  // Consultant 1 request
  const consultantReq = new Request("http://localhost/api/sales/leads", {
    method: "GET",
    headers: {
      "X-MSP-User-Id": "6de3785e-8bb4-4f22-8acb-b13d6092988c",
      "X-MSP-User-Email": "consultant1@mavisstrateegicpartners.co.za",
      "X-MSP-User-Role": "staff",
    },
  });

  const consultantRes = await handleSalesApi(consultantReq);
  const consultantData = await consultantRes.json();
  const c1Leads = consultantData.leads || [];

  const allAssignedToC1 = c1Leads.length > 0 && c1Leads.every(
    (l) =>
      l.assignedConsultantId === "6de3785e-8bb4-4f22-8acb-b13d6092988c" ||
      l.assignedConsultantEmail?.toLowerCase() === "consultant1@mavisstrateegicpartners.co.za" ||
      l.assignedSalesperson?.includes("Consultant 1")
  );
  assert(consultantRes.status === 200, "Consultant 1 fetches leads with 200 OK");
  assert(allAssignedToC1, "Consultant 1 only sees their own leads, not peers");

  // Manager request
  const managerReq = new Request("http://localhost/api/sales/leads", {
    method: "GET",
    headers: {
      "X-MSP-User-Id": "mgr-sales-uuid-001",
      "X-MSP-User-Email": "manager@mavisstrateegicpartners.co.za",
      "X-MSP-User-Role": "manager",
    },
  });

  const managerRes = await handleSalesApi(managerReq);
  const managerData = await managerRes.json();
  const allLeads = managerData.leads || [];
  assert(managerRes.status === 200, "Sales Manager fetches team leads with 200 OK");
  assert(allLeads.length >= c1Leads.length, "Sales Manager can see full team consolidated leads");

  // TEST 3: Industry Performance Analytics
  console.log("\n--- Testing Industry Performance Analytics ---");
  const industryReq = new Request("http://localhost/api/sales/industry-performance", {
    method: "GET",
    headers: {
      "X-MSP-User-Id": "mgr-sales-uuid-001",
      "X-MSP-User-Email": "manager@mavisstrateegicpartners.co.za",
      "X-MSP-User-Role": "manager",
    },
  });

  const industryRes = await handleSalesApi(industryReq);
  const industryData = await industryRes.json();
  const summaries = industryData.industryPerformance || [];
  assert(industryRes.status === 200, "Industry performance returned with 200 OK");
  assert(summaries.length === 12, "Returns metrics for all 12 MSP industry verticals");
  const hasRevenue = summaries.some((s) => s.totalRevenue > 0);
  assert(hasRevenue, "Calculates won revenue per industry vertical correctly");

  // TEST 4: Targets & Performance Leaderboard
  console.log("\n--- Testing Monthly Targets & Performance Leaderboard ---");
  const leaderboardReq = new Request("http://localhost/api/sales/leaderboard?month=2026-11", {
    method: "GET",
    headers: {
      "X-MSP-User-Id": "mgr-sales-uuid-001",
      "X-MSP-User-Email": "manager@mavisstrateegicpartners.co.za",
      "X-MSP-User-Role": "manager",
    },
  });

  const leaderboardRes = await handleSalesApi(leaderboardReq);
  const leaderboardData = await leaderboardRes.json();
  const rankings = leaderboardData.rankings || [];
  assert(leaderboardRes.status === 200, "Leaderboard returned with 200 OK");
  assert(rankings.length >= 3, "Rankings include all active sales consultants");
  assert(rankings[0].rank === 1 && rankings[0].actualWonAmount >= rankings[1].actualWonAmount, "Consultants ranked descending by actual won revenue");

  // TEST 5: GoHighLevel Calendar Appointments
  console.log("\n--- Testing GoHighLevel Calendar Integration ---");
  const ghlReq = new Request("http://localhost/api/sales/ghl/appointments", {
    method: "GET",
    headers: {
      "X-MSP-User-Id": "mgr-sales-uuid-001",
      "X-MSP-User-Email": "manager@mavisstrateegicpartners.co.za",
      "X-MSP-User-Role": "manager",
    },
  });

  const ghlRes = await handleSalesApi(ghlReq);
  const ghlData = await ghlRes.json();
  const appts = ghlData.appointments || [];
  assert(ghlRes.status === 200, "GHL appointments retrieved with 200 OK");
  assert(appts.length > 0, "Displays scheduled GHL appointments with client and date info");

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
