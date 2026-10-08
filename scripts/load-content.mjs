import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
export function loadContent(){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-discovery-'));
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const file of fs.readdirSync('lib')){
  if(file.endsWith('.json'))fs.copyFileSync(path.join('lib',file),path.join(tmp,file));
  else if(file.endsWith('.ts'))fs.writeFileSync(path.join(tmp,file.replace(/\.ts$/,'.js')),ts.transpileModule(fs.readFileSync(path.join('lib',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 }
 const require=createRequire(import.meta.url);
 return {index:require(path.join(tmp,'content-index.js')),discovery:require(path.join(tmp,'discovery.js')),schema:require(path.join(tmp,'structured-data.js')),cleanup:()=>fs.rmSync(tmp,{recursive:true,force:true})};
}
