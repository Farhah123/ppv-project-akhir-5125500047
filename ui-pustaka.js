/* =========================================================
   ui-pustaka.js - SATU-SATUNYA berkas yang memanggil API JavaScript Bootstrap.
   Berkas lain (script.js) hanya memanggil UI.toast(), UI.konfirmasi(), UI.bukaPintasan().
   Bila pustaka diganti suatu hari nanti, cukup berkas ini yang diubah.
   Bootstrap 5.3.3 harus dimuat lebih dulu di index.html.
   ========================================================= */
window.UI = (() => {
  const ADA_BS = typeof bootstrap !== 'undefined';   // false bila CDN gagal dimuat (misalnya offline)

  const elToast = document.getElementById('toast');
  const elToastTeks = document.getElementById('toastTeks');
  const elToastAksi = document.getElementById('toastAksi');
  const elModal = document.getElementById('modalKonfirmasi');
  const elModalJudul = document.getElementById('judulKonfirmasi');
  const elModalIsi = document.getElementById('isiKonfirmasi');
  const elModalYa = document.getElementById('btnKonfirmasiYa');
  const elPanel = document.getElementById('panelPintasan');

  const toastBs = ADA_BS ? bootstrap.Toast.getOrCreateInstance(elToast, { autohide: false }) : null;
  const modalBs = ADA_BS ? bootstrap.Modal.getOrCreateInstance(elModal) : null;
  const panelBs = ADA_BS ? bootstrap.Offcanvas.getOrCreateInstance(elPanel) : null;

  if (!ADA_BS) elToast.hidden = true;   // tanpa CSS Bootstrap, sembunyikan toast dengan atribut hidden

  /* ---------- Toast ---------- */
  let waktuToast = null;
  let aksiToast = null;

  function sembunyikanToast() {
    clearTimeout(waktuToast);
    aksiToast = null;
    if (ADA_BS) toastBs.hide(); else elToast.hidden = true;
  }

  function toast(teks, labelAksi, aksi) {
    clearTimeout(waktuToast);
    elToastTeks.textContent = teks;
    aksiToast = aksi || null;
    elToastAksi.hidden = !aksi;
    if (aksi) elToastAksi.textContent = labelAksi;
    if (ADA_BS) toastBs.show(); else elToast.hidden = false;
    waktuToast = setTimeout(sembunyikanToast, aksi ? 7000 : 3500);
  }

  elToastAksi.addEventListener('click', () => {
    const aksi = aksiToast;
    sembunyikanToast();
    if (aksi) aksi();
  });

  /* ---------- Modal konfirmasi ---------- */
  // Mengembalikan Promise: true bila pengguna menekan tombol Ya, false bila Batal/ditutup.
  function konfirmasi({ judul, isi, labelYa = 'Ya' }) {
    if (!ADA_BS) return Promise.resolve(window.confirm(`${judul}\n\n${isi}`));

    return new Promise(selesai => {
      const pemicu = document.activeElement;   // untuk mengembalikan fokus setelah modal tertutup
      let jawaban = false;

      elModalJudul.textContent = judul;
      elModalIsi.textContent = isi;
      elModalYa.textContent = labelYa;

      const onYa = () => { jawaban = true; modalBs.hide(); };
      const onTutup = () => {
        elModalYa.removeEventListener('click', onYa);
        if (pemicu && pemicu.focus) pemicu.focus();
        selesai(jawaban);
      };
      elModalYa.addEventListener('click', onYa);
      elModal.addEventListener('hidden.bs.modal', onTutup, { once: true });
      modalBs.show();
    });
  }

  /* ---------- Offcanvas pintasan keyboard ---------- */
  function bukaPintasan() {
    if (!ADA_BS) {
      window.alert(elPanel.querySelector('.offcanvas-body').innerText);
      return;
    }
    const pemicu = document.activeElement;
    elPanel.addEventListener('hidden.bs.offcanvas', () => {
      if (pemicu && pemicu.focus) pemicu.focus();
    }, { once: true });
    panelBs.show();
  }

  return { toast, konfirmasi, bukaPintasan };
})();