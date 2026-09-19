import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const [kind,slug,...words]=process.argv.slice(2);
const names={post:'writing',project:'projects',experiment:'experiments',log:'log'};
if(!names[kind]||!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){console.error('Usage: npm run new:post -- lower-case-slug "Title" (also new:project, new:experiment, new:log)');process.exit(1);}
const title=words.join(' ')||slug.replaceAll('-',' ');
const template=await readFile(new URL(`../templates/${kind}.md`,import.meta.url),'utf8');
const content=template.replaceAll('{{title}}',JSON.stringify(title)).replaceAll('{{date}}',new Date().toISOString().slice(0,10));
const file=resolve('src/content',names[kind],`${slug}.md`);
const sibling=resolve('src/content',names[kind],`${slug}.mdx`);
if(await access(sibling).then(()=>true,()=>false)){console.error('Already exists as MDX; nothing overwritten.');process.exit(1);}
try {await writeFile(file,content,{flag:'wx'});if(kind==='project')await mkdir(resolve('public/images/projects',slug),{recursive:true});console.log(`Created ${file}. Draft is excluded from production. Run npm run check after editing.`);}catch(e){if(e.code==='EEXIST'){console.error('Already exists; nothing overwritten.');process.exit(1);}throw e;}
