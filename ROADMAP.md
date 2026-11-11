# ROADMAP

## Sprint 3: Modularisasi dengan ES Modules (selesai)

- [x] Kode aplikasi dipecah menjadi 6 modul ES di folder `src/`
- [x] Dimuat dengan `<script type="module" src="src/main.js">`
- [x] Tidak ada variabel global aplikasi dan tidak ada `onclick`
- [x] Dikerjakan di cabang `refactor/modul` dengan commit `refactor:` per langkah
- [x] Peta modul ditulis di `MODULE_MAP.md`
- [x] Merge cabang `refactor/modul` ke `main`

## Sprint 4: Komponen, penyimpanan aman, dan perawatan (v0.4.0)

- [x] Komponen reusable di `src/komponen.js`: `ChipAnggota`, `ItemAnggota`, `KartuHasil` (plus `Paragraf` dan `Ringkasan`)
- [x] `KartuHasil` dipakai untuk semua item daftar hasil, dan di dalamnya `ChipAnggota` dipakai ulang untuk tiap anggota
- [x] Penyimpanan aman di `src/storage.js`: `KUNCI` berversi, `muat()` tahan data rusak, `simpan()` memakai try/catch
- [x] Perbaikan: `simpan()` di `state.js` sebelumnya kosong, sekarang data benar-benar tersimpan
- [x] Pesan ke pengguna saat penyimpanan browser tidak tersedia atau penuh
- [x] Teks pengguna tidak lagi dimasukkan lewat `innerHTML`
- [x] Uji manual S2 (JSON rusak) dan S6 (penyimpanan diblokir) di DevTools, lengkap dengan tangkapan layar
- [x] `CHANGELOG.md` dan tag `v0.4.0` di-push ke GitHub
