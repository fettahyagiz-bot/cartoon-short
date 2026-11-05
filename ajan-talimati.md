# Ajan Talimatı — cartoon-short (Türkçe dikey short üretimi)

Bu dosyadaki komutları aynen kullan. Belirsizlikte SORMA — aşağıdaki "Varsayılan kararlar" bölümüne göre ilerle. Sadece "Mutlaka sor" listesindeki durumlarda dur.

## 0. Ortam (her işe başlamadan doğrula)

```bash
ls ~/cartoon-short/src/videos/bridge/Bridge.tsx ~/chrome-sw.sh ~/turkce-ses-edge.py
ls ~/cartoon-short/public/bridge/kenney/ | wc -l   # 24 olmalı
```

- Proje: `~/cartoon-short` (Remotion 4 + three.js, 1080x1920, 30fps)
- Her `remotion` komutuna MUTLAKA ekle: `--browser-executable=$HOME/chrome-sw.sh`
- `npm install` GEREKMEZ (kurulu). Sürüm değiştirme (three/postprocessing/fiber pinli).

## 0b. İş tarifi (kullanıcıdan alınacaklar — eksikse SOR)

Her yeni işte şu 5 bilgi TAMAMLANMADAN başlama:

1. **Konu:** Tek cümle (örn. "Köprünün şarkıya âşık olması").
2. **Bölüm sayısı + süre:** Kaç bölüm (örn. 15) ve bölüm süresi (varsayılan: ≈60 sn / 110-120 kelime).
3. **Ses:** Kadın/erkek + dil (varsayılan: `tr-TR-EmelNeural`). Belirtilmediyse varsayılanla ilerle, sorma.
4. **Dünya/stil:** Mevcut Bridge dünyası mı, yeni dünya mı? Belirtilmediyse mevcutla ilerle.
5. **Çıktı adı:** Belirtilmediyse `out/short-sNN.mp4` (seri) veya `out/short.mp4` (tekil).

## 1. Ses (Türkçe, ücretsiz, kelime zamanlamalı)

```bash
cd ~/cartoon-short
~/.venvs/cartoon/bin/python ~/turkce-ses-edge.py "HİKAYE" -o voice --ses tr-TR-EmelNeural
ls -l voice/   # voice.mp3 + voice.wav + words.json olmalı
```

- Kadın: `tr-TR-EmelNeural` (varsayılan) · Erkek: `tr-TR-AhmetNeural` · İngilizce: `en-US-AriaNeural`
- Videoya bağlama (bir kez yapıldı, kontrol et): `voice/voice.mp3` → `public/voice/voice.mp3` kopyalı olmalı; `Bridge.tsx` içinde `<Audio src={staticFile("voice/voice.mp3")} />` satırı olmalı.
- Yeni hikâyede: önce metni kullanıcıya ONAYLAT, sonra üret. **Kelime sınırı: 110-120 kelime** (≈60 sn Short hedefi). Üretim sonrası süre 55-65 sn olmalı; değilse metni kısalt/uzat.

## 1b. Seri üretimi (S1 → S15 devamlılık — ÖNEMLİ)

Bölümler birbirinin devamıdır, akış kopmaz. Sırayı bozma:

1. **Önce arc onayı:** 15 bölümün HER BİRİ için 1 cümlelik özet yaz, kullanıcıya onaylat. Özetler bir öncekinin kaldığı yerden başlar (kişiler, mekân, durum tutarlılığı).
2. **Bölüm metni:** Onaylı özete göre 110-120 kelimelik anlatım metni yaz, yine ONAYLAT. Her bölüm ilk cümlesiyle önceki bölüme bağlanır (örn. "Köprü o şarkıyı duyduktan sonra..."), son cümlesi merak bırakır.
3. **Ses:** `... -o voice-sNN` (örn. `voice-s01`) — her bölüm kendi klasörüne. Süre 55-65 sn olmalı.
4. **Video:** `out/short-sNN.mp4` — her bölüm kendi dosyasına. Bölüm bitmeden SONRAKİ bölüme geçme.
5. Tutarlılık: karakter adları, mekânlar, ses (`--ses`) TÜM bölümlerde aynı kalır. Değişiklik gerekirse kullanıcıya sor.

