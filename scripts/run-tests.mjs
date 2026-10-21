import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),output=path.join(root,'.sites-runtime/test-build');
await fs.mkdir(output,{recursive:true});
for(const file of ['engine','demo','runtime-context','server','workspace-data']){
 let source=await fs.readFile(path.join(root,'lib/nexacart',file+'.ts'),'utf8');
 source=source.replace(/from '(\.\/[\w-]+)'/g,"from '$1.js'");
 source=source.replace("from './map-catalog.json'","from './map-catalog.json' with {type:'json'}");
 const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
 await fs.writeFile(path.join(output,file+'.js'),result.outputText);
}
await fs.copyFile(path.join(root,'lib/nexacart/map-catalog.json'),path.join(output,'map-catalog.json'));
for(const file of ['data','ask','status']){
 let source=await fs.readFile(path.join(root,'app/api',file,'route.ts'),'utf8');
 source=source.replaceAll('@/lib/nexacart/server','./server.js').replaceAll('@/lib/nexacart/engine','./engine.js');
 await fs.writeFile(path.join(output,file+'-route.js'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
const result=spawnSync(process.execPath,['--test','tests/commerce.test.mjs','tests/workspace.test.mjs'],{stdio:'inherit',cwd:root});
process.exit(result.status??1);
