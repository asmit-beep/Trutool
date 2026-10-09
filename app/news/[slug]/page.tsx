import { CmsArticle } from '@/components/cms-article';
import { cmsMetadata,publicContent } from '@/lib/cms-public';
import { notFound } from 'next/navigation';
export const revalidate=30;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const c=await publicContent('/news/'+(await params).slug);return c?cmsMetadata(c):{title:'News not found',robots:{index:false}};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const c=await publicContent('/news/'+(await params).slug);if(!c)notFound();return <CmsArticle content={c}/>;}
