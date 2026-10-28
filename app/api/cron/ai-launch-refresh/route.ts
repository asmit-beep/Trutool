// Automated AI/News refresh has been disabled intentionally to prevent
// recurring upstream requests and Blob writes. Kept as an explicit 410 so
// old scheduler requests cannot trigger the former job.
export const dynamic='force-dynamic';
export function GET(){return Response.json({error:'Automatic content refresh has been disabled. Publish updates manually.'},{status:410,headers:{'Cache-Control':'no-store'}});}
