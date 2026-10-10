import { authenticated,privateResponse,sameOrigin } from '@/lib/admin-auth';
import { refreshVisibility } from '@/lib/visibility-refresh';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:Request){
 if(!await authenticated())return privateResponse({error:'Please sign in.'},401);
 if(!sameOrigin(request))return privateResponse({error:'Invalid origin.'},403);
 try{const result=await refreshVisibility();return privateResponse({...result,...(!result.ok?{error:'Some discovery endpoints did not respond. Try refreshing again.'}:{})},result.ok?200:503);}catch{return privateResponse({error:'Visibility refresh failed. Please retry.'},503);}
}
