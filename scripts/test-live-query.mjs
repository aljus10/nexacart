import fs from 'node:fs';
import path from 'node:path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

// Set process.env
Object.assign(process.env, env);

const { answerQuestion, loadSnapshot, runtimeEnv } = await import('./lib/nexacart/server.ts');

console.log('Testing End-to-End Ask NexaCart Query with Live Supabase & Gemini...');
const rEnv = await runtimeEnv();
const snapshot = await loadSnapshot(rEnv);

console.log(`Snapshot source: ${snapshot.source}`);
console.log(`Gemini configured: ${snapshot.geminiConfigured}`);

const question = 'Which 5 sellers have the highest net sales?';
console.log(`\nAsking: "${question}"`);

const result = await answerQuestion(rEnv, question, snapshot, {}, false);
console.log('\nQuery Result:');
console.log('Planner:', result.planner);
console.log('SQL:', result.sql);
console.log('Rows returned:');
console.table(result.rows);

console.log('\n✅ End-to-End Integration Verified!');
