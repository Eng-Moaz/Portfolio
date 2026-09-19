import sharp from 'sharp';
import {access,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
const [source,slug,name='hero']=process.argv.slice(2);
if(!source||!slug||![slug,name].every(s=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))){console.error('Usage: npm run image:prepare -- /path/to/image.png project-slug image-name');process.exit(1);}
const output=resolve('public/images/projects',slug,`${name}.webp`);
try {await access(output);console.error('Destination exists; choose a new name. Nothing overwritten.');process.exit(1);}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(dirname(output),{recursive:true});
const info=await sharp(source).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile(output);
console.log(`  - src: /${relative('public',output)}\n    alt: Describe the image\n    caption: Optional caption\n    width: ${info.width}\n    height: ${info.height}\n    kind: screenshot`);
