import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),output=path.join(root,'.sites-runtime/map-test-build');
await fs.mkdir(output,{recursive:true});
const files={
 'map-data':'lib/nexacart/map-data.ts',
 'map-playback':'lib/nexacart/map-playback.ts',
 'map-models':'components/nexacart/map/map-models.ts',
 geography:'components/nexacart/map/geography.ts',
 'map-renderer':'components/nexacart/map/map-renderer.ts',
};
for(const [name,file] of Object.entries(files)){
 let source=await fs.readFile(path.join(root,file),'utf8');
 source=source.replaceAll('@/lib/nexacart/map-data','./map-data.js').replaceAll('@/lib/nexacart/map-playback','./map-playback.js').replaceAll("from './map-data'","from './map-data.js'").replaceAll("'./map-models'","'./map-models.js'").replaceAll("'./geography'","'./geography.js'").replace("from './map-catalog.json'","from './map-catalog.json' with {type:'json'}");
 await fs.writeFile(path.join(output,name+'.js'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
}
await fs.copyFile(path.join(root,'lib/nexacart/map-catalog.json'),path.join(output,'map-catalog.json'));
const result=spawnSync(process.execPath,['--test','tests/map.test.mjs'],{stdio:'inherit',cwd:root});
process.exit(result.status??1);
