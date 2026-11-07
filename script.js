import { UI } from './src/ui-pustaka.js';
import {
  HARI, HARI_SINGKAT, JAM_MULAI, JAM_AKHIR, MAKS_HASIL_TAMPIL, DURASI_MEMUAT
} from './src/konfigurasi.js';
import {
  state, simpan, muat, anggotaById, jumlahJam, idKosong,
  validasiNama, validasiWarna, validasiCari, warnaBerikut,
  tambahAnggota, hapusAnggota, setAktif, setKosong,
  salinState, pulihkanState, resetState, hitungWaktuCocok
} from './src/state.js';

/* =========================================================
   CARI JAM KOSONG BARENG
   Aplikasi untuk mencari jam kerja kelompok yang cocok
   untuk semua anggota.

   Isi file ini (urut dari atas):
   1. Pengaturan          5. Tabel jadwal
   2. Data (state)        6. Pencarian waktu cocok
   3. Elemen HTML         7. Tooltip dan toast
   4. Anggota + validasi  8. Event global dan mulai aplikasi
   ========================================================= */


/* =========================================================
   1. PENGATURAN
   ========================================================= */
// Angka pengaturan ada di src/konfigurasi.js.
const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* =========================================================
   2. DATA (STATE)
   Dipindah ke src/state.js, diimpor di atas.
   ========================================================= */


/* =========================================================
   3. ELEMEN HTML + FUNGSI BANTU
   ========================================================= */
const el = {
  form: document.getElementById('formAnggota'),
  inputNama: document.getElementById('inputNama'),
  inputWarna: document.getElementById('inputWarna'),
  galatNama: document.getElementById('galatNama'),
  daftarAnggota: document.getElementById('daftarAnggota'),
  kosongAnggota: document.getElementById('kosongAnggota'),
  pilihAnggota: document.getElementById('pilihAnggota'),
  swatchAktif: document.getElementById('swatchAktif'),
  petunjukJadwal: document.getElementById('petunjukJadwal'),
  jadwal: document.getElementById('jadwal'),
  btnCari: document.getElementById('btnCari'),
  btnReset: document.getElementById('btnReset'),
  catatanBasi: document.getElementById('catatanBasi'),
  hasil: document.getElementById('hasil'),
  tooltip: document.getElementById('tooltip')
};

const fmtJam = jam => String(jam).padStart(2, '0') + '.00';