## 2. 3D kitler (Kenney, CC0)

- `public/bridge/kenney/` altında 24 GLB hazır. Yeni prop gerekiyorsa ÖNCE oraya bak.
- Dış kaynak sırası: `~/İndirilenler` ve `~/Desktop` altındaki zip'ler (Fantasy Town 2.0, Food, Pirate, Medieval-RTS, nature-kit, castle-kit).
- `unzip -Z1 <zip> | grep -i "\.glb$"` ile iç listele, `unzip -o -j <zip> "İÇ/YOL/dosya.glb" -d public/bridge/kenney/` ile çıkar.
- **Doku (Textures) kuralı:** Bazı GLB'ler harici doku ister (`Textures/colormap.png` 404'ü). `'*colormap.png'` deseniyle ÇEKME — FBX+GLB+OBJ üç varyantı üst üste yapıştırıp bozuk PNG yazar (33KB). SADECE GLB varyantını tam yolla çıkar + `file` ile doğrula:
```bash
unzip -p "$HOME/İndirilenler/kenney_fantasy-town-kit_2.0.zip" "Models/GLB format/Textures/colormap.png" > public/bridge/kenney/Textures/colormap.png
file public/bridge/kenney/Textures/colormap.png   # PNG image data, 512x512 olmalı (~11KB)
```
- **KENNEY kuralı** (`world.ts`): `banner*` ile başlayanlar ve veg isimleri (`tree*`, `hedge`, `plant_bush*`, `flower*`, `grass*`, `lily*`) PROSEDÜREL üretilir — GLB dosyası gerekmez, `KENNEY` listesine EKLEME (404 verir). Sadece `prop()`/`kitClone()` ile gerçekten okunan isimleri ekle (örn. `lantern`, `cart`, `stall-red`, `windmill`).

## 3. Kritik fix — composer settle (ASLA KALDIRMA)

`Inner` içindeki `composer settle` bloğu (`delayRender` + 4 kare `advance` pompası), still ve ilk karede bestecinin boş çıkmasını engeller. Yeni sahne dosyası yazarsan AYNI bloğu koy. "Boş/mor-pembe render" görürsen ilk iş: bu bloğun dosyada durduğunu `grep -n "composer settle"` ile doğrula.

## 4. Test akışı (sırayı bozma, ucuzdan pahalıya)

```bash
cd ~/cartoon-short
# 1) Hızlı still (geometri/sahne QA): efektsiz + düşük çözünürlük
npx remotion still src/Root.tsx BridgeShort out/q.png --frame=200 --props='{"post":{"ink":false,"lens":false,"bloom":false,"grade":false,"dpr":0.5}}' --timeout=300000 --overwrite --browser-executable=$HOME/chrome-sw.sh
ls -l out/q.png   # ~37KB = BOŞ (hata!), ~1-2MB = dolu

# 2) Kare dizisi (video yolu + zamanlama QA)
npx remotion render src/Root.tsx BridgeShort out/d --sequence --frames=0-9 --overwrite --browser-executable=$HOME/chrome-sw.sh
ls -l out/d/      # element-0.png boş OLABİLİR (normal), 1-9 dolu olmalı

# 3) Kısa A/V testi (ses gömülü mü) + DOĞRULAMA (atlama)
npx remotion render src/Root.tsx BridgeShort out/test-av.mp4 --frames=0-11 --props='{"post":{"ink":false,"lens":false,"bloom":false,"grade":false,"grain":false,"dpr":0.5}}' --timeout=300000 --overwrite --browser-executable=$HOME/chrome-sw.sh
# Logda "Rendered 12/12" + "Encoded 12/12" olmalı; sonra:
ffprobe -hide_banner out/test-av.mp4 2>&1 | grep -E "Duration|Stream"
# Beklenen: Duration ~0.41s + "Video: h264 1080x1920" + "Audio: aac" satırı. Audio satırı YOKSA ses bağlanmamış demektir (6. maddeye bak).
# SAAT NOTU: makine UTC, kullanıcı TR saatinde (+3). Dosya saatini +3 ekleyerek yorumla (12:56 UTC = 15:56 TR).

# 4) Tam video (SAATLER sürer — gece başlat, nohup ile)
nohup npx remotion render src/Root.tsx BridgeShort out/short.mp4 --timeout=600000 --overwrite --browser-executable=$HOME/chrome-sw.sh > /tmp/render.log 2>&1 &
echo "pid: $!"
# HIZ ÖLÇÜTÜ: 12 karelik efektsiz test ~16 dk sürdü (≈80 sn/kare). Tam efektli DAHA yavaştır — 2025 kare = saatler, hatta 1+ gün sürebilir. İzleme:
tail -3 /tmp/render.log; grep -ci " 404" /tmp/render.log   # 0 olmalı (doku 404 teyidi)
```

