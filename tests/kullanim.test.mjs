import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {JSDOM} from 'jsdom';

const sayfa = await readFile('public/index.html', 'utf8');
const kaynakVerileri = await readFile('public/benchmarks.js', 'utf8');
const uygulama = await readFile('public/app.js', 'utf8');
const yolculuk = await readFile('public/game.js', 'utf8');

function tarayiciAc(kayit) {
  const ortam = new JSDOM(sayfa, {url:'https://ussu-suni.pages.dev', runScripts:'outside-only'});
  const pencere = ortam.window;
  Object.defineProperty(pencere.crypto, 'randomUUID', {value:randomUUID});
  pencere.HTMLDialogElement.prototype.showModal = function(){this.open=true;};
  pencere.HTMLDialogElement.prototype.close = function(){this.open=false;this.dispatchEvent(new pencere.Event('close'));};
  pencere.scrollTo = () => {};
  if(kayit) pencere.localStorage.setItem('ussu-suni-preview-v1', JSON.stringify(kayit));
  pencere.eval(kaynakVerileri+'\n'+uygulama+'\n'+yolculuk+'\nwindow.sinama={istatistik:gameStats,gun:dayKey,durum:state};');
  return ortam;
}
function alanYaz(pencere, secici, deger) {
  const alan=pencere.document.querySelector(secici);
  alan.value=deger;
  alan.dispatchEvent(new pencere.Event(alan.tagName==='SELECT'?'change':'input',{bubbles:true}));
}
function kayitOku(pencere){return JSON.parse(pencere.localStorage.getItem('ussu-suni-preview-v1'));}
function katkiAc(pencere, tur='language') {
  pencere.document.querySelector('[data-action="compose"]').click();
  alanYaz(pencere,'#draft-type',tur);
  alanYaz(pencere,'#draft-title','Nehir duyurusundaki salon hatası');
  alanYaz(pencere,'#draft-prompt','Duyurudaki saat ve salon bilgisini oku.');
  alanYaz(pencere,'#draft-observed','Saat 14.30 · Salon 84');
  alanYaz(pencere,'#draft-body','Salon B4 yazıyor; B harfi 8 rakamına dönüştürülmemeli.');
}
function taslagiSakla(pencere){pencere.document.querySelector('#compose-form').requestSubmit();}
function yanitla(belge, secenek) {
  belge.querySelector(`[data-answer="${secenek}"]`).click();
  belge.querySelector('#lesson-check').click();
  belge.querySelector('#lesson-next').click();
}
function duragiBitir(belge, durak, yanitlar) {
  belge.querySelector(`.map-path [data-lesson="${durak}"]`).click();
  for(const yanit of yanitlar) yanitla(belge,yanit);
  belge.querySelector('[data-game="close"]').click();
}
function xpOku(belge){return Number(belge.querySelector('.game-stats b').textContent);}