function esc(teks) {
  return String(teks).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function gabung(daftar) {
  if (daftar.length <= 1) return daftar.join('');
  return daftar.slice(0, -1).join(', ') + ' dan ' + daftar[daftar.length - 1];
}


/* =========================================================
   4. ANGGOTA + VALIDASI NAMA
   ========================================================= */



/* ----- Warna anggota ----- */




function tampilkanGalatNama(pesan) {
  el.galatNama.textContent = pesan;
  el.galatNama.hidden = !pesan;
  el.inputNama.setAttribute('aria-invalid', pesan ? 'true' : 'false');
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





function setelahUbah() {
  simpan();
  renderSemua();
  tandaiBasi();
}


/* ----- Menggambar daftar anggota ----- */
function renderAnggota() {
  el.kosongAnggota.hidden = state.anggota.length > 0;

  el.daftarAnggota.innerHTML = state.anggota.map(a => `
    <li class="anggota" data-id="${a.id}">
      <button type="button" class="anggota-pilih" data-aksi="pilih" data-id="${a.id}">
        <span class="swatch" style="background:${a.warna}" aria-hidden="true"></span>
        <span class="anggota-nama">${esc(a.nama)}</span>
        <span class="anggota-jam"></span>
      </button>
      <button type="button" class="tombol-teks bahaya" data-aksi="hapus" data-id="${a.id}"
              aria-label="Hapus ${esc(a.nama)}">Hapus</button>
    </li>`).join('');

  perbaruiStatusAnggota();
}

function perbaruiStatusAnggota() {
  el.daftarAnggota.querySelectorAll('.anggota').forEach(li => {
    const id = Number(li.dataset.id);

    li.classList.toggle('aktif', id === state.aktifId);

    li.querySelector('.anggota-pilih')
      .setAttribute('aria-pressed', String(id === state.aktifId));

    li.querySelector('.anggota-jam').textContent = jumlahJam(id) + ' jam';
  });
}

function renderPilihAnggota() {
  const ada = state.anggota.length > 0;
  el.pilihAnggota.disabled = !ada;

  if (ada) {
    el.pilihAnggota.innerHTML = state.anggota
      .map((a, i) => `<option value="${a.id}">${i + 1}. ${esc(a.nama)}</option>`)
      .join('');

    el.pilihAnggota.value = String(state.aktifId);
  } else {
    el.pilihAnggota.innerHTML = '<option>Belum ada anggota</option>';
  }

  const aktif = anggotaById(state.aktifId);

  el.swatchAktif.style.background = aktif ? aktif.warna : '';

  el.petunjukJadwal.textContent = ada
    ? 'Klik atau geser di tabel untuk menandai jam kosong. Klik lagi untuk menghapus.'
    : 'Tambahkan anggota dulu di langkah 1, baru tandai jam kosongnya.';
}

function renderSemua() {
  renderAnggota();
  renderPilihAnggota();
  perbaruiGrid();
  el.inputWarna.value = warnaBerikut();
}


/* =========================================================
   5. TABEL JADWAL
   ========================================================= */

function buatGrid() {
  let html = '<caption class="sr-only">Jadwal mingguan. Tiap kotak adalah satu jam. ' +
             'Tandai kotak untuk jam kosong anggota yang sedang mengisi.</caption>';

  html += '<thead><tr><td></td>';

  HARI.forEach((h, i) => {
    html += `<th scope="col" aria-label="${h}">${HARI_SINGKAT[i]}</th>`;
  });

  html += '</tr></thead><tbody>';

  for (let jam = JAM_MULAI; jam < JAM_AKHIR; jam++) {
    html += `<tr><th scope="row">${fmtJam(jam)}</th>`;

    for (let hari = 0; hari < HARI.length; hari++) {
      const pertama = (jam === JAM_MULAI && hari === 0);

      html += `<td><button type="button" class="sel" data-hari="${hari}" data-jam="${jam}" ` +
              `tabindex="${pertama ? 0 : -1}"></button></td>`;
    }

    html += '</tr>';
  }

  el.jadwal.innerHTML = html + '</tbody>';

  // Perbaikan: izinkan kontrol sentuhan langsung pada kotak jadwal.
  aturSentuhanGrid();
}

function gradien(daftarWarna) {
  const n = daftarWarna.length;
  if (n === 1) return daftarWarna[0];

  const bagian = daftarWarna.map((w, i) =>
    `${w} ${(i * 100 / n).toFixed(2)}% ${((i + 1) * 100 / n).toFixed(2)}%`
  );

  return `linear-gradient(to right, ${bagian.join(', ')})`;
}

function perbaruiSel(sel) {
  const hari = Number(sel.dataset.hari);
  const jam = Number(sel.dataset.jam);
  const ids = idKosong(hari, jam);
  const n = state.anggota.length;
  const milik = state.aktifId !== null && ids.includes(state.aktifId);

  sel.classList.toggle('milik', milik);
  sel.classList.toggle('semua', n >= 2 && ids.length === n);
  sel.style.background = ids.length ? gradien(ids.map(id => anggotaById(id).warna)) : '';

  sel.setAttribute('aria-pressed', String(milik));
  sel.setAttribute('aria-label', `${HARI[hari]} ${fmtJam(jam)}, ${ids.length} dari ${n} anggota kosong`);
}

function perbaruiGrid() {
  const aktif = anggotaById(state.aktifId);

  el.jadwal.style.setProperty('--aktif', aktif ? aktif.warna : 'transparent');
  el.jadwal.classList.toggle('mati', state.anggota.length === 0);

  el.jadwal.querySelectorAll('.sel').forEach(perbaruiSel);
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


/* ----- Event pointer: klik dan geser dengan mouse maupun layar sentuh ----- */

let modeSeret = null;
let pointerAktif = null;
let abaikanKlikPointer = false;

// Mencegah browser mengubah gerakan jari menjadi scroll saat menggeser kotak.
function aturSentuhanGrid() {
  el.jadwal.querySelectorAll('.sel').forEach(sel => {
    sel.style.touchAction = 'none';
  });
}

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


/* =========================================================
   6. PENCARIAN WAKTU COCOK
   ========================================================= */

let hasilTampil = false;
let sedangMencari = false;


function klikCari() {
  if (sedangMencari) return;

  const pesan = validasiCari();

  if (pesan) {
    tampilkanHasilGalat(pesan);
    return;
  }

  sedangMencari = true;
  hasilTampil = false;

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



/* ----- Menggambar hasil ----- */

function resetHasil() {
  hasilTampil = false;
  el.catatanBasi.hidden = true;

  el.hasil.innerHTML =
    '<p class="kosong">Belum ada hasil. Tandai jam kosong di tabel, ' +
    'lalu tekan "Cari waktu cocok".</p>';
}

function tampilkanHasilGalat(pesan) {
  hasilTampil = false;
  el.catatanBasi.hidden = true;

  el.hasil.innerHTML = `<p class="galat-blok" role="alert">${esc(pesan)}</p>`;
}

function renderHasil(hasil) {
  const n = state.anggota.length;
  let html = '';

  const tanpaJam = state.anggota
    .filter(a => jumlahJam(a.id) === 0)
    .map(a => a.nama);

  if (tanpaJam.length) {
    html += `<p class="catatan">${esc(gabung(tanpaJam))} belum menandai jam kosong, jadi belum masuk hasil.</p>`;
  }

  if (hasil.mode === 'kosong') {
    html += '<p class="ringkasan"><strong>Belum ada waktu yang cocok.</strong></p>' +
            '<p class="ringkasan-sub">Tidak ada jam yang kosong untuk minimal 2 orang. ' +
            'Coba tambah jam kosong.</p>';
  } else {
    const tampil = hasil.daftar.slice(0, MAKS_HASIL_TAMPIL);

    html += hasil.mode === 'semua'
      ? `<p class="ringkasan"><strong>Ketemu! ${hasil.daftar.length} waktu cocok untuk kalian semua.</strong></p>`
      : `<p class="ringkasan"><strong>Belum ada waktu yang cocok untuk semua.</strong> ` +
        `Pilihan terbaik: ${hasil.jumlah} dari ${n} orang bisa.</p>`;

    html += '<p class="ringkasan-sub">Diurutkan dari yang paling panjang. Klik satu untuk menyorotnya di tabel.</p>';

    html += '<ul class="daftar-hasil">' + tampil.map(k => {
      const yangBisa = k.ids.map(anggotaById);
      const yangBelum = state.anggota
        .filter(a => !k.ids.includes(a.id))
        .map(a => a.nama);

      const chips = yangBisa.map(a =>
        `<span class="chip"><span class="swatch" style="background:${a.warna}"></span>${esc(a.nama)}</span>`
      ).join('');

      return `<li><button type="button" class="hasil-kartu" data-hari="${k.hari}" ` +
             `data-mulai="${k.mulai}" data-selesai="${k.selesai}">` +
             `<span class="hasil-waktu">${HARI[k.hari]}, ${fmtJam(k.mulai)}–${fmtJam(k.selesai)}</span>` +
             `<span class="hasil-durasi">${k.durasi} jam</span>` +
             `<span class="chips">${chips}</span>` +
             (yangBelum.length
               ? `<span class="hasil-belum">Belum bisa: ${esc(gabung(yangBelum))}</span>`
               : '') +
             '</button></li>';
    }).join('') + '</ul>';

    if (hasil.daftar.length > MAKS_HASIL_TAMPIL) {
      html += `<p class="ringkasan-sub">Menampilkan ${MAKS_HASIL_TAMPIL} teratas dari ${hasil.daftar.length} pilihan.</p>`;
    }
  }

  el.hasil.innerHTML = html;
  hasilTampil = true;
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

function sorot(hari, mulai, selesai, kartu) {
  hapusSorotan();

  kartu.classList.add('dipilih');
  kartu.setAttribute('aria-current', 'true');

  let pertama = null;

  for (let jam = mulai; jam < selesai; jam++) {
    const sel = el.jadwal.querySelector(
      `.sel[data-hari="${hari}"][data-jam="${jam}"]`
    );

    if (sel) {
      sel.classList.add('disorot');
      pertama = pertama || sel;
    }
  }

  if (pertama) {
    pertama.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: kurangiGerak ? 'auto' : 'smooth'
    });
  }
}

function hapusSorotan() {
  el.jadwal.querySelectorAll('.disorot').forEach(s => {
    s.classList.remove('disorot');
  });

  el.hasil.querySelectorAll('.hasil-kartu.dipilih').forEach(k => {
    k.classList.remove('dipilih');
    k.removeAttribute('aria-current');
  });
}

function tandaiBasi() {
  if (hasilTampil) el.catatanBasi.hidden = false;
}


/* =========================================================
   7. TOOLTIP DAN TOAST
   ========================================================= */

function tampilkanTooltip(sel) {
  const hari = Number(sel.dataset.hari);
  const jam = Number(sel.dataset.jam);
  const ids = idKosong(hari, jam);

  const yangKosong = ids.map(id => anggotaById(id).nama);
  const yangBelum = state.anggota
    .filter(a => !ids.includes(a.id))
    .map(a => a.nama);

  let isi = `<strong>${HARI[hari]}, ${fmtJam(jam)}–${fmtJam(jam + 1)}</strong>`;

  if (state.anggota.length === 0) {
    isi += '<span>Tambahkan anggota dulu</span>';
  } else {
    isi += `<span>Kosong: ${yangKosong.length ? esc(gabung(yangKosong)) : 'belum ada'}</span>`;

    if (yangKosong.length && yangBelum.length) {
      isi += `<span>Belum: ${esc(gabung(yangBelum))}</span>`;
    }
  }

  el.tooltip.innerHTML = isi;
  el.tooltip.hidden = false;

  const r = sel.getBoundingClientRect();
  const t = el.tooltip.getBoundingClientRect();

  let kiri = r.left + r.width / 2 - t.width / 2;
  kiri = Math.max(8, Math.min(kiri, window.innerWidth - t.width - 8));

  let atas = r.top - t.height - 8;
  if (atas < 8) atas = r.bottom + 8;

  el.tooltip.style.left = kiri + 'px';
  el.tooltip.style.top = atas + 'px';
}

function sembunyikanTooltip() {
  el.tooltip.hidden = true;
}

function tampilkanToast(teks, labelAksi, aksi) {
  UI.toast(teks, labelAksi, aksi);
}

window.addEventListener('scroll', sembunyikanTooltip, { passive: true });


/* =========================================================
   8. EVENT LAIN + MULAI APLIKASI
   ========================================================= */

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
    show('cari');
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


/* =========================================================
   TUGAS 4: NAVIGASI TAMPILAN, ANIMASI, DAN MEDIA
   ========================================================= */

function animasi(node, kf, opsi) {
  return node.animate(kf, {
    ...opsi,
    duration: kurangiGerak ? 0 : opsi.duration
  });
}

const tampilan = [...document.querySelectorAll('.view')];

function show(nama) {
  tampilan.forEach(v => {
    v.hidden = v.id !== 'v-' + nama;
  });

  document.querySelectorAll('.langkah button').forEach(b => {
    if (b.dataset.view === nama) {
      b.setAttribute('aria-current', 'page');
    } else {
      b.removeAttribute('aria-current');
    }
  });

  sembunyikanTooltip();
  window.scrollTo(0, 0);

  animasi(
    document.getElementById('v-' + nama),
    [
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'none' }
    ],
    { duration: 250, easing: 'ease-out' }
  );

  if (nama === 'cari' && (!hasilTampil || !el.catatanBasi.hidden)) {
    klikCari();
  }
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-view]');
  if (t) show(t.dataset.view);
});

