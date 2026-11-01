# Cari Jam Kosong Bareng

Aplikasi web untuk mencari jam kerja kelompok yang cocok. Tiap anggota menandai jam kosongnya di tabel jadwal mingguan, lalu aplikasi mencari waktu ketika semua anggota sama-sama kosong.

- **Nama:** Farhah Athallah Tsabitah
- **NRP:** 5125500047
- **Kelas:** 2 D3 MMB B
- **Mata kuliah:** Praktikum Pemrograman Visual (TB033109), Tugas 3 - Event Handling

## Cara menjalankan

1. Ekstrak file ZIP.
2. Buka `index.html` dengan Chrome atau Firefox.
3. Selesai, tidak perlu instalasi apa pun.

Font memakai Google Fonts, jadi butuh internet agar tampil sesuai desain. Tanpa internet, aplikasi tetap berfungsi.

## Daftar fitur

- Tambah dan hapus anggota, dengan warna pilihan sendiri untuk tiap anggota
- Tabel jadwal mingguan (Senin-Sabtu, 07.00-21.00) yang bisa diklik atau digeser untuk menandai jam kosong
- Tooltip yang menunjukkan siapa saja yang kosong di tiap jam
- Pencari waktu cocok: menemukan jam berurutan yang kosong untuk semua anggota, atau pilihan terbaik jika tidak ada yang cocok untuk semua
- Validasi masukan dengan pesan kesalahan yang ramah (nama kosong, nama ganda, warna terlalu pucat atau mirip, dan lainnya)
- Tampilan kosong (belum ada data) dan tampilan memuat (saat mencari)
- Hasil tampil langsung tanpa memuat ulang halaman
- Data tersimpan otomatis di browser
- Pintasan keyboard (Enter, angka 1-8, tombol panah, Ctrl + Enter, Esc)

## Daftar event yang dipakai

- `submit`: menambah anggota baru dari formulir
- `input`: memeriksa nama dan warna langsung saat diisi
- `click`: tombol cari, reset, hapus, urungkan, memilih anggota, menandai kotak jadwal, dan menyorot hasil
- `change`: mengganti anggota yang sedang mengisi
- `mouseover` dan `mouseout`: menampilkan atau menyembunyikan tooltip pada kotak jadwal
- `mousedown` dan `mouseup`: menandai banyak kotak sekaligus dengan menggeser mouse
- `keydown`: pintasan keyboard (panah, angka 1-8, Ctrl + Enter, Esc)
- `focusin` dan `focusout`: menampilkan tooltip untuk pengguna keyboard

## Hasil uji coba ke pengguna

Hasil Uji dilakukan pada 21 September 2026 oleh Farhah.
Pengujian dilakukan dengan mencoba menandai jam kosong dan mencari waktu cocok, mengisi nama yang salah (kosong atau sama dengan anggota lain), dan menambah anggota dengan tombol Enter.

## Pengembangan Tugas 4 (prototipe terpadu)

- **3 tampilan** dengan navigasi langkah: 1. Anggota, 2. Jadwal, 3. Hasil. Menu aktif ditandai, dan tiap tampilan punya tombol Lanjut/Kembali.
- **Media:** gambar `ilustrasi.svg` (ada `alt`, dihapus otomatis bila gagal dimuat) dan audio `ding.wav` (tombol nyala/mati, dimatikan sopan bila gagal dimuat).
- **Animasi (`element.animate()`):** pindah tampilan (250 ms) dan kolom nama bergetar saat isian salah (300 ms). Durasi 0 bila pengguna meminta gerak dikurangi.
- Pengembangan Tugas 4 dibantu Claude (Anthropic); kode sudah saya jalankan dan periksa sendiri.

## Tugas P09 - Pustaka UI (Bootstrap 5.3.3)

- **Pustaka:** Bootstrap 5.3.3 dari CDN jsDelivr, versi terkunci (tanpa `@latest`). `style.css` dimuat sesudah CSS Bootstrap.
- **Komponen yang dipakai:** Toast (pesan singkat dan tombol Urungkan), Modal (konfirmasi "Mulai dari awal"), Offcanvas (panel pintasan keyboard).
- **Tema:** diubah lewat variabel CSS Bootstrap (`--bs-toast-bg`, `--bs-modal-bg`, `--bs-offcanvas-bg`, dan lainnya) di bagian 9 `style.css`.
- **Pembungkus:** semua panggilan API JavaScript Bootstrap hanya ada di `ui-pustaka.js`; `script.js` memakai `UI.toast()`, `UI.konfirmasi()`, dan `UI.bukaPintasan()`.
- **Penyesuaian:** kelas `.tooltip` buatan sendiri diganti `.tip-kotak` karena bentrok dengan `.tooltip` milik Bootstrap. Toast buatan sendiri diganti Bootstrap Toast.