/* =========================================================
   storage.js - satu-satunya modul yang menyentuh localStorage.
   muat() dan simpan() tidak pernah melempar galat.
   Mengimpor: konfigurasi.js
   ========================================================= */
import {
  HARI, JAM_MULAI, JAM_AKHIR, MAKS_ANGGOTA, MAKS_HURUF_NAMA, KUNCI_SIMPAN
} from './konfigurasi.js';

// Kunci berversi. Ubah versinya bila bentuk data berubah.
export const KUNCI = KUNCI_SIMPAN;

let cadanganTeks = null;   // salinan terakhir di memori, dipakai bila localStorage tidak bisa dibaca
let tersedia = true;       // false bila localStorage diblokir atau penuh

export function penyimpananTersedia() {
  return tersedia;
}


/* ----- Penyaring data ----- */
const adaObjek = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const WARNA_SAH = /^#[0-9a-f]{6}$/i;

function anggotaSah(a) {
  return adaObjek(a)
    && Number.isInteger(a.id)
    && typeof a.nama === 'string' && a.nama.trim() !== '' && a.nama.length <= MAKS_HURUF_NAMA
    && typeof a.warna === 'string' && WARNA_SAH.test(a.warna);
}

function kunciKotakSah(k) {
  const bagian = /^(\d+)-(\d+)$/.exec(k);
  if (!bagian) return false;

  const hari = Number(bagian[1]);
  const jam = Number(bagian[2]);

  return hari < HARI.length && jam >= JAM_MULAI && jam < JAM_AKHIR;
}

// Mengubah apa pun yang terbaca menjadi data bersih berbentuk state.
function bersihkan(data) {
  const hasil = { anggota: [], kosong: {}, aktifId: null, idBerikut: 1 };
  if (!adaObjek(data)) return hasil;

  const dipakai = new Set();

  if (Array.isArray(data.anggota)) {
    for (const a of data.anggota) {
      if (hasil.anggota.length >= MAKS_ANGGOTA) break;
      if (!anggotaSah(a) || dipakai.has(a.id)) continue;

      dipakai.add(a.id);
      hasil.anggota.push({ id: a.id, nama: a.nama, warna: a.warna });
    }
  }

  const petaKosong = adaObjek(data.kosong) ? data.kosong : {};

  for (const a of hasil.anggota) {
    const asal = adaObjek(petaKosong[a.id]) ? petaKosong[a.id] : {};
    hasil.kosong[a.id] = {};

    for (const k of Object.keys(asal)) {
      if (asal[k] === true && kunciKotakSah(k)) hasil.kosong[a.id][k] = true;
    }
  }

  const idTerbesar = hasil.anggota.reduce((m, a) => Math.max(m, a.id), 0);
  const idUsulan = Number.isInteger(data.idBerikut) ? data.idBerikut : 1;

  hasil.idBerikut = Math.max(idUsulan, idTerbesar + 1);

  hasil.aktifId = dipakai.has(data.aktifId)
    ? data.aktifId
    : (hasil.anggota.length ? hasil.anggota[0].id : null);

  return hasil;
}


/* ----- Membaca dan menulis ----- */
function bacaMentah() {
  try {
    const teks = localStorage.getItem(KUNCI);
    tersedia = true;
    return teks;
  } catch (err) {
    tersedia = false;
    console.warn('localStorage tidak dapat dibaca, memakai cadangan di memori:', err);
    return cadanganTeks;
  }
}

// Selalu mengembalikan data bersih; data rusak diganti data kosong.
export function muat() {
  const mentah = bacaMentah();
  if (mentah === null || mentah === undefined) return bersihkan(null);

  try {
    return bersihkan(JSON.parse(mentah));
  } catch (err) {
    console.warn('Data tersimpan rusak (JSON tidak valid), diabaikan:', err);
    return bersihkan(null);
  }
}

// Mengembalikan true bila berhasil disimpan, false bila gagal.
export function simpan(data) {
  try {
    const teks = JSON.stringify(data);
    cadanganTeks = teks;
    localStorage.setItem(KUNCI, teks);
    tersedia = true;
    return true;
  } catch (err) {
    tersedia = false;
    console.warn('Gagal menyimpan ke localStorage:', err);
    return false;
  }
}