// Uygulamanın arayüzünden yapılan işlemler sınanır; gerçek model çağrısı yoktur.
test('Model arayan kişi iki ölçüm kaynağını karıştırmadan açık ağırlıklı sonuçları bulur',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    b.querySelector('[data-metric="arena"]').click();
    assert.match(b.querySelector('#metric-title').textContent,/Arena/);
    alanYaz(p,'#model-access','open');
    const adlar=[...b.querySelectorAll('.model-name h3')].map(x=>x.textContent);
    assert.ok(adlar.length>0,'Açık ağırlıklı bir model bulunmalı.');
    assert.ok([...b.querySelectorAll('.model-access')].every(x=>x.textContent==='Açık ağırlık'));
    alanYaz(p,'#model-search',adlar[0]);
    assert.ok([...b.querySelectorAll('.model-name h3')].every(x=>x.textContent.includes(adlar[0])));
    alanYaz(p,'#model-search','nehir olmayan model');
    assert.match(b.querySelector('#benchmark-list').textContent,/eşleşme yok/);
    b.querySelector('[data-metric="aa"]').click();
    assert.doesNotMatch(b.querySelector('#metric-title').textContent,/Arena/);
  } finally {p.close();}
});
test('Yazılan HTML başlık metin olarak görünür; taslak izinsiz eğitime veya açık yayına açılmaz',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    katkiAc(p);alanYaz(p,'#draft-title','<img src=x onerror=alert(1)>');taslagiSakla(p);
    const taslak=kayitOku(p).drafts[0];
    assert.equal(taslak.permissions.training,'deny');assert.equal(taslak.learningEligibility,'denied');
    assert.equal(taslak.status,'unverified-draft');assert.equal(taslak.proposedRoute,'skill-candidate');
    assert.equal(b.querySelectorAll('#dialog-body img').length,0);
    assert.equal(b.querySelectorAll('#dialog-body a[href*="issues/new"]').length,0);
    assert.match(b.querySelector('#dialog-body').textContent,/<img src=x/);
  } finally {p.close();}
});
test('Kaynak görevinde dayanak eksikse kayıt yapılmaz; yüksek riskli iddia uzman incelemesine gider',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    b.querySelector('[data-task="source"]').click();
    assert.equal(b.querySelector('#draft-type').value,'source');
    alanYaz(p,'#draft-title','Duyurudaki kaynağı kontrol et');
    alanYaz(p,'#draft-prompt','Duyuru iddiayı destekliyor mu?');
    alanYaz(p,'#draft-body','Bağlantının iddiayı destekleyip desteklemediği ayrıca incelenmeli.');
    alanYaz(p,'#draft-source','https://ussu-suni.pages.dev/examples/atolye-karti.svg');
    taslagiSakla(p);assert.equal(p.sinama.durum.drafts.length,0);
    assert.equal(b.querySelector('#evidence-details').open,true);
    alanYaz(p,'#draft-evidence','Bu bir öğretici duyurudur; sağlık iddiası için dayanak olamaz.');
    alanYaz(p,'#draft-risk','high');taslagiSakla(p);
    assert.equal(kayitOku(p).drafts[0].proposedRoute,'specialist-review');
  } finally {p.close();}
});
test('Kişisel tercih açık yayın kutusu işaretlense bile topluluğa gönderim bağlantısı üretmez',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    katkiAc(p,'preference');alanYaz(p,'#draft-title','Kısa yanıt tercih ediyorum');
    alanYaz(p,'#draft-body','Benim yanıt uzunluğu tercihim herkese genellenmemeli.');
    b.querySelector('#draft-public').checked=true;b.querySelector('#draft-safe').checked=true;taslagiSakla(p);
    assert.equal(kayitOku(p).drafts[0].proposedRoute,'personal-only');
    assert.equal(b.querySelectorAll('#dialog-body a[href*="issues/new"]').length,0);
  } finally {p.close();}
});
test('Yanlış yanıttan sonra yeniden denenebilir; doğru tamamlanan durak açılır ve tekrar XP üretmez',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    assert.equal(b.querySelector('.map-path [data-lesson="uncertainty"]').disabled,true);
    b.querySelector('.map-path [data-lesson="language"]').click();
    b.querySelector('[data-answer="0"]').click();b.querySelector('#lesson-check').click();
    assert.match(b.querySelector('#lesson-feedback').textContent,/tekrar düşünelim/);
    assert.equal(xpOku(b),0);b.querySelector('#lesson-next').click();
    assert.match(b.querySelector('#dialog-title').textContent,/önbelleğe/);
    for(const secenek of [1,0,2])yanitla(b,secenek);
    assert.equal(xpOku(b),20);
    assert.equal(b.querySelector('.map-path [data-lesson="uncertainty"]').disabled,false);
    b.querySelector('[data-game="close"]').click();duragiBitir(b,'language',[1,0,2]);
    assert.equal(xpOku(b),20);assert.match(b.querySelector('.daily-goal h3').textContent,/1 \/ 1/);
  } finally {p.close();}
});
test('Tarayıcı yeniden açılınca yarım kalan soruya dönülür; iki ayrı taslak yalnızca bir katkı ödülü kazandırır',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;let yeniOrtam;
  try {
    b.querySelector('.map-path [data-lesson="language"]').click();yanitla(b,1);
    b.querySelector('#dialog-close').click();alanYaz(p,'#daily-goal-select','2');
    yeniOrtam=tarayiciAc(kayitOku(p));const yeni=yeniOrtam.window, belge=yeni.document;
    belge.querySelector('.game-continue').click();assert.match(belge.querySelector('#dialog-title').textContent,/Etekleri/);
    assert.equal(belge.querySelector('#daily-goal-select').value,'2');belge.querySelector('#dialog-close').click();
    katkiAc(yeni);taslagiSakla(yeni);assert.equal(xpOku(belge),10);
    katkiAc(yeni);alanYaz(yeni,'#draft-title','İkinci özgün gözlem');taslagiSakla(yeni);
    assert.equal(kayitOku(yeni).drafts.length,2);assert.equal(xpOku(belge),10);
    assert.ok(kayitOku(yeni).drafts.every(t=>t.permissions.training==='deny'));
  } finally {p.close();yeniOrtam?.window.close();}
});
test('Türkiye gece yarısında yeni gün başlar; ara vermek seriyi bitirir ama kazanılmış XP silinmez',()=>{
  const ortam=tarayiciAc({saved:[],drafts:[],evaluations:{},game:{completed:['language'],practice:{'2026-10-07':['language'],'2026-10-08':['language'],'2026-99-99':['language'],'2026-02-31':['language']},session:{id:'permissions',step:1}}}),p=ortam.window;
  try {
    assert.equal(p.sinama.istatistik('2026-10-09').streak,2);
    assert.equal(p.sinama.istatistik('2026-10-10').streak,0);
    assert.equal(p.sinama.istatistik('2026-10-10').xp,20);
    assert.equal(p.sinama.gun(new Date('2026-10-08T21:01:00Z')),'2026-10-09');
    assert.equal(p.sinama.durum.game.practice['2026-02-31'],undefined);
    assert.equal(p.sinama.durum.game.session,null);
  } finally {p.close();}
});
test('Görsel okuma katkısı Türkçe karakterleri ve satırları korur; eksik beklenen metin kaydedilemez',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    b.querySelector('[data-task="vision"]').click();assert.equal(b.querySelector('#draft-type').value,'vision');
    alanYaz(p,'#draft-prompt','Atölye kartındaki metni satırlarıyla aktar.');
    alanYaz(p,'#draft-observed','Nehir Atolyesi\nSaat 14.30 · Salon 84');
    alanYaz(p,'#draft-body','ö harfi korunmalı; salon B4, 84 değildir. Satırlar ayrı kalmalı.');
    alanYaz(p,'#visual-reference','https://ussu-suni.pages.dev/examples/atolye-karti.svg');
    taslagiSakla(p);assert.equal(p.sinama.durum.drafts.length,0);assert.equal(xpOku(b),0);
    const beklenen='Nehir Atölyesi\nSaat 14.30 · Salon B4';alanYaz(p,'#visual-expected',beklenen);taslagiSakla(p);
    const taslak=kayitOku(p).drafts[0];assert.equal(taslak.visual.expected,beklenen);
    assert.equal(taslak.visual.task,'ocr');assert.equal(taslak.visual.datasetUse,'unassigned');
    assert.equal(taslak.learningEligibility,'denied');assert.equal(taslak.proposedRoute,'skill-candidate');
    assert.match(b.querySelector('#dialog-body').textContent,/Görsel dosyası bu pakete dahil değil/);
    assert.equal(b.querySelectorAll('#dialog-body img').length,0);
  } finally {p.close();}
});
test('Betimleme katkısında üçüncü taraf görseline verilen eğitim izni hak incelemesini atlayamaz',()=>{
  const ortam=tarayiciAc(), p=ortam.window;
  try {
    katkiAc(p,'vision');alanYaz(p,'#visual-task','caption');
    alanYaz(p,'#visual-reference','https://ussu-suni.pages.dev/examples/masa.svg');
    alanYaz(p,'#visual-expected','Masanın üzerinde açık kitap, bardak ve saksıda bitki var.');
    alanYaz(p,'#draft-origin','third-party');alanYaz(p,'#draft-license','CC0-1.0');
    alanYaz(p,'#draft-training','allow-original');p.document.querySelector('#draft-safe').checked=true;taslagiSakla(p);
    const taslak=kayitOku(p).drafts[0];assert.equal(taslak.visual.task,'caption');
    assert.equal(taslak.learningEligibility,'rights-and-privacy-review');
    assert.equal(taslak.visual.datasetUse,'unassigned');assert.equal(taslak.status,'unverified-draft');
  } finally {p.close();}
});
test('Görsel kaynağı olarak çalıştırılabilir adres reddedilir; normal katkıya geçince görsel alanları zorunlu kalmaz',()=>{
  const ortam=tarayiciAc(), p=ortam.window;
  try {
    katkiAc(p,'vision');alanYaz(p,'#visual-reference','javascript:alert(1)');
    alanYaz(p,'#visual-expected','Nehir Atölyesi');taslagiSakla(p);
    assert.equal(p.sinama.durum.drafts.length,0);
    alanYaz(p,'#draft-type','language');taslagiSakla(p);
    assert.equal(kayitOku(p).drafts.length,1);assert.equal(kayitOku(p).drafts[0].visual,undefined);
  } finally {p.close();}
});
test('Görsel alıştırmasında B harfi rakamla karıştırılmaz, görülmeyen ayrıntı ve kapalı fiyat uydurulmaz',()=>{
  const ortam=tarayiciAc(), p=ortam.window, b=p.document;
  try {
    duragiBitir(b,'language',[1,0,2]);duragiBitir(b,'uncertainty',[1,1,0]);duragiBitir(b,'evidence',[1,2,0]);
    b.querySelector('.map-path [data-lesson="vision"]').click();
    assert.equal(b.querySelector('.lesson-image img').getAttribute('src'),'/examples/atolye-karti.svg');
    yanitla(b,1);assert.match(b.querySelector('#dialog-title').textContent,/saat ve salon/);
    yanitla(b,0);assert.equal(b.querySelector('.lesson-image img').getAttribute('src'),'/examples/masa.svg');
    yanitla(b,1);assert.equal(b.querySelector('.lesson-image img').getAttribute('src'),'/examples/belirsiz-etiket.svg');
    b.querySelector('[data-answer="0"]').click();b.querySelector('#lesson-check').click();
    assert.match(b.querySelector('#lesson-feedback').textContent,/Okunamayan bölüm/);
    assert.equal(xpOku(b),60);b.querySelector('#lesson-next').click();yanitla(b,2);
    assert.equal(xpOku(b),80);assert.equal(b.querySelector('.map-path [data-lesson="permissions"]').disabled,false);
  } finally {p.close();}
});

test('Yeni görsel durağı eklendiğinde önceki sürümde kazanılan rozet ve yarım kalan izin sorusu korunur',()=>{
  const ortam=tarayiciAc({saved:[],drafts:[],evaluations:{},game:{completed:['language','uncertainty','evidence','permissions'],practice:{},session:{id:'permissions',step:1}}}),p=ortam.window,b=p.document;
  try {
    assert.equal(xpOku(b),80);
    assert.equal(b.querySelector('.map-path [data-lesson="permissions"]').disabled,false);
    assert.equal(b.querySelector('.map-path [data-lesson="vision"]').disabled,false);
    b.querySelector('.game-continue').click();assert.match(b.querySelector('#dialog-title').textContent,/etkinliğin saati/);
    assert.match(b.querySelector('.badge-panel').textContent,/İzinlerin izindeKazanıldı/);
  } finally {p.close();}
});
