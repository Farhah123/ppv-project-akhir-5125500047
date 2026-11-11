/* =========================================================
   state.js - pemilik data aplikasi: daftar anggota, jam kosong,
   aturan validasi, dan perhitungan waktu cocok.
   Tidak menyentuh tampilan (tidak ada document/element di sini).
   Mengimpor: konfigurasi.js, storage.js
   ========================================================= */
import {
  HARI, JAM_MULAI, JAM_AKHIR, MAKS_ANGGOTA, MAKS_HURUF_NAMA, WARNA
} from './konfigurasi.js';
import { muat as muatDariStorage, simpan as simpanKeStorage } from './storage.js';


/* ----- Data ----- */
export let state = buatStateAwal();

export function buatStateAwal() {
  return { anggota: [], kosong: {}, aktifId: null, durasiMin: 1, idBerikut: 1 };
}

// Mengembalikan true bila tersimpan, false bila penyimpanan gagal.
export function simpan() {
  return simpanKeStorage(state);
}

// muatDariStorage() selalu mengembalikan data bersih dan tidak melempar galat.
export function muat() {
  state = Object.assign(buatStateAwal(), muatDariStorage());
  state.durasiMin = 1;

  // Warna lama yang sudah diganti pada rilis sebelumnya.
  const GANTI = {
    '#6bcb9b': '#5b5f97',
    '#4fb3bf': '#8e92b0'
  };

  state.anggota.forEach(a => {
    const baru = GANTI[a.warna.toLowerCase()];
    if (baru) a.warna = baru;
  });
}


/* ----- Fungsi bantu data ----- */
export const kunci = (hari, jam) => `${hari}-${jam}`;
export const anggotaById = id => state.anggota.find(a => a.id === id);
export const jumlahJam = id => Object.keys(state.kosong[id] || {}).length;

export function idKosong(hari, jam) {
  const k = kunci(hari, jam);
  return state.anggota
    .filter(a => state.kosong[a.id] && state.kosong[a.id][k])
    .map(a => a.id);
}


/* ----- Validasi ----- */
export function validasiNama(nama) {
  const bersih = nama.trim().replace(/\s+/g, ' ');

  if (!bersih) return 'Isi nama temanmu dulu ya 😊';

  if (bersih.length > MAKS_HURUF_NAMA) {
    return `Namanya terlalu panjang (${bersih.length} huruf). Pakai maksimal ${MAKS_HURUF_NAMA} huruf, misalnya nama panggilan.`;
  }

  if (!/^[\p{L}\p{N} .'-]+$/u.test(bersih)) {
    return 'Pakai huruf atau angka saja ya, tanpa simbol atau emoji.';
  }

  if (state.anggota.some(a => a.nama.toLowerCase() === bersih.toLowerCase())) {
    return `${bersih} sudah ada di daftar. Kalau ada dua orang bernama sama, tambahkan inisial, misalnya "${bersih} R".`;
  }

  if (state.anggota.length >= MAKS_ANGGOTA) {
    return `Satu kelompok maksimal ${MAKS_ANGGOTA} anggota.`;
  }

  return '';
}

export function jarakWarna(a, b) {
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = rgb(a), y = rgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

export function warnaBerikut() {
  const dipakai = state.anggota.map(a => a.warna.toLowerCase());
  return (WARNA.find(w => !dipakai.includes(w.toLowerCase())) || WARNA[0]).toLowerCase();
}

export function validasiWarna(warna) {
  if (jarakWarna(warna, '#F1E4D0') < 60) {
    return 'Warnanya terlalu pucat, tidak kelihatan di tabel. Pilih yang lebih pekat ya.';
  }

  const mirip = state.anggota.find(a => jarakWarna(a.warna, warna) < 45);

  if (mirip) {
    return `Warnanya terlalu mirip dengan ${mirip.nama}. Pilih warna lain supaya mudah dibedakan.`;
  }

  return '';
}

export function validasiCari() {
  if (state.anggota.length < 2) {
    return 'Tambahkan minimal 2 anggota supaya ada yang dicocokkan.';
  }

  const total = state.anggota.reduce(
    (jumlah, a) => jumlah + jumlahJam(a.id),
    0
  );

  if (total === 0) {
    return 'Belum ada jam kosong yang ditandai. Klik kotak di tabel dulu, lalu cari lagi.';
  }

  return '';
}


/* ----- Mengubah data ----- */
export function tambahAnggota(nama, warna) {
  const baru = { id: state.idBerikut++, nama, warna };

  state.anggota.push(baru);
  state.kosong[baru.id] = {};
  state.aktifId = baru.id;
}

// Mengembalikan { nama, cadangan } atau null bila id tidak ada.
export function hapusAnggota(id) {
  const a = anggotaById(id);
  if (!a) return null;

  const cadangan = JSON.stringify(state);

  state.anggota = state.anggota.filter(x => x.id !== id);
  delete state.kosong[id];

  if (state.aktifId === id) {
    state.aktifId = state.anggota.length ? state.anggota[0].id : null;
  }

  return { nama: a.nama, cadangan };
}

// Mengembalikan anggota yang dipilih, atau null bila id tidak ada.
export function setAktif(id) {
  const a = anggotaById(id);
  if (!a) return null;

  state.aktifId = id;
  return a;
}

export function setKosong(hari, jam, nilai) {
  const k = kunci(hari, jam);
  const peta = state.kosong[state.aktifId] || (state.kosong[state.aktifId] = {});

  if (nilai) peta[k] = true;
  else delete peta[k];
}

export function salinState() {
  return JSON.stringify(state);
}

export function pulihkanState(cadangan) {
  state = JSON.parse(cadangan);
}

export function resetState() {
  state = buatStateAwal();
}


/* ----- Pencarian waktu cocok ----- */
export function hitungWaktuCocok() {
  const n = state.anggota.length;
  const kandidat = [];

  for (let hari = 0; hari < HARI.length; hari++) {
    for (let mulai = JAM_MULAI; mulai < JAM_AKHIR; mulai++) {
      let irisan = null;

      for (let akhir = mulai; akhir < JAM_AKHIR; akhir++) {
        const ids = idKosong(hari, akhir);

        irisan = irisan === null
          ? ids
          : irisan.filter(id => ids.includes(id));

        if (irisan.length < 2) break;

        const durasi = akhir - mulai + 1;

        if (durasi >= state.durasiMin) {
          kandidat.push({
            hari,
            mulai,
            selesai: akhir + 1,
            durasi,
            ids: irisan.slice()
          });
        }
      }
    }
  }

  const maksimal = kandidat.filter(a => !kandidat.some(b =>
    b !== a &&
    b.hari === a.hari &&
    b.mulai <= a.mulai &&
    b.selesai >= a.selesai &&
    a.ids.every(id => b.ids.includes(id))
  ));

  const urutkan = daftar => daftar.sort((x, y) =>
    (y.durasi - x.durasi) ||
    (x.hari - y.hari) ||
    (x.mulai - y.mulai)
  );

  const penuh = maksimal.filter(k => k.ids.length === n);

  if (penuh.length) {
    return { mode: 'semua', daftar: urutkan(penuh) };
  }

  if (!maksimal.length) {
    return { mode: 'kosong', daftar: [] };
  }

  const terbanyak = Math.max(...maksimal.map(k => k.ids.length));

  return {
    mode: 'sebagian',
    jumlah: terbanyak,
    daftar: urutkan(maksimal.filter(k => k.ids.length === terbanyak))
  };
}