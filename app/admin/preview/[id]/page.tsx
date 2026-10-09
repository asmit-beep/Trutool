import { CmsArticle } from '@/components/cms-article';
import { authenticated } from '@/lib/admin-auth';
import { baseContent } from '@/lib/cms-admin';
import { readStore } from '@/lib/cms-store';
import { notFound,redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export const metadata={title:'Private preview | TruTool',robots:{index:false,follow:false},alternates:{canonical:null}};
export default async function Page({params}:{params:Promise<{id:string}>}){if(!await authenticated())redirect('/admin');const {id}=await params,store=(await readStore()).store,content=store.records.find(r=>r.id===id)?.draft||baseContent(id);if(!content)notFound();return <><div className="cms-preview-toolbar"><a href="/admin">Return to editor</a><span>Private draft preview</span></div><CmsArticle content={content} preview/></>;}