## 5. Varsayılan kararlar (sorma, böyle yap)

- Test stillerinde HEP efektsiz + `dpr:0.5` kullan; tam efektliyi sadece final QA'da al.
- Boyut yorumu: `~37-42KB` = boş/tek-renk (HATA), `~1-2MB` = dolu sahne (OK).
- Konsol `console.log`ları render loguna İLETİLMEZ — durum testini piksele yaz (arka plan rengi + yazı).
- Yeni dosya/deneme için `DebugN.tsx` kopyası üret, asıl `Bridge.tsx`/`world.ts`/`build.ts`'i bozma.
- `public/` altına elinle dosya koyarsan render öncesi `ls` ile yerinde olduğunu doğrula.
- Sürüm yükseltme/downgrade YAPMA. Yeni npm paketi ekleme (gerekirse sor).
- **Süre eşleşmesi:** Video karesi = ses süresinin KIRPILMIŞ halini geçemez. Render ÖNCESİ `words.json`/ses süresini al, `TOTAL = ceil(ses_sn × 30)` yap (örn. 71,5 sn ses → 2145 kare). Ses videodan uzunsa son cümle kesilir — TOTAL'ı büyüt ya da sesi kırp, asla taşırma.

## 6. Sorun giderme (semptom → aksiyon)

| Semptom | Yapılacak |
|---|---|
| Still `~37KB`, tek renk | `grep -n "composer settle" src/videos/bridge/Bridge.tsx` — yoksa SETTLE BLOĞUNU GERİ KOY (4. maddedeki tam video öncesi bu dosyaya bakma). Varsa `--props` ile efektsiz dene |
| `...glb ... 404` | Dosya `public/bridge/kenney/`de mi? (`ls`). Yoksa 2. maddeye göre bul/kopyala. Veg/banner ismi ise `KENNEY` listesinden SİL |
| `timeout ... exceeded` | `--timeout=300000` (still) / `600000` (video) ekle; testte `dpr:0.5` + efektsiz kullan |
| Video karesi simsiyah/şeffaf ama still dolu | Normaldir (ilk-kare zamanlaması) — settle bloğu + `--frames=1-9` ile doğrula |
| `registerRoot` hatası | Entry dosyası `src/Root.tsx` olmalı (`src/index.ts` DEĞİL) |
| Ses yok | `public/voice/voice.mp3` var mı? `Bridge.tsx`te `<Audio ...>` var mı? |
| Doku PNG'si çalışmıyor / boyutu 3 katı | `file` ile bak — 3 varyant yapışmışsa (33KB) silip SADECE `"Models/GLB format/Textures/colormap.png"`yı çıkar (~11KB) |

## 7. Mutlaka sor (bunlar dışında sorma)

1. Hikâye metni üretmeden ÖNCE kullanıcıya onaylat.
2. Saatler sürecek TAM renderı başlatmadan ÖNCE söyle (gece işi).
3. Mevcut `Bridge.tsx`/`world.ts`/`story.ts` mantığını değiştirecek bir şey gerekirse ÖNCE söyle, sonra dokun.
