import type {ImageMetadata} from 'astro';
import {statSync} from 'node:fs';
import {resolve} from 'node:path';

// Import only files that exist. A stale optional thumbnail cannot break content sync.
const thumbnails=import.meta.glob<{default:ImageMetadata}>('/src/assets/certificates/**/*.{png,jpg,jpeg,webp,avif}',{eager:true});
export function certificateThumbnail(reference?:string):ImageMetadata|undefined {
  if(!reference)return;
  const image=thumbnails[resolve('/src/content/certificates',reference)]?.default;
  if(!image)console.warn(`[certificates] Thumbnail unavailable: ${reference}`);
  return image;
}
export function certificateFile(reference?:string):string|undefined {
  if(!reference)return;
  const file=resolve('public',reference.slice(1));
  try {
    if(file.startsWith(resolve('public/files/certificates')+'/')&&statSync(file).isFile())return reference;
  } catch { /* Optional files may be added later. */ }
  console.warn(`[certificates] File unavailable: ${reference}`);
}
