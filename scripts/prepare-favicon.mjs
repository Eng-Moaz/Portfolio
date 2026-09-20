import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const source=process.argv[2]||'src/assets/favicon/github-avatar.png';
const sizes=[16,32,48];
const icons=await Promise.all(sizes.map(size=>sharp(source).rotate().resize(size,size,{fit:'contain',background:'#171a24'}).png().toBuffer()));
for(const [i,size] of sizes.entries())if(size!==48)await writeFile(`public/favicon-${size}x${size}.png`,icons[i]);
await sharp(source).rotate().resize(180,180,{fit:'contain',background:'#171a24'}).png().toFile('public/apple-touch-icon.png');
// ICO directory with three PNG payloads, one per standard small icon size.
const header=Buffer.alloc(6+16*sizes.length);
header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(const [i,size] of sizes.entries()){
 const entry=6+i*16;header[entry]=size;header[entry+1]=size;
 header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);
 header.writeUInt32LE(icons[i].length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=icons[i].length;
}
await writeFile('public/favicon.ico',Buffer.concat([header,...icons]));
console.log('Created local 16/32px PNGs, 16/32/48px favicon.ico and 180px Apple touch icon.');
