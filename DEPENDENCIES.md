# DEPENDENCIES

## Bootstrap 5.3.3

- **Sumber:** CDN jsDelivr (`cdn.jsdelivr.net/npm/bootstrap@5.3.3`), versi terkunci, tanpa `@latest`
- **Ukuran transfer** (tab Network, Disable cache aktif):
  - `bootstrap.min.css`: 33,6 kB
  - `bootstrap.bundle.min.js`: 24,9 kB
  - Total: 58,5 kB
- **Komponen yang dipakai:** Toast, Modal, Offcanvas
- **Alasan:** modal, toast, dan panel samping yang aksesibel (fokus terkunci, tombol Esc, atribut ARIA) tanpa menulisnya dari nol.
- **Titik panggilan JavaScript:** hanya `ui-pustaka.js`; `script.js` memakai `UI.toast()`, `UI.konfirmasi()`, dan `UI.bukaPintasan()`.

## Empat pertanyaan sebelum memasang pustaka

1. **Masalah apa yang mau diselesaikan, dan apakah bisa tanpa pustaka?**
   Aplikasi butuh jendela konfirmasi, pesan singkat, dan panel samping. Menulisnya sendiri berarti mengurus fokus keyboard, tombol Esc, dan pembaca layar. Bootstrap sudah menyediakannya.

2. **Berapa biayanya untuk kinerja halaman?**
   Total 58,5 kB (CSS 33,6 kB dan JS 24,9 kB), terukur dari tab Network. Itu bertambah di luar CSS dan JS buatan sendiri.

3. **Apakah pustakanya terawat dan lisensinya jelas?**
   Bootstrap dirawat aktif dan berlisensi MIT, jadi aman dipakai untuk tugas ini.

4. **Bagaimana kalau pustakanya diganti atau gagal dimuat?**
   Semua panggilan JavaScript Bootstrap ada di satu berkas (`ui-pustaka.js`), jadi mengganti pustaka cukup mengubah berkas itu. Bila CDN gagal dimuat, pembungkus memakai cadangan sederhana (`confirm` dan `alert`).