import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const roots=['app','components'];
const files=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())walk(p);
  else if(p.endsWith('.tsx'))files.push(p);
 }
}
for(const root of roots)walk(root);
const violations=[];
let totalImages=0;
for(const filename of files){
 const s=fs.readFileSync(filename,'utf8');
 const tree=ts.createSourceFile(filename,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const visit=(node)=>{
  if(ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node)){
   const name=node.tagName.getText(tree);
   if(name==='img'||name==='Image'){
    totalImages++;
    const alt=node.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.text==='alt');
    const line=tree.getLineAndCharacterOfPosition(node.getStart(tree)).line+1;
    if(!alt||!ts.isJsxAttribute(alt)||!alt.initializer){
     violations.push(filename+':'+line+': image tag must include alt');}
    else if(ts.isStringLiteral(alt.initializer)&&!alt.initializer.text.trim()){
     violations.push(filename+':'+line+': empty alt text');}
    else if(ts.isJsxExpression(alt.initializer)&&(
      !alt.initializer.expression||
      (ts.isStringLiteral(alt.initializer.expression)&&!alt.initializer.expression.text.trim())
    )){
     violations.push(filename+':'+line+': empty computed alt text');}
   }
  }
  ts.forEachChild(node,visit);
 };
 visit(tree);
}
assert.ok(totalImages>10,'Image audit scanned unexpectedly few image renderers');
assert.deepEqual(violations,[],'Images with missing/empty alt text found:\n'+violations.join('\n'));
console.log('PASS: '+totalImages+' JSX image elements across '+files.length+' page/component files have a nonempty or dynamically provided alt attribute.');
