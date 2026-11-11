/* =========================================================
   komponen.js - bagian tampilan yang dipakai berulang.
   Setiap komponen menerima data lewat parameter dan mengembalikan
   elemen DOM. Semua teks pengguna masuk lewat textContent.
   Tidak mengimpor modul lain, jadi tidak bergantung pada state.
   ========================================================= */

function buat(tag, kelas, teks) {
  const node = document.createElement(tag);
  if (kelas) node.className = kelas;
  if (teks !== undefined) node.textContent = teks;
  return node;
}

function Swatch(warna) {
  const swatch = buat('span', 'swatch');
  swatch.style.background = warna;
  return swatch;
}


/* Label kecil berisi warna dan nama satu anggota. */
export function ChipAnggota({ nama, warna }) {
  const chip = buat('span', 'chip');
  chip.append(Swatch(warna), document.createTextNode(nama));
  return chip;
}


/* Satu baris di daftar anggota: tombol pilih dan tombol hapus. */
export function ItemAnggota({ id, nama, warna }) {
  const li = buat('li', 'anggota');
  li.dataset.id = id;

  const pilih = buat('button', 'anggota-pilih');
  pilih.type = 'button';
  pilih.dataset.aksi = 'pilih';
  pilih.dataset.id = id;

  const swatch = Swatch(warna);
  swatch.setAttribute('aria-hidden', 'true');

  pilih.append(swatch, buat('span', 'anggota-nama', nama), buat('span', 'anggota-jam'));

  const hapus = buat('button', 'tombol-teks bahaya', 'Hapus');
  hapus.type = 'button';
  hapus.dataset.aksi = 'hapus';
  hapus.dataset.id = id;
  hapus.setAttribute('aria-label', 'Hapus ' + nama);

  li.append(pilih, hapus);
  return li;
}


/* Satu pilihan waktu di daftar hasil.
   data: { hari, mulai, selesai, waktu, durasi, yangBisa: [{nama, warna}], belum } */
export function KartuHasil({ hari, mulai, selesai, waktu, durasi, yangBisa, belum }) {
  const li = buat('li');

  const tombol = buat('button', 'hasil-kartu');
  tombol.type = 'button';
  tombol.dataset.hari = hari;
  tombol.dataset.mulai = mulai;
  tombol.dataset.selesai = selesai;

  const chips = buat('span', 'chips');
  chips.append(...yangBisa.map(a => ChipAnggota(a)));

  tombol.append(
    buat('span', 'hasil-waktu', waktu),
    buat('span', 'hasil-durasi', durasi + ' jam'),
    chips
  );

  if (belum) tombol.append(buat('span', 'hasil-belum', 'Belum bisa: ' + belum));

  li.append(tombol);
  return li;
}


/* Paragraf sederhana, mis. catatan atau keterangan di bawah ringkasan. */
export function Paragraf(kelas, teks) {
  return buat('p', kelas, teks);
}


/* Kalimat ringkasan: bagian tebal, lalu sisanya (boleh kosong). */
export function Ringkasan(tebal, biasa = '') {
  const p = buat('p', 'ringkasan');
  p.append(buat('strong', '', tebal));
  if (biasa) p.append(document.createTextNode(' ' + biasa));
  return p;
}
