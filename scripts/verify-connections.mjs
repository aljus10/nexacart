import fs from 'node:fs';
import path from 'node:path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) {
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    env[key] = val;
  }
}

console.log('Testing Supabase & Gemini connections...\n');

// 1. Test Supabase
async function testSupabase() {
  console.log('1. Testing Supabase RPC connection:');
  console.log('   URL:', env.SUPABASE_URL);
  try {
    const url = new URL('/rest/v1/rpc/nexacart_snapshot', env.SUPABASE_URL);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({})
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`   ❌ Supabase RPC error: Status ${res.status}: ${errText}`);
      return false;
    }

    const data = await res.json();
    console.log('   ✅ Supabase nexacart_snapshot succeeded!');
    for (const [tbl, info] of Object.entries(data.tables || {})) {
      console.log(`      - ${tbl}: status=${info.status}, total=${info.total}, rows returned=${info.rows?.length}`);
    }
    return true;
  } catch (err) {
    console.error('   ❌ Supabase fetch failed:', err.message);
    return false;
  }
}

// 2. Test Gemini
async function testGemini() {
  console.log('\n2. Testing Google Gemini API:');
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.log(`   Model: ${model}`);
  try {
    const prompt = 'Return the JSON: {"status": "ok", "message": "NexaCart connected successfully"}';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`   ❌ Gemini error: Status ${res.status}: ${errText}`);
      return false;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('   ✅ Gemini 2.5 Flash responded successfully!');
    console.log('      Response:', candidateText?.trim());
    return true;
  } catch (err) {
    console.error('   ❌ Gemini request failed:', err.message);
    return false;
  }
}

async function run() {
  const sbOk = await testSupabase();
  const geminiOk = await testGemini();
  console.log('\nSummary:');
  console.log(`Supabase connection: ${sbOk ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Gemini AI connection: ${geminiOk ? 'PASSED ✅' : 'FAILED ❌'}`);
  process.exit(sbOk && geminiOk ? 0 : 1);
}

run();
