import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TABLES = ['dim_seller', 'dim_customer', 'dim_product', 'dim_payment', 'dim_shipping', 'fact_order_items'];

async function run() {
  console.log(`\n🧪 Testing NexaCart Table Resilience & Backup Suite at ${BASE_URL}...\n`);

  // 1. Check live snapshot
  console.log('1. Checking live data snapshot...');
  const dataRes = await fetch(`${BASE_URL}/api/data`);
  assert.equal(dataRes.status, 200, 'Snapshot API should return 200');
  const snapshot = await dataRes.json();
  assert.equal(snapshot.source, 'supabase', 'Live source should be Supabase');
  for (const t of TABLES) {
    assert.equal(snapshot.tables[t]?.status, 'available', `Table ${t} should be available`);
    assert(snapshot.tables[t].total > 0, `Table ${t} should have rows`);
    console.log(`   ✔ ${t}: ${snapshot.tables[t].total} rows`);
  }

  // 2. Test Backup SQL endpoints
  console.log('\n2. Testing backup SQL endpoints...');
  for (const t of TABLES) {
    const res = await fetch(`${BASE_URL}/api/backup?table=${t}`);
    assert.equal(res.status, 200, `Backup for ${t} should return 200`);
    const sql = await res.text();
    assert(sql.includes(`CREATE TABLE IF NOT EXISTS public.${t}`), `SQL should create table ${t}`);
    assert(sql.includes(`INSERT INTO public.${t}`), `SQL should have inserts for ${t}`);
    assert(sql.includes("NOTIFY pgrst, 'reload schema'"), `SQL should reload schema cache`);
    console.log(`   ✔ restore_${t}.sql: ${(sql.length / 1024).toFixed(1)} KB`);
  }

  const masterRes = await fetch(`${BASE_URL}/api/backup?table=all`);
  assert.equal(masterRes.status, 200, 'Master backup should return 200');
  const masterSql = await masterRes.text();
  assert(masterSql.includes('NexaCart Master Recovery Script'), 'Master SQL should include header block');
  console.log(`   ✔ restore_all.sql: ${(masterSql.length / 1024).toFixed(1)} KB`);

  // 3. Test AI Assistant resilience when tables are missing
  console.log('\n3. Testing AI Assistant table-drop awareness...');

  // Case A: Asking about sellers when dim_seller is hidden
  const askRes1 = await fetch(`${BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Who is the top seller by sales?', hidden: ['dim_seller'] })
  });
  assert.equal(askRes1.status, 200, 'AI response should return 200');
  const askData1 = await askRes1.json();
  assert.equal(askData1.plan?.mode, 'conversational', 'Mode should be conversational');
  assert(/dim_seller|seller/i.test(askData1.explanation), 'AI should mention dim_seller or seller');
  console.log('   ✔ Missing dim_seller handled conversationally:');
  console.log(`     "${askData1.explanation.slice(0, 110)}..."`);

  // Case B: Asking about net sales when fact_order_items is hidden
  const askRes2 = await fetch(`${BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What is our total revenue?', hidden: ['fact_order_items'] })
  });
  assert.equal(askRes2.status, 200, 'AI response should return 200');
  const askData2 = await askRes2.json();
  assert.equal(askData2.plan?.mode, 'conversational', 'Mode should be conversational');
  assert(/fact_order_items|order/i.test(askData2.explanation), 'AI should mention fact_order_items');
  console.log('   ✔ Missing fact_order_items handled conversationally:');
  console.log(`     "${askData2.explanation.slice(0, 110)}..."`);

  console.log('\n🎉 ALL RESILIENCE & BACKUP CHECKS PASSED 100%!\n');
}

run().catch((err) => {
  console.error('\n❌ Resilience test failed:', err);
  process.exit(1);
});
