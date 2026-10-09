# Ussu Suni × Nehir

Yayın: https://ussu-suni.pages.dev/

Türkçe yapay zekâ için mobil ağırlıklı topluluk ve araştırma sitesi. Küçük modellerle başlar; tüm ölçekleri kanıt, Türkçe niteliği ve kaynak verimliliği üzerinden karşılaştırmayı hedefler.

## Yerel çalışma

```sh
npm ci
npm run dev
```

http://127.0.0.1:4173 adresini aç. Sunucuyu Ctrl+C ile durdur.

```sh
npm run check
npm test
npm run build
```

Build çıktısı `dist/`. Ziyaretçi kodu bağımlılıksız HTML/CSS/JavaScript; Wrangler yalnızca yayın aracıdır, jsdom yalnızca yerel testler içindir.

## Model radarı

9 Ekim 2026'da kontrol edilen tarihli anlık görüntüler:

- [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models): seçilmiş sekiz modelin genel Intelligence Index skorları. [Yöntem](https://artificialanalysis.ai/methodology/intelligence-benchmarking) ağırlıklı olarak İngilizce görevler içerir.
- [Arena Text Overall](https://arena.ai/leaderboard/chat/text): kaynağın 8 Ekim 2026 tarihli tablosundan seçilmiş yedi model; varyant, skor, belirsizlik ve oy sayısı korunur.

Veri `public/benchmarks.js` içindedir. Farklı kaynakların skorları birleştirilmez; farklı düşünme ayarları eşdeğer sayılmaz. Bu site testleri çalıştırmaz. Genel skorlar Türkçe sonuç değildir. Türkçe protokolü taslak aşamasındadır, kendi model skorlarımız henüz yoktur. Otomatik güncelleme yok; kaynak ve tarih doğrulandıktan sonra dosya güncellenir. Açık ağırlık, sınırsız kullanım veya Türkçe başarısı garantisi değildir.

## Katkı akışı

Gözlem → kanıt/belirsizlik → ayrı yayın/eğitim tercihleri → yerel JSON paket → kişinin kendi GitHub gönderimi → bağımsız inceleme adayı.

Yerel taslaklar ve örnek değerlendirmeler `ussu-suni-preview-v1` localStorage anahtarında saklanır. Veri sunucuya gönderilmez. Açık GitHub gönderimini kullanıcı sonlandırır. Kişisel tercihler açık gönderime açılmaz. Lisans/izin bilinmiyorsa katkı eğitime uygun sayılmaz. Yüksek risk ve tartışmalı bilgi uzman incelemesine yönlendirilir. Önerilen yollar yalnızca metadata; otomatik inceleme veya model eğitimi yoktur. Ayrıntılar [CONTRIBUTING.md](CONTRIBUTING.md) içinde.

## Ücretsiz yayın sınırı

Cloudflare Pages **salt statik Direct Upload**. Pages Functions, Worker runtime, KV, D1, R2, AI, cron veya ücretli plan kullanılmaz. [Cloudflare belgeleri](https://developers.cloudflare.com/pages/functions/routing/) salt statik Pages isteklerinin ücretsiz olduğunu açıklar. [Free limitleri](https://developers.cloudflare.com/pages/platform/limits/) ayrıca geçerlidir. Bu depo otomatik build/test veya model çıkarımı çalıştıran Actions içermez.

Yayın betiği yalnızca daha önce oluşturulan `ussu-suni` projesine statik dosyaları yükler. Başka projeler, domainler veya Worker rotaları değiştirilmez. Ana domain geçişi, doğru yazım ve mevcut eşleştirmeler doğrulandıktan sonra ayrı yapılır.

`public/_headers` CSP ve güvenlik başlıklarını içerir; `connect-src 'none'` uzak API çağrılarını engeller. `robots.txt` araştırma sürümünü indekslemeye kapatır; erişim kontrolü değildir. Özel vizyon kaynakları ve yerel proje notları bu açık depoya dahil edilmez.