function getar(node) {
  animasi(
    node,
    [0, -6, 6, -6, 6, 0].map(x => ({ transform: `translateX(${x}px)` })),
    { duration: 300, easing: 'ease-in-out' }
  );
}


/* ----- Media audio ----- */

const btnBunyi = document.getElementById('btnBunyi');
const ding = new Audio('ding.wav');

let bunyiNyala = true;
let bunyiRusak = false;

ding.addEventListener('error', () => {
  bunyiRusak = true;
  btnBunyi.disabled = true;
  btnBunyi.textContent = 'Bunyi tidak tersedia';
});

let terakhirBunyi = 0;

function bunyi() {
  if (!bunyiNyala || bunyiRusak) return;

  const t = performance.now();

  if (t - terakhirBunyi < 100) return;

  terakhirBunyi = t;
  ding.currentTime = 0;
  ding.play().catch(() => {});
}

btnBunyi.addEventListener('click', () => {
  bunyiNyala = !bunyiNyala;

  btnBunyi.setAttribute('aria-pressed', String(bunyiNyala));
  btnBunyi.textContent = bunyiNyala ? 'Bunyi: nyala' : 'Bunyi: mati';
});


/* =========================================================
   MULAI APLIKASI
   ========================================================= */

muat();
buatGrid();
renderSemua();
resetHasil();
show('anggota');