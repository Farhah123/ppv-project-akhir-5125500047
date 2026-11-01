'use strict';

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
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_SINGKAT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const JAM_MULAI = 7;
const JAM_AKHIR = 21;
const MAKS_ANGGOTA = 8;
const MAKS_HURUF_NAMA = 20;
const MAKS_HASIL_TAMPIL = 8;
const DURASI_MEMUAT = 1000;
const KUNCI_SIMPAN = 'cariJamKosongBareng.v1';

const WARNA = [
  '#EF7F63', '#5B5F97', '#F2BF4A', '#C94F7C',
  '#8E92B0', '#E88BA6', '#C99A6B', '#7B6FD0'
];

const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* =========================================================
   2. DATA (STATE)
   ========================================================= */
let state = buatStateAwal();

function buatStateAwal() {
  return { anggota: [], kosong: {}, aktifId: null, durasiMin: 1, idBerikut: 1 };
}

function simpan() {
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(state));
  } catch (e) {
    /* abaikan */
  }
}

function muat() {
  try {
    const mentah = localStorage.getItem(KUNCI_SIMPAN);
    if (!mentah) return;

    const data = JSON.parse(mentah);
    if (!Array.isArray(data.anggota) || typeof data.kosong !== 'object') return;

    state = Object.assign(buatStateAwal(), data);
    state.durasiMin = 1;

    const GANTI = {
      '#6bcb9b': '#5b5f97',
      '#4fb3bf': '#8e92b0'
    };

    state.anggota.forEach(a => {
      if (GANTI[a.warna]) a.warna = GANTI[a.warna];
    });

    state.anggota.forEach(a => {
      if (!state.kosong[a.id]) state.kosong[a.id] = {};
    });

    if (!anggotaById(state.aktifId)) {
      state.aktifId = state.anggota.length ? state.anggota[0].id : null;
    }
  } catch (e) {
    state = buatStateAwal();
  }
}


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

const kunci = (hari, jam) => `${hari}-${jam}`;
const fmtJam = jam => String(jam).padStart(2, '0') + '.00';
const anggotaById = id => state.anggota.find(a => a.id === id);
const jumlahJam = id => Object.keys(state.kosong[id] || {}).length;

function idKosong(hari, jam) {
  const k = kunci(hari, jam);
  return state.anggota
    .filter(a => state.kosong[a.id] && state.kosong[a.id][k])
    .map(a => a.id);
}

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

function validasiNama(nama) {
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


/* ----- Warna anggota ----- */

function jarakWarna(a, b) {
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = rgb(a), y = rgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function warnaBerikut() {
  const dipakai = state.anggota.map(a => a.warna.toLowerCase());
  return (WARNA.find(w => !dipakai.includes(w.toLowerCase())) || WARNA[0]).toLowerCase();
}

function validasiWarna(warna) {
  if (jarakWarna(warna, '#F1E4D0') < 60) {
    return 'Warnanya terlalu pucat, tidak kelihatan di tabel. Pilih yang lebih pekat ya.';
  }

  const mirip = state.anggota.find(a => jarakWarna(a.warna, warna) < 45);

  if (mirip) {
    return `Warnanya terlalu mirip dengan ${mirip.nama}. Pilih warna lain supaya mudah dibedakan.`;
  }

  return '';
}

function tampilkanGalatNama(pesan) {
  el.galatNama.textContent = pesan;
  el.galatNama.hidden = !pesan;
  el.inputNama.setAttribute('aria-invalid', pesan ? 'true' : 'false');
}

function tambahAnggota(nama, warna) {
  const baru = { id: state.idBerikut++, nama, warna };

  state.anggota.push(baru);
  state.kosong[baru.id] = {};
  state.aktifId = baru.id;

  setelahUbah();
}

function hapusAnggota(id) {
  const a = anggotaById(id);
  if (!a) return;

  const cadangan = JSON.stringify(state);

  state.anggota = state.anggota.filter(x => x.id !== id);
  delete state.kosong[id];

  if (state.aktifId === id) {
    state.aktifId = state.anggota.length ? state.anggota[0].id : null;
  }

  hapusSorotan();
  setelahUbah();
  el.inputNama.focus();

  tampilkanToast(`${a.nama} dihapus dari kelompok.`, 'Urungkan', () => pulihkan(cadangan));
}

function pilihAktif(id, beriTahu) {
  const a = anggotaById(id);
  if (!a) return;

  state.aktifId = id;
  simpan();
  renderPilihAnggota();
  perbaruiStatusAnggota();
  perbaruiGrid();

  if (beriTahu) tampilkanToast(`Sekarang mengisi jadwal ${a.nama}.`);
}

function pulihkan(cadangan) {
  state = JSON.parse(cadangan);
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

  const k = kunci(sel.dataset.hari, sel.dataset.jam);
  const peta = state.kosong[state.aktifId] || (state.kosong[state.aktifId] = {});

  if (nilai) peta[k] = true;
  else delete peta[k];

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

function validasiCari() {
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

function hitungWaktuCocok() {
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

  tambahAnggota(
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

  if (tombol.dataset.aksi === 'pilih') pilihAktif(id);
  if (tombol.dataset.aksi === 'hapus') hapusAnggota(id);
});

el.pilihAnggota.addEventListener('change', () => {
  pilihAktif(Number(el.pilihAnggota.value));
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

    const cadangan = JSON.stringify(state);

    state = buatStateAwal();
    simpan();
    renderSemua();
    resetHasil();

    tampilkanToast('Semua data dihapus.', 'Urungkan', () => pulihkan(cadangan));
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
    if (a) pilihAktif(a.id, true);
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