import { runtimeEnv } from '@/lib/nexacart/server';
export const dynamic = 'force-dynamic';
export async function GET(){const e=await runtimeEnv();return Response.json({databaseConfigured:!!e.SUPABASE_URL&&!!e.SUPABASE_SERVICE_ROLE_KEY,geminiConfigured:!!e.GEMINI_API_KEY,model:e.GEMINI_MODEL||'gemini-3.5-flash-lite'},{headers:{'Cache-Control':'no-store'}});}
