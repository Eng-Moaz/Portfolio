import { readFile, writeFile, rename } from 'node:fs/promises';
const cache=new URL('../src/data/github.json',import.meta.url);
export function parseCalendar(html){
 const tips=new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(m=>[m[1].match(/\bfor="([^"]+)"/)?.[1],m[2].replace(/<[^>]*>/g,'').trim()]));
 const days=[...html.matchAll(/<td\b([^>]*data-date="[^"]+"[^>]*)>/g)].map(m=>{const a=m[1];const date=a.match(/data-date="([^"]+)"/)?.[1];const id=a.match(/\bid="([^"]+)"/)?.[1];const tip=tips.get(id)||'';const count=/^No contributions/.test(tip)?0:Number(tip.match(/^([\d,]+) contribution/)?.[1]?.replaceAll(',',''));const level=Number(a.match(/data-level="(\d)"/)?.[1]);if(!date||!Number.isInteger(count)||count<0||!Number.isInteger(level)||level>4)throw Error('Invalid day');return {date,count,level};}).sort((a,b)=>a.date.localeCompare(b.date));
 if(days.length<350||days.length>371||new Set(days.map(d=>d.date)).size!==days.length)throw Error('Incomplete calendar');
 for(let i=1;i<days.length;i++)if(Date.parse(days[i].date)-Date.parse(days[i-1].date)!==86400000)throw Error('Calendar gap');
 return {user:'Eng-Moaz',source:'https://github.com/users/Eng-Moaz/contributions',fetchedAt:new Date().toISOString(),days};
}
try {
 const html=process.argv[2]?await readFile(process.argv[2],'utf8'):await fetch('https://github.com/users/Eng-Moaz/contributions',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error(`GitHub ${r.status}`);return r.text()});
 const data=parseCalendar(html);await writeFile(new URL('../src/data/github.json.tmp',import.meta.url),JSON.stringify(data,null,2)+'\n');await rename(new URL('../src/data/github.json.tmp',import.meta.url),cache);console.log(`Cached ${data.days.length} days; ${data.days.reduce((s,d)=>s+d.count,0)} contributions.`);
} catch(e){console.warn(`GitHub refresh unavailable; last cache preserved. ${e.message}`);}
