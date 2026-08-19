import { getStore } from '@netlify/blobs';

const expected = [
  'idrissides/ar.pdf','idrissides/fr.pdf','idrissides/en.pdf','idrissides/es.pdf','idrissides/nl.pdf','idrissides/it.pdf',
  'almoravides/ar.pdf','almoravides/fr.pdf','almoravides/en.pdf','almoravides/es.pdf','almoravides/nl.pdf','almoravides/it.pdf',
  'almohades/ar.pdf','almohades/fr.pdf','almohades/en.pdf','almohades/es.pdf','almohades/nl.pdf','almohades/it.pdf'
];

export default async () => {
  try {
    const store = getStore('ebooks-private');
    const { blobs } = await store.list();
    const present = new Set(blobs.map(b => b.key));
    const status = expected.map(key => ({ key, present: present.has(key) }));
    return Response.json({
      expected: expected.length,
      present: status.filter(x => x.present).length,
      missing: status.filter(x => !x.present).map(x => x.key),
      status
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
};
