/* =========================================================
   tampilan.js - semua yang menggambar atau mengubah isi halaman:
   daftar anggota, tabel jadwal, hasil, tooltip, dan pindah tampilan.
   Membaca data dari state.js, tidak mengubahnya.
   Mengimpor: konfigurasi.js, state.js
   ========================================================= */
import {
  HARI, HARI_SINGKAT, JAM_MULAI, JAM_AKHIR, MAKS_HASIL_TAMPIL
} from './konfigurasi.js';
import {
  state, anggotaById, jumlahJam, idKosong, warnaBerikut
} from './state.js';

export const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Status tampilan bersama (objek, supaya main.js boleh mengubah isinya).
export const status = { hasilTampil: false };

export const el = {
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

export const fmtJam = jam => String(jam).padStart(2, '0') + '.00';

export function esc(teks) {
  return String(teks).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function gabung(daftar) {
  if (daftar.length <= 1) return daftar.join('');
  return daftar.slice(0, -1).join(', ') + ' dan ' + daftar[daftar.length - 1];
}

export function tampilkanGalatNama(pesan) {
  el.galatNama.textContent = pesan;
  el.galatNama.hidden = !pesan;
  el.inputNama.setAttribute('aria-invalid', pesan ? 'true' : 'false');
}


/* ----- Daftar anggota ----- */
export function renderAnggota() {
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

export function perbaruiStatusAnggota() {
  el.daftarAnggota.querySelectorAll('.anggota').forEach(li => {
    const id = Number(li.dataset.id);

    li.classList.toggle('aktif', id === state.aktifId);

    li.querySelector('.anggota-pilih')
      .setAttribute('aria-pressed', String(id === state.aktifId));

    li.querySelector('.anggota-jam').textContent = jumlahJam(id) + ' jam';
  });
}

export function renderPilihAnggota() {
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

export function renderSemua() {
  renderAnggota();
  renderPilihAnggota();
  perbaruiGrid();
  el.inputWarna.value = warnaBerikut();
}


/* ----- Tabel jadwal ----- */
// Mencegah browser mengubah gerakan jari menjadi scroll saat menggeser kotak.
export function aturSentuhanGrid() {
  el.jadwal.querySelectorAll('.sel').forEach(sel => {
    sel.style.touchAction = 'none';
  });
}

export function buatGrid() {
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

export function gradien(daftarWarna) {
  const n = daftarWarna.length;
  if (n === 1) return daftarWarna[0];

  const bagian = daftarWarna.map((w, i) =>
    `${w} ${(i * 100 / n).toFixed(2)}% ${((i + 1) * 100 / n).toFixed(2)}%`
  );

  return `linear-gradient(to right, ${bagian.join(', ')})`;
}

export function perbaruiSel(sel) {
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

export function perbaruiGrid() {
  const aktif = anggotaById(state.aktifId);

  el.jadwal.style.setProperty('--aktif', aktif ? aktif.warna : 'transparent');
  el.jadwal.classList.toggle('mati', state.anggota.length === 0);

  el.jadwal.querySelectorAll('.sel').forEach(perbaruiSel);
}


/* ----- Hasil pencarian ----- */
export function resetHasil() {
  status.hasilTampil = false;
  el.catatanBasi.hidden = true;

  el.hasil.innerHTML =
    '<p class="kosong">Belum ada hasil. Tandai jam kosong di tabel, ' +
    'lalu tekan "Cari waktu cocok".</p>';
}

export function tampilkanHasilGalat(pesan) {
  status.hasilTampil = false;
  el.catatanBasi.hidden = true;

  el.hasil.innerHTML = `<p class="galat-blok" role="alert">${esc(pesan)}</p>`;
}

export function renderHasil(hasil) {
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
  status.hasilTampil = true;
}

export function sorot(hari, mulai, selesai, kartu) {
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

export function hapusSorotan() {
  el.jadwal.querySelectorAll('.disorot').forEach(s => {
    s.classList.remove('disorot');
  });

  el.hasil.querySelectorAll('.hasil-kartu.dipilih').forEach(k => {
    k.classList.remove('dipilih');
    k.removeAttribute('aria-current');
  });
}

export function tandaiBasi() {
  if (status.hasilTampil) el.catatanBasi.hidden = false;
}


/* ----- Tooltip ----- */
export function tampilkanTooltip(sel) {
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

export function sembunyikanTooltip() {
  el.tooltip.hidden = true;
}


/* ----- Pindah tampilan dan animasi ----- */
export function animasi(node, kf, opsi) {
  return node.animate(kf, {
    ...opsi,
    duration: kurangiGerak ? 0 : opsi.duration
  });
}

const tampilan = [...document.querySelectorAll('.view')];

export function show(nama) {
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
}

export function getar(node) {
  animasi(
    node,
    [0, -6, 6, -6, 6, 0].map(x => ({ transform: `translateX(${x}px)` })),
    { duration: 300, easing: 'ease-in-out' }
  );
}