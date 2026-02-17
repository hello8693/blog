import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

const root = process.cwd();
const targetDir = path.join(root, 'source', 'img');
const outFile = path.join(targetDir, 'bing-hero.jpg');
const metaFile = path.join(targetDir, 'bing-hero.json');

const mkt = process.env.BING_MKT || 'zh-CN';
const api = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&uhd=1&mkt=${mkt}`;

const apiRes = await fetch(api);
if (!apiRes.ok) {
  throw new Error(`Bing API request failed: ${apiRes.status} ${apiRes.statusText}`);
}

const data = await apiRes.json();
const img = data && data.images && data.images[0];
if (!img || !img.url) {
  throw new Error('Bing API response missing image url');
}

const fullUrl = img.url.startsWith('http') ? img.url : `https://www.bing.com${img.url}`;

const imgRes = await fetch(fullUrl);
if (!imgRes.ok) {
  throw new Error(`Bing image download failed: ${imgRes.status} ${imgRes.statusText}`);
}

const buf = Buffer.from(await imgRes.arrayBuffer());

await mkdir(targetDir, { recursive: true });
await writeFile(outFile, buf);
await writeFile(metaFile, JSON.stringify({ fetchedAt: new Date().toISOString(), url: fullUrl, mkt }, null, 2));

console.log(`Bing hero image saved: ${outFile}`);
