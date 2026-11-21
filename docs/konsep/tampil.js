// tampil.js — merender KONSEP menjadi halaman dan memeriksa aturan Tugas 7. Tidak perlu diubah.
const $ = (s) => document.querySelector(s);
const PRIORITAS = { wajib: 'Wajib ada', sebaiknya: 'Sebaiknya ada', belum: 'Belum perlu' };
function el(tag, teks, kelas) {
  const e = document.createElement(tag);
  if (teks !== undefined) e.textContent = teks;   // textContent: isi data tidak dibaca sebagai HTML
  if (kelas) e.className = kelas;
  return e;
}
function jumlahKalimat(teks) {
  return (teks.match(/[^.!?]+[.!?]+/g) || []).length;
}
function periksa(k) {
  const aturan = [
    ['Persona punya siapa, keseharian, dan masalah',
      ['siapa', 'keseharian', 'masalah'].every((x) => (k.persona[x] || '').trim().length > 0)],
    ['Pernyataan masalah maksimal 3 kalimat', jumlahKalimat(k.masalah) > 0 && jumlahKalimat(k.masalah) <= 3],
    ['Usulan solusi maksimal 3 kalimat', jumlahKalimat(k.solusi) > 0 && jumlahKalimat(k.solusi) <= 3],
    ['Setiap fitur punya prioritas yang sah dan alasan',
      k.fitur.length > 0 && k.fitur.every((f) => PRIORITAS[f.prioritas] && (f.alasan || '').trim())],
    ['Fitur wajib ada maksimal 4', k.fitur.filter((f) => f.prioritas === 'wajib').length <= 4],
    ['Ada fitur di ketiga kelompok prioritas',
      Object.keys(PRIORITAS).every((p) => k.fitur.some((f) => f.prioritas === p))],
    ['Minimal 2 aplikasi pembanding', k.pembanding.length >= 2],
    ['Pembeda produk dituliskan', (k.pembeda || '').trim().length > 0],
  ];
  $('#periksa').replaceChildren(...aturan.map(([teks, ok]) =>
    el('li', (ok ? 'Lolos: ' : 'Belum: ') + teks, ok ? 'lolos' : 'gagal')));
  return aturan.every(([, ok]) => ok);
}
function tampil(k) {
  document.title = `${k.nama} — Konsep Produk`;
  $('#nama').textContent = k.nama;
  $('#tagline').textContent = k.tagline;
  $('#persona').replaceChildren(...[
    ['Nama', k.persona.nama], ['Siapa', k.persona.siapa],
    ['Keseharian', k.persona.keseharian], ['Masalah', k.persona.masalah],
  ].map(([label, isi]) => {
    const d = el('div');
    d.append(el('div', label, 'label'), el('div', isi));
    return d;
  }));
  $('#masalah').textContent = k.masalah;
  $('#solusi').textContent = k.solusi;
  $('#fitur').replaceChildren(...Object.entries(PRIORITAS).map(([kode, label]) => {
    const kol = el('div');
    const daftar = el('ul');
    k.fitur.filter((f) => f.prioritas === kode).forEach((f) => {
      const li = el('li');
      li.append(el('strong', f.nama), document.createTextNode(' — ' + f.alasan));
      daftar.append(li);
    });
    kol.append(el('div', label, 'label'), daftar);
    return kol;
  }));
  const kepala = el('tr');
  ['Aplikasi', 'Kelebihan', 'Kekurangan'].forEach((t) => kepala.append(el('th', t)));
  const baris = k.pembanding.map((p) => {
    const tr = el('tr');
    [p.nama, p.kelebihan, p.kekurangan].forEach((t) => tr.append(el('td', t)));
    return tr;
  });
  const pembeda = el('tr');
  const sel = el('td', 'Pembeda ' + k.nama + ': ' + k.pembeda);
  sel.colSpan = 3;
  pembeda.append(sel);
  $('#banding').replaceChildren(kepala, ...baris, pembeda);
  periksa(k);
}
tampil(KONSEP);