# BlockVerse Master

## Current State
- Ses sistemi Web Audio API ile temel efektler var ama arka plan müziği yok
- Oyun sonu (GameOver) ekranında rewarded ad butonu yok
- Günlük görevlerde haftalık görev sistemi eksik, görev çeşidi sınırlı
- Uygulama adı hala "BlockVerse" olarak görünüyor (logo img alt, tr.json, diğer locale'ler)
- Native ad yalnızca MobileNativeAd componentinde yer alıyor ama oyun ekranında kullanılmıyor
- app-ads.txt mevcut, AdMob ID'ler doğru

## Requested Changes (Diff)

### Add
- `sounds.ts`: Arka plan müziği için `playBackgroundMusic()` ve `stopBackgroundMusic()` fonksiyonları - Web Audio API ile sentezlenmiş döngüsel ambient/game müzik
- `GameOver.tsx`: Rewarded ad butonu (MobileRewardedAdButton) - oyun bittikten sonra ekstra güçlendirme kazanma seçeneği
- Haftalık görev sistemi: `dailyMissions.ts` dosyasına haftalık görev desteği (ayrı süre, 7 günlük reset)
- `DailyMissionsModal.tsx`: Günlük ve haftalık sekmeler
- Tüm locale dosyalarında "BlockVerse Master" branding güncellemesi

### Modify
- `tr.json` ve diğer 9 locale: `app.title` → "BlockVerse Master", `auth.welcome` → uygun isimle güncelle
- `StartupScreen.tsx`: Logo alt text "BlockVerse Master"
- `Header.tsx`: Logo alt text "BlockVerse Master"
- `Game.tsx`: Oyun bitince arka plan müziği durdur, başlayınca başlat
- `GameOver.tsx`: Rewarded ad butonu ekle (prop olarak userCode, theme, isOffline)
- `Game.tsx`: GameOver bileşenine userCode ve isOffline prop'ları geç, rewarded ad callback ekle

### Remove
- Hiçbir şey kaldırılmıyor

## Implementation Plan
1. `sounds.ts` - arka plan müzik sistemi ekle (playBackgroundMusic, stopBackgroundMusic, looping ambient synth)
2. `GameOver.tsx` - rewarded ad butonu ekle (MobileRewardedAdButton), prop interface genişlet
3. `Game.tsx` - GameOver'a userCode/isOffline prop geç, müzik başlatma/durdurma entegrasyonu
4. `dailyMissions.ts` - haftalık görev yapısı ekle (WeeklyMission, getWeeklyMissions, updateWeeklyMissionProgress, claimWeeklyMissionReward)
5. `DailyMissionsModal.tsx` - günlük/haftalık sekme UI
6. Tüm 10 locale dosyasında "BlockVerse" → "BlockVerse Master" branding
7. `StartupScreen.tsx` ve `Header.tsx` alt text güncelle
