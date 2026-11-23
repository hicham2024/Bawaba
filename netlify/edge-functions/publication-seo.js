import { enrichHtml } from '../../scripts/seo-html.mjs';
// Keep both original publications live and editable at their existing upstreams.
export default async function publicationSeo(request, context) {
  const response = await context.next();
  if (request.method !== 'GET' || response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  headers.set('cache-control','public, max-age=0, must-revalidate');
  const html = enrichHtml(await response.text(), new URL(request.url).pathname);
  return new Response(html,{status:response.status,headers});
}
export const config = { path: ['/mourabitoun/', '/lalamaghnia/'] };
