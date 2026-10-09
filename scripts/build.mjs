import { cp, mkdir, readdir, rm } from 'node:fs/promises';
const files=await readdir('public');
if(files.some(name=>['functions','_worker.js','_routes.json'].includes(name))) throw new Error('Salt statik yayın: runtime/Functions dosyaları kabul edilmez.');
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of files) await cp(`public/${file}`,`dist/${file}`,{recursive:true});
console.log('Salt statik site dist/ klasörüne hazırlandı. Uzak build başlatılmadı.');
