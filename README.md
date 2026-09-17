# Pastel Tezgâh — GitHub için son sürüm

17 Eylül 2026 • Sürüm 6
Kaynak sürüm: 81041076c1332fbff415acb6de26d8488dbd61f8

Bu paket, oyunun güncel ve düzenlenebilir HTML, JavaScript, CSS ve görsel dosyalarını içerir. Node.js, npm veya derleme gerekmez. Dosya yolları GitHub Pages proje adreslerinde çalışacak şekilde göreli yapılmıştır.

## Mevcut projene yükleme

1. ZIP dosyasını bilgisayarında bir klasöre çıkar.
2. Mevcut GitHub oyun projenin yayınlanan `index.html` dosyasının bulunduğu klasörünü aç. Bu çoğunlukla projenin ana klasörüdür.
3. ZIP'in kendisini veya onu kapsayan klasörü değil, çıkardığın dosyaların **tamamını** bu klasöre yükle. `index.html`, JavaScript, CSS ve PNG dosyaları aynı klasörde olmalı.
4. Aynı adlı eski oyun dosyalarını bu sürümle değiştir ve değişiklikleri kaydet (commit).
5. Projenin mevcut GitHub Pages yayını tamamlanınca mevcut oyun linkini aç. Eski görünümü görüyorsan Ctrl+F5 ile yenile.

Mevcut alan adı, yayın ayarı ve projendeki diğer dosyalar bu paketin parçası değildir; bunları koru. Yayının `docs` klasöründen çalışıyorsa oyun dosyalarını `docs` içine yükle. Projen özel bir derleme/yayın iş akışı kullanıyorsa statik oyun klasörünü o akışın yayınladığı konuma koy.

## Bu sürümde

- Ekmekler arasında üç malzeme ve ilk açılış öğreticisi.
- Turkuaz tezgâh, çizgi film tarzında malzemeler, sesler ve sürükleme efektleri.
- Siparişin gerçek içeriğini gösteren burger kartları ve servis animasyonu.
- Daha sıkı burger katmanları, açılmış malzeme aralıkları ve düzeltilmiş mayonez görseli.
- Eksik malzemeleri getirme şansı yüksek tepsi yenileme: kariyer boyunca ilk üç ücretsiz; ardından 10, 15, 20 TL… Her yeni gün +5 TL.
- Dükkândan alınan dekorların oyun ekranında görünmesi.

## Dosyalar

- `index.html`: oyun ekranı ve açılış noktası.
- `game.js`: mekanikler, öğretici, kariyer, ses ve animasyonlar.
- `sprite-renderer.js`: malzemelerin ve tarife özel burgerlerin çizimi.
- `polish.css`: arayüz ve mobil görünüm.
- `three.min.js`: birlikte dağıtılan Three.js r128 kütüphanesi.
- PNG dosyaları: oyun görselleri.
- `.nojekyll`: statik dosyaların doğrudan yayınlanmasını sağlar.

Google Fonts bağlantısı fontları internetten yükler; yüklenemezse sistem fontu kullanılır. Oyun ilerlemesi tarayıcının yerel depolamasında tutulur; farklı site adresleri arasında otomatik taşınmaz. Ses ilk kullanıcı etkileşimiyle açılır.

Three.js MIT lisansıyla dağıtılır; lisans metni `THIRD-PARTY-LICENSES.txt` dosyasındadır.
