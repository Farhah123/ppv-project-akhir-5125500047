/* =========================================================
   script.js (calon main.js) - titik masuk aplikasi. Menghubungkan data (state.js),
   tampilan (tampilan.js), pustaka UI, dan bunyi, lalu memasang
   semua event dengan addEventListener.
   Mengimpor: ui-pustaka.js, konfigurasi.js, state.js, tampilan.js, bunyi.js
   ========================================================= */
import { UI } from './src/ui-pustaka.js';
import { DURASI_MEMUAT } from './src/konfigurasi.js';
import {
  state, simpan, muat, idKosong, validasiNama, validasiWarna, validasiCari,
  tambahAnggota, hapusAnggota, setAktif, setKosong,
  salinState, pulihkanState, resetState, hitungWaktuCocok
} from './src/state.js';
import {
  el, status, tampilkanGalatNama, renderPilihAnggota, perbaruiStatusAnggota,
  renderSemua, buatGrid, perbaruiSel, perbaruiGrid, resetHasil,
  tampilkanHasilGalat, renderHasil, sorot, hapusSorotan, tandaiBasi,
  tampilkanTooltip, sembunyikanTooltip, show, getar
} from './src/tampilan.js';
import { bunyi, alihBunyi } from './src/bunyi.js';


/* ----- Aksi: data berubah, lalu tampilan diperbarui ----- */

function tampilkanToast(teks, labelAksi, aksi) {
  UI.toast(teks, labelAksi, aksi);
}

function setelahUbah() {
  simpan();
  renderSemua();
  tandaiBasi();
}

function aksiTambahAnggota(nama, warna) {
  tambahAnggota(nama, warna);
  setelahUbah();
}

function aksiHapusAnggota(id) {
  const hasil = hapusAnggota(id);
  if (!hasil) return;

  hapusSorotan();
  setelahUbah();
  el.inputNama.focus();

  tampilkanToast(`${hasil.nama} dihapus dari kelompok.`, 'Urungkan', () => aksiPulihkan(hasil.cadangan));
}

function aksiPilihAktif(id, beriTahu) {
  const a = setAktif(id);
  if (!a) return;

  simpan();
  renderPilihAnggota();
  perbaruiStatusAnggota();
  perbaruiGrid();

  if (beriTahu) tampilkanToast(`Sekarang mengisi jadwal ${a.nama}.`);
}

function aksiPulihkan(cadangan) {
  pulihkanState(cadangan);
  setelahUbah();
  resetHasil();
}

function terapkanSel(sel, nilai) {
  const sudah = sel.classList.contains('milik');
  if (sudah === nilai) return;

  setKosong(sel.dataset.hari, sel.dataset.jam, nilai);

  perbaruiSel(sel);
  perbaruiStatusAnggota();
  simpan();
  tandaiBasi();

  if (nilai && idKosong(Number(sel.dataset.hari), Number(sel.dataset.jam)).length >= 2) {
    bunyi();
  }
}

function pesanPerluAnggota() {
  tampilkanToast('Tambahkan anggota dulu, baru tandai jam kosongnya.');
  el.inputNama.focus();
}

// Pindah tampilan; membuka tampilan "cari" memulai pencarian bila perlu.
function tampilkanView(nama) {
  show(nama);

  if (nama === 'cari' && (!status.hasilTampil || !el.catatanBasi.hidden)) {
    klikCari();
  }
}


/* ----- Event pointer: klik dan geser dengan mouse maupun layar sentuh ----- */

let modeSeret = null;
let pointerAktif = null;
let abaikanKlikPointer = false;

el.jadwal.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  const sel = e.target.closest('.sel');
  if (!sel) return;

  e.preventDefault();

  pointerAktif = e.pointerId;
  abaikanKlikPointer = true;

  sel.focus({ preventScroll: true });

  if (state.aktifId === null) {
    modeSeret = null;
    pesanPerluAnggota();
    return;
  }

  modeSeret = !sel.classList.contains('milik');

  terapkanSel(sel, modeSeret);
  tampilkanTooltip(sel);
});

document.addEventListener('pointermove', e => {
  if (pointerAktif !== null && e.pointerId === pointerAktif && modeSeret !== null) {
    const elemen = document.elementFromPoint(e.clientX, e.clientY);
    const sel = elemen && elemen.closest ? elemen.closest('.sel') : null;

    if (sel && el.jadwal.contains(sel)) {
      terapkanSel(sel, modeSeret);
      tampilkanTooltip(sel);
    }

    return;
  }

  if (e.pointerType === 'mouse') {
    const elemen = document.elementFromPoint(e.clientX, e.clientY);
    const sel = elemen && elemen.closest ? elemen.closest('.sel') : null;

    if (sel && el.jadwal.contains(sel)) {
      tampilkanTooltip(sel);
    }
  }
});

function akhiriSeret(e) {
  if (pointerAktif !== null && e.pointerId !== pointerAktif) return;

  pointerAktif = null;
  modeSeret = null;

  setTimeout(() => {
    abaikanKlikPointer = false;
  }, 0);
}

document.addEventListener('pointerup', akhiriSeret);
document.addEventListener('pointercancel', akhiriSeret);

// Klik mouse atau keyboard.
el.jadwal.addEventListener('click', e => {
  const sel = e.target.closest('.sel');
  if (!sel) return;

  if (abaikanKlikPointer) {
    abaikanKlikPointer = false;
    return;
  }

  if (state.aktifId === null) {
    pesanPerluAnggota();
    return;
  }

  terapkanSel(sel, !sel.classList.contains('milik'));
  tampilkanTooltip(sel);
});

