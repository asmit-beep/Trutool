import { timingSafeEqual } from 'node:crypto';
import { privateResponse } from '@/lib/admin-auth';
import { refreshVisibility } from '@/lib/visibility-refresh';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,header=request.headers.get('authorization')||'';
 const expected=secret?'Bearer '+secret:'';
 const supplied=Buffer.from(header),wanted=Buffer.from(expected);
 if(!expected||supplied.length!==wanted.length||!timingSafeEqual(supplied,wanted))return privateResponse({error:'Unauthorized.'},401);
 try{const result=await refreshVisibility();return privateResponse(result,result.ok?200:503);}catch{return privateResponse({error:'Visibility refresh failed. Please retry.'},503);}
}
