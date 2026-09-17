import { readFile, writeFile } from 'node:fs/promises';

const path='dist/client/index.html';
let html=await readFile(path,'utf8');

for(const id of ['idrissides','almoravides','almohades','marinides']){
  html=html.replaceAll(`/livres.html?lang=ar#${id}`,`/livres.html?lang=ar&category=youth#${id}`);
}

await writeFile(path,html,'utf8');
console.log('Bawaba store links point directly to the youth category and preserve book anchors.');
