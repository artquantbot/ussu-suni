'use strict';
const BENCHMARK_DATA = {
 checkedAt:'2026-10-09',
 aa:{title:'Intelligence Index',date:'Kontrol: 9 Ekim 2026',url:'https://artificialanalysis.ai/leaderboards/models',description:'Ağırlıklı olarak İngilizce görevlerden oluşan genel yetenek indeksi. Seçilmiş modeller ve kaynakta ölçülen ayarları. Daha yüksek değer daha iyi; Türkçe için ayrı bir başarı puanı değildir.',unit:'İndeks',models:[
 {name:'Claude Opus 5.5',variant:'Max · Default Fallback',lab:'Anthropic',score:58,access:'closed'},
 {name:'GPT-6 Astra',variant:'max',lab:'OpenAI',score:53,access:'closed'},
 {name:'GPT-6.1 Sol',variant:'max',lab:'OpenAI',score:52,access:'closed'},
 {name:'MiMo-V2.6-Pro',variant:'Kaynakta listelenen ayar',lab:'Xiaomi',score:46,access:'open'},
 {name:'GLM-5.3',variant:'max',lab:'Z.ai',score:45,access:'open'},
 {name:'Kimi K3',variant:'max',lab:'Moonshot',score:44,access:'open'},
 {name:'Granite 4.2 3B',variant:'3B · Başlangıç adayı',lab:'IBM',score:9,access:'open'},
 {name:'Ministral 3 3B',variant:'3B · Başlangıç adayı',lab:'Mistral',score:5,access:'open'}]},
 arena:{title:'Text Arena · Overall',date:'Kaynak tarihi: 8 Ekim 2026 · Kontrol: 9 Ekim',url:'https://arena.ai/leaderboard/chat/text',description:'İnsanların yan yana yanıtlar arasındaki tercihlerinden oluşan skor. ± değeri kaynaktaki belirsizlik aralığıdır. Bu seçki tam sıralama değildir.',unit:'Arena skoru',models:[
 {name:'Gemini 4 Argon',variant:'high · Ön sonuç',lab:'Google',score:1525,uncertainty:9,rank:1,votes:4892,access:'closed'},
 {name:'Claude Opus 5.5',variant:'high',lab:'Anthropic',score:1507,uncertainty:8,rank:2,votes:6272,access:'closed'},
 {name:'GPT-6.1 Sol',variant:'max',lab:'OpenAI',score:1484,uncertainty:9,rank:21,votes:4512,access:'closed'},
 {name:'GPT-6 Astra',variant:'max',lab:'OpenAI',score:1475,uncertainty:7,rank:35,votes:10536,access:'closed'},
 {name:'GLM-5.3 Flash',variant:'Kaynakta listelenen ayar',lab:'Z.ai',score:1475,uncertainty:5,rank:38,votes:27678,access:'open'},
 {name:'Gemma 4 31B',variant:'31B',lab:'Google',score:1452,uncertainty:7,rank:75,votes:6145,access:'open'},
 {name:'Qwen3.8 27B',variant:'27B',lab:'Alibaba',score:1438,uncertainty:5,rank:99,votes:20711,access:'open'}]}
};
