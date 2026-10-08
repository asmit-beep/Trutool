import {pageStructuredData,serializeSchema} from '@/lib/structured-data';
export function PageStructuredData({path}:{path:string}){const data=pageStructuredData(path);return data?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(data)}}/>:null}
