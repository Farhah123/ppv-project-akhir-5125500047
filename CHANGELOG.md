# Changelog

Semua perubahan penting pada proyek **Cari Jam Kosong Bareng** dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

## [0.4.0] - 2026-11-11
### Added
- Komponen reusable di `src/komponen.js`: `ChipAnggota`, `ItemAnggota`, `KartuHasil`, `Paragraf`, dan `Ringkasan`.
- Modul `src/storage.js` dengan `KUNCI` berversi, `muat()` yang menyaring data rusak, dan `simpan()` dengan try/catch.
- Pesan ke pengguna saat penyimpanan browser tidak tersedia atau penuh.

### Changed
- Daftar anggota, pilihan anggota, kartu hasil, dan tooltip dibuat lewat DOM dan `textContent`, bukan `innerHTML`.
- `muat()` dan `simpan()` di `state.js` kini memanggil `storage.js`.

### Fixed
- `simpan()` sebelumnya kosong sehingga data tidak pernah tersimpan; sekarang data bertahan setelah halaman dimuat ulang.
- Aplikasi tidak lagi bergantung pada data `localStorage` yang utuh; data rusak diabaikan dan aplikasi tetap terbuka.

## [0.3.0] - 2026-11-07
### Changed
- Kode dipecah menjadi 6 modul ES di folder `src/` (`main`, `state`, `tampilan`, `konfigurasi`, `bunyi`, `ui-pustaka`).
- Event dipasang dengan `addEventListener`; tidak ada variabel global aplikasi dan tidak ada `onclick`.

### Added
- `MODULE_MAP.md` berisi peta import dan tanggung jawab tiap modul.
- `manifest.json`.

## [0.2.0] - 2026-10-21
### Added
- Tiga tampilan dengan navigasi langkah: Anggota, Jadwal, Hasil.
- Gambar `ilustrasi.svg` dan audio `ding.wav` dengan tombol bunyi nyala/mati.
- Animasi pindah tampilan dan kolom nama bergetar saat isian salah.
- Bootstrap 5.3.3: Toast, Modal konfirmasi, dan Offcanvas pintasan keyboard.

## [0.1.0] - 2026-09-21
### Added
- Tambah dan hapus anggota dengan warna pilihan sendiri.
- Tabel jadwal mingguan yang bisa diklik atau digeser untuk menandai jam kosong.
- Tooltip, pencari waktu cocok, validasi masukan, dan pintasan keyboard.
