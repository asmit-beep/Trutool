import {categories} from './catalog';
import {searchTools} from './search';
import type {ToolResults} from './catalog-client';
export const categoryOptions=categories.map(({slug,short})=>({slug,short}));
export function toolResults(query='',category='',sort='relevance',page=1,limit=24):ToolResults{
 query=query.trim().slice(0,160);sort=sort==='az'?'az':'relevance';
 limit=Number.isFinite(limit)?Math.min(50,Math.max(1,Math.floor(limit))):24;
 const found=searchTools(query,category,sort),total=found.length,pages=Math.max(1,Math.ceil(total/limit));
 page=Number.isFinite(page)?Math.min(pages,Math.max(1,Math.floor(page))):1;
 return {items:found.slice((page-1)*limit,page*limit).map(t=>({slug:t.slug,name:t.name,category:t.category,categoryLabel:t.categoryLabel!,summary:t.summary,format:t.format,initial:t.initial})),total,page,pages,limit,query,category,sort};
}
