import { cp, mkdir, readdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of await readdir('public')) await cp(`public/${file}`, `dist/${file}`, { recursive: true });
console.log('Statik site dist/ klasörüne hazırlandı. Uzak build veya yayın yapılmadı.');
