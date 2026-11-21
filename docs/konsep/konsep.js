// konsep.js — konsep produk Cari Jam Kosong Bareng (Tugas 7).
const KONSEP = {
  nama: 'Cari Jam Kosong Bareng',
  tagline: 'Temukan jam kerja kelompok yang cocok untuk semua anggota tanpa tanya satu per satu.',
  persona: {
    nama: 'Abil, 19 tahun',
    siapa: 'Mahasiswa semester 3 D3 Multimedia dan Broadcasting yang biasanya ditunjuk menjadi ketua kelompok proyek praktikum beranggotakan 3 sampai 5 orang.',
    keseharian: 'Jadwal kuliah dan praktikum tiap anggota berbeda dari Senin sampai Sabtu. Koordinasi kelompok lewat grup chat, dan kerja bersama hanya bisa di sela jam kosong.',
    masalah: 'Untuk menemukan satu jam kosong yang sama, Abil harus membaca banyak balasan satu per satu dan mencocokkannya sendiri. Sering setelah jam disepakati, masih ada satu anggota yang bentrok.',
  },
  masalah: 'Ketua kelompok harus mencari jam kosong yang sama bagi 3 sampai 5 anggota yang jadwal kuliahnya berbeda-beda. Saat ini hal itu dilakukan dengan bertanya di grup chat, sehingga jawaban tersebar dan harus dicocokkan secara manual. Akibatnya penentuan jam kerja kelompok memakan waktu lama dan sering menyisakan satu orang yang bentrok.',
  solusi: 'Cari Jam Kosong Bareng adalah aplikasi web tempat tiap anggota menandai jam kosongnya di tabel jadwal mingguan. Aplikasi lalu menghitung sendiri jam berurutan saat semua anggota kosong, atau pilihan terbaik bila tidak ada yang cocok untuk semua. Data tersimpan di browser sehingga jadwal tidak perlu diisi ulang.',
  fitur: [
    { nama: 'Tambah dan hapus anggota dengan warna sendiri', prioritas: 'wajib', alasan: 'Aplikasi perlu tahu siapa saja yang dicocokkan; warna membedakan jadwal tiap orang. Selesai di v0.1.0.' },
    { nama: 'Tabel jadwal mingguan (Senin-Sabtu, 07.00-21.00) yang bisa diklik atau digeser', prioritas: 'wajib', alasan: 'Cara tercepat menyatakan jam kosong tanpa mengetik balasan chat. Selesai di v0.1.0.' },
    { nama: 'Pencari waktu cocok', prioritas: 'wajib', alasan: 'Inti nilai produk: menggantikan pencocokan balasan chat secara manual. Selesai di v0.1.0.' },
    { nama: 'Data tersimpan otomatis dan tahan data rusak', prioritas: 'wajib', alasan: 'Jadwal diisi bertahap; bila hilang saat halaman ditutup, pengguna harus mengulang. Selesai di v0.4.0.' },
    { nama: 'Tooltip siapa yang kosong di tiap jam', prioritas: 'sebaiknya', alasan: 'Memudahkan memeriksa satu jam, tetapi hasil pencarian tetap benar tanpa fitur ini. Selesai di v0.1.0.' },
    { nama: 'Urungkan hapus dan konfirmasi "Mulai dari awal"', prioritas: 'sebaiknya', alasan: 'Mencegah jadwal terhapus tanpa sengaja; bukan inti masalah. Selesai di v0.2.0.' },
    { nama: 'Login atau akun pengguna', prioritas: 'belum', alasan: 'Tidak menguji nilai utama; data cukup disimpan di perangkat ketua kelompok.' },
    { nama: 'Sinkronisasi online agar tiap anggota mengisi dari HP sendiri', prioritas: 'belum', alasan: 'Butuh server dan basis data; ditunda sampai inti produk terbukti dipakai.' },
    { nama: 'Ekspor atau bagikan hasil ke grup chat', prioritas: 'belum', alasan: 'Hasil sudah bisa difoto layar; ditunda agar fokus pada pencocokan jam.' },
  ],
  pembanding: [
    { nama: 'Grup WhatsApp', kelebihan: 'Semua anggota sudah memakai.', kekurangan: 'Jawaban tersebar dan tidak berbentuk tabel, sehingga irisan jam dihitung manual dan mudah salah.' },
    { nama: 'When2meet', kelebihan: 'Peserta menandai ketersediaan pada kisi hari dan jam.', kekurangan: 'Dibuat per acara dengan tautan sendiri dan berbahasa Inggris.' },
  ],
  pembeda: 'Daftar anggota dan jadwal tersimpan di satu tempat. Hasil diurutkan dari jam terpanjang, menyebut siapa yang belum bisa, dan memberi pilihan terbaik bila tidak ada jam yang cocok untuk semua.',
};