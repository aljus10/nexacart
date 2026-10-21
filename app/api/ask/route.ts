import { runtimeEnv,loadSnapshot,answerQuestion,errorJSON } from '@/lib/nexacart/server';
import {tableNames,hideTables,validatePlan,type TableName} from '@/lib/nexacart/engine';
export const dynamic = 'force-dynamic';
export async function POST(request:Request){
  const origin=request.headers.get('Origin');
  if(origin&&origin!==new URL(request.url).origin)return errorJSON('Cross-origin requests are not allowed.',403);
  if(!request.headers.get('content-type')?.includes('application/json'))return errorJSON('JSON is required.',415);
  if(Number(request.headers.get('content-length')||0)>8192)return errorJSON('Question too long.',413);
  try {
    const text=await request.text();
    if(text.length>8192)return errorJSON('Question too long.',413);
    const body=JSON.parse(text);
    if(typeof body.question!=='string'||body.question.trim().length<2||body.question.length>600)return errorJSON('Enter a question between 2 and 600 characters.');
    const hidden:TableName[]=[];
    if(body.hidden!=null){if(!Array.isArray(body.hidden)||body.hidden.some((x:unknown)=>!tableNames.includes(x as TableName)))return errorJSON('Invalid simulated schema.');hidden.push(...body.hidden);}
    const filters=validatePlan({metric:'orders',dimension:'none',limit:10,direction:'desc',filters:body.filters||{}}).filters;
    const env=await runtimeEnv();
    const s=hideTables(await loadSnapshot(env),hidden);
    const result=await answerQuestion(env,body.question.trim(),s,filters,body.offline===true);
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(err){return errorJSON(err instanceof SyntaxError ? 'Invalid JSON.' : err instanceof Error && !/fetch|abort|timeout/i.test(err.message) ? err.message : 'The query timed out. Refresh the schema and try again.');}
}
