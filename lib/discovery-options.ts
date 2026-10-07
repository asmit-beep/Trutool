export const discoveryOptions=[
 {id:'all',label:'All tools',description:'Explore every relevant match.'},
 {id:'popular',label:'Popular picks',description:'Familiar starting points selected by the editorial team.'},
 {id:'useful',label:'Most useful',description:'Practical editorial picks for everyday workflows. Choose around your own needs.'},
 {id:'niche',label:'Niche finds',description:'Specialist tools for a more specific job.'},
] as const;
export type DiscoveryMode=typeof discoveryOptions[number]['id'];
export const normalizeDiscovery=(value:string):DiscoveryMode=>discoveryOptions.some(o=>o.id===value)?value as DiscoveryMode:'all';
export const normalizeSort=(value:string)=>['az','newest'].includes(value)?value:'relevance';
