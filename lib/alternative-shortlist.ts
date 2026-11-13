import type { Tool } from './catalog';
import { allowlistedComparePartners } from './compare-pairs';
import {audienceIsGeneric,meaningfulFeatures} from './recorded-research';

/**
 * A bounded, deterministic research shortlist. We compare only products in the
 * same category, using their recorded capabilities, audience and usage notes.
 * This is relevance-based discovery, not a ranking or an unsupported claim
 * that one product is superior to another.
 */
const stopwords = new Set(['with','from','this','that','your','their','other','about','under','over','using','across','into','when','where','team','teams','users','tools','tool','software','platform','platforms','features','feature','options','workflows','workflow','management','support','check','compare','review','evaluate','different','confirm','terms','before','need','needs']);
const tokens = (value:string):Set<string> => new Set((value.toLowerCase().match(/[a-z0-9]{4,}/g) || [])
  .filter(word => !stopwords.has(word)));
const overlap = (left:Set<string>,right:Set<string>) => {
  let count=0;for(const word of left)if(right.has(word))count++;
  return count;
};

export function alternativeShortlist(target:Tool, inventory:readonly Tool[], limit=6):Tool[] {
  const targetFeatures=tokens(target.features.join(' '));
  const targetContext=tokens(target.fit+' '+target.summary);
  const curated=new Set(allowlistedComparePartners(target.slug));
  return inventory
    .filter(peer=>peer.slug!==target.slug && peer.category===target.category)
    .map(peer=>{
      const features=tokens(peer.features.join(' '));
      const context=tokens(peer.fit+' '+peer.summary);
      return {peer, score:
        overlap(targetFeatures,features)*5 +
        overlap(targetContext,context)*2 +
        overlap(targetFeatures,context) +
        (curated.has(peer.slug)?8:0) +
        (peer.format===target.format?1:0)};
    })
    .sort((a,b)=>b.score-a.score || a.peer.name.localeCompare(b.peer.name,'en') || a.peer.slug.localeCompare(b.peer.slug))
    .slice(0,Math.max(0,limit)).map(item=>item.peer);
}

export function alternativesDescription(tool:Tool,categoryName:string):string {
  const specific=meaningfulFeatures(tool).slice(0,2).join(' and ');
  const fit=!audienceIsGeneric(tool)?tool.fit.trim():'';
  const focus=fit?'Audience context: '+fit:
    specific?'Recorded research areas: '+specific+'.':
    'Assess recorded product focus against vendor documentation.';
  return 'Compare '+tool.name+' alternatives in '+categoryName.toLowerCase()+'. '+focus+' Review available source links, limitations, and use-case fit.';
}

export function alternativeEvaluationQuestions(tool:Tool):string[] {
  const questions=tool.features.filter(feature=>Boolean(feature)&&!/^(core product workflow|features|general capabilities)$/i.test(feature.trim())).slice(0,3).map(feature=>
    'Can a candidate demonstrate '+feature.toLowerCase()+' on a task relevant to your team?');
  if(!questions.length)questions.push('Can the replacement complete the core workflow you currently use '+tool.name+' for?');
  return questions;
}
