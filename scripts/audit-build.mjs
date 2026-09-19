import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
const files=await readdir(root,{recursive:true});
const htmlFiles=files.filter(p=>p.endsWith('.html'));
assert.ok(htmlFiles.length>0,'Build dist first');
const htmlCache=new Map();
for(const file of htmlFiles)htmlCache.set(file,await readFile(join(root,file),'utf8'));
let checked=0;
for(const [file,html] of htmlCache){
 assert.ok(!/Local preview|Sample content ·|Sample essay ·|Sample experiment|Visual placeholder/.test(html),`Preview content in ${file}`);
 assert.ok(!/github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]+|-----BEGIN .*PRIVATE KEY-----/.test(html),`Possible secret in ${file}`);
 assert.ok(!/The Engineering Notebook|Back to the notebook|Lately, in the margins|href="\/log\//i.test(html),`Retired branding or log link in ${file}`);
 assert.ok(!/<nav\b/.test(html),`Unexpected navigation bar in ${file}`);
 for(const [,attribute,raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  const url=raw.replaceAll('&amp;','&');
  if(!url.startsWith('/')&&!url.startsWith('#'))continue;
  if(url.startsWith('//'))continue;
  const [pathname,fragment]=url.split('#');
  let target=pathname?decodeURIComponent(pathname.split('?')[0]).replace(/^\//,''):file;
  if(!target||target.endsWith('/'))target+='index.html';
  const absolute=resolve(root,target);
  assert.ok(absolute.startsWith(root+'/'),`Path escapes output in ${file}`);
  assert.ok((await stat(absolute).catch(()=>null))?.isFile(),`${file}: broken ${attribute} ${url}`);
  if(fragment&&target.endsWith('.html')){
   const other=htmlCache.get(target)||await readFile(absolute,'utf8');
   assert.ok(other.includes(`id="${decodeURIComponent(fragment)}"`),`${file}: missing fragment ${url}`);
  }
  checked++;
 }
 if(process.env.EXPECT_SITE_URL){const route='/'+file.replace(/index\.html$/,'');assert.ok(html.includes(`rel="canonical" href="${new URL(route,process.env.EXPECT_SITE_URL).href}"`),`Canonical missing in ${file}`);}
}
for(const [collection,route] of [['writing','writing'],['projects','work'],['experiments','experiments']]){
 for(const file of await readdir(`src/content/${collection}`)){
  if(!/\.mdx?$/.test(file))continue;
  const content=await readFile(`src/content/${collection}/${file}`,'utf8');
  const frontmatter=content.split('---')[1]||'';
  const published=/^draft:\s*false\s*$/m.test(frontmatter)&&!/^sample:\s*true\s*$/m.test(frontmatter);
  if(!published)assert.ok(!files.includes(`${route}/${file.replace(/\.mdx?$/,'')}/index.html`),`Draft/sample leaked: ${file}`);
 }
}
assert.ok(!files.some(f=>/(^|\/)(qa-[^/]*|\.env[^/]*|\.obsidian)(\/|$)/.test(f)),'Temporary QA or private configuration in output');
assert.ok(!files.includes('log/index.html'),'Retired log route still built');
assert.ok(htmlCache.has('about/index.html'),'About page missing');
const cvExists=(await stat('public/files/Moaz_Mohamed_CV.pdf').catch(()=>null))?.isFile()??false;
for(const [file,html] of htmlCache)assert.equal(html.includes('class="cv-link icon-link"'),cvExists,`CV visibility mismatch in ${file}`);
const github=JSON.parse(await readFile('src/data/github.json','utf8'));
const home=htmlCache.get('index.html');
if(github.days.length){
 const total=github.days.reduce((s,d)=>s+d.count,0);
 assert.ok(home.includes(`${total.toLocaleString()} GitHub contributions`),'Calendar total missing');
 for(const day of github.days)assert.ok(home.includes(`aria-label="${day.count} contributions on ${day.date}"`),`Missing calendar day ${day.date}`);
}
console.log(`PASS: ${htmlFiles.length} public pages; ${checked} internal links/assets/fragments; draft/sample exclusion; calendar dates/counts; no QA/private configuration artifacts.`);
