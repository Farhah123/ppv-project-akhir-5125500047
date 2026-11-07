/* =========================================================
   bunyi.js - efek suara "ding" dan tombol bunyi nyala/mati.
   Tidak mengimpor modul lain.
   ========================================================= */
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

export function bunyi() {
  if (!bunyiNyala || bunyiRusak) return;

  const t = performance.now();

  if (t - terakhirBunyi < 100) return;

  terakhirBunyi = t;
  ding.currentTime = 0;
  ding.play().catch(() => {});
}

export function alihBunyi() {
  bunyiNyala = !bunyiNyala;

  btnBunyi.setAttribute('aria-pressed', String(bunyiNyala));
  btnBunyi.textContent = bunyiNyala ? 'Bunyi: nyala' : 'Bunyi: mati';
}