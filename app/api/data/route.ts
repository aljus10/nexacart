import { runtimeEnv, loadSnapshot } from '@/lib/nexacart/server';
export const dynamic = 'force-dynamic';
export async function GET() {return Response.json(await loadSnapshot(await runtimeEnv()),{headers:{'Cache-Control':'no-store'}});}
