import { getCollection, type CollectionKey } from 'astro:content';
export const preview = import.meta.env.DEV || import.meta.env.CONTENT_PREVIEW === 'true';
export async function entries<T extends CollectionKey>(name:T) {
  return getCollection(name, ({data}) => preview || (!data.draft && !data.sample));
}
export const dateLabel = (date:Date) => date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