el.jadwal.addEventListener('pointerout', e => {
  const tujuan = e.relatedTarget;

  if (!tujuan || !tujuan.closest || !tujuan.closest('.sel')) {
    sembunyikanTooltip();
  }
});


/* ----- Event keyboard di dalam tabel ----- */

el.jadwal.addEventListener('keydown', e => {
  const sel = e.target.closest('.sel');
  if (!sel) return;

  const arah = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  }[e.key];

  if (!arah) return;

  e.preventDefault();

  const hari = Number(sel.dataset.hari) + arah[0];
  const jam = Number(sel.dataset.jam) + arah[1];

  const tujuan = el.jadwal.querySelector(
    `.sel[data-hari="${hari}"][data-jam="${jam}"]`
  );

  if (tujuan) tujuan.focus();
});

el.jadwal.addEventListener('focusin', e => {
  const sel = e.target.closest('.sel');
  if (!sel) return;

  el.jadwal.querySelectorAll('.sel[tabindex="0"]').forEach(x => {
    x.tabIndex = -1;
  });

  sel.tabIndex = 0;
  tampilkanTooltip(sel);
});

el.jadwal.addEventListener('focusout', sembunyikanTooltip);


/* ----- Pencarian waktu cocok ----- */

let sedangMencari = false;

function klikCari() {
  if (sedangMencari) return;

  const pesan = validasiCari();

  if (pesan) {
    tampilkanHasilGalat(pesan);
    return;
  }

  sedangMencari = true;
  status.hasilTampil = false;

  el.btnCari.disabled = true;
  el.btnCari.setAttribute('aria-busy', 'true');
  el.catatanBasi.hidden = true;

  hapusSorotan();

  el.hasil.innerHTML =
    '<div class="memuat"><span class="spinner" aria-hidden="true"></span>' +
    '<p>Mencocokkan jadwal semua orang...</p></div>';

  setTimeout(() => {
    sedangMencari = false;

    el.btnCari.disabled = false;
    el.btnCari.removeAttribute('aria-busy');

    const galat = validasiCari();

    if (galat) {
      tampilkanHasilGalat(galat);
      return;
    }

    renderHasil(hitungWaktuCocok());
  }, DURASI_MEMUAT);
}

el.hasil.addEventListener('click', e => {
  const kartu = e.target.closest('.hasil-kartu');
  if (!kartu) return;

  sorot(
    Number(kartu.dataset.hari),
    Number(kartu.dataset.mulai),
    Number(kartu.dataset.selesai),
    kartu
  );
});

window.addEventListener('scroll', sembunyikanTooltip, { passive: true });


/* ----- Form, tombol, dan keyboard ----- */

function cekLangsung() {
  const nama = el.inputNama.value;
  const galatNama = nama.trim() ? validasiNama(nama) : '';

  tampilkanGalatNama(galatNama || validasiWarna(el.inputWarna.value));
}

el.inputNama.addEventListener('input', cekLangsung);
el.inputWarna.addEventListener('input', cekLangsung);

el.form.addEventListener('submit', e => {
  e.preventDefault();

  const pesan = validasiNama(el.inputNama.value) || validasiWarna(el.inputWarna.value);

  if (pesan) {
    tampilkanGalatNama(pesan);
    getar(el.inputNama);
    el.inputNama.focus();
    return;
  }

  aksiTambahAnggota(
    el.inputNama.value.trim().replace(/\s+/g, ' '),
    el.inputWarna.value
  );

  el.inputNama.value = '';
  tampilkanGalatNama('');
  el.inputNama.focus();
});

el.daftarAnggota.addEventListener('click', e => {
  const tombol = e.target.closest('button[data-aksi]');
  if (!tombol) return;

  const id = Number(tombol.dataset.id);

  if (tombol.dataset.aksi === 'pilih') aksiPilihAktif(id);
  if (tombol.dataset.aksi === 'hapus') aksiHapusAnggota(id);
});

el.pilihAnggota.addEventListener('change', () => {
  aksiPilihAktif(Number(el.pilihAnggota.value));
});

el.btnCari.addEventListener('click', klikCari);

el.btnReset.addEventListener('click', () => {
  if (state.anggota.length === 0) {
    tampilkanToast('Belum ada data yang perlu dihapus.');
    return;
  }

  UI.konfirmasi({
    judul: 'Mulai dari awal?',
    isi: 'Semua anggota dan jam kosong yang sudah ditandai akan dihapus. Setelah ini kamu masih bisa mengurungkannya sebentar.',
    labelYa: 'Ya, hapus semua'
  }).then(ya => {
    if (!ya) return;

    const cadangan = salinState();

    resetState();
    simpan();
    renderSemua();
    resetHasil();

    tampilkanToast('Semua data dihapus.', 'Urungkan', () => aksiPulihkan(cadangan));
  });
});

document.getElementById('btnPintasan').addEventListener('click', () => {
  UI.bukaPintasan();
});

document.addEventListener('keydown', e => {
  if (document.querySelector('.modal.show, .offcanvas.show')) return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    tampilkanView('cari');
    klikCari();
    return;
  }

  if (e.key === 'Escape') {
    sembunyikanTooltip();
    hapusSorotan();
    return;
  }

  const tag = (e.target.tagName || '').toLowerCase();

  if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (/^[1-8]$/.test(e.key)) {
    const a = state.anggota[Number(e.key) - 1];
    if (a) aksiPilihAktif(a.id, true);
  }
});

document.addEventListener('click', e => {
  const t = e.target.closest('[data-view]');
  if (t) tampilkanView(t.dataset.view);
});

document.getElementById('btnBunyi').addEventListener('click', alihBunyi);


/* ----- Mulai aplikasi ----- */

muat();
buatGrid();
renderSemua();
resetHasil();