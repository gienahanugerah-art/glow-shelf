import {
  API_URL,
  PRODUCT_LIMIT,
  KATEGORI_RAK,
  KEY_FAVORIT,
  KEY_TEMA,
} from './config.js';

// ---------- 1. Elemen halaman ----------
const productList = document.getElementById('product-list');
const favoriteList = document.getElementById('favorite-list');
const statsEl = document.getElementById('stats');
const statusEl = document.getElementById('status');
const saranForm = document.getElementById('saran-form');
const formStatus = document.getElementById('form-status');
const themeToggle = document.getElementById('theme-toggle');

// ---------- 2. State dan konstanta ----------
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let semuaProduk = [];
let favoritIds = bacaFavorit();

// ---------- 3. Favorit (localStorage) ----------
function bacaFavorit() {
  try {
    const tersimpan = localStorage.getItem(KEY_FAVORIT);
    return tersimpan ? JSON.parse(tersimpan) : [];
  } catch (error) {
    console.error('Gagal membaca favorit:', error.message);
    return [];
  }
}

function simpanFavorit() {
  try {
    localStorage.setItem(KEY_FAVORIT, JSON.stringify(favoritIds));
  } catch (error) {
    console.error('Gagal menyimpan favorit:', error.message);
  }
}

function toggleFavorit(id) {
  if (favoritIds.includes(id)) {
    favoritIds = favoritIds.filter((item) => item !== id);
  } else {
    favoritIds.push(id);
  }
  simpanFavorit();
}

// ---------- 4. Tampilan produk dan favorit ----------
function formatHarga(angka) {
  return '$' + angka.toFixed(2);
}

function tampilkanStatus(pesan, jenis) {
  statusEl.textContent = pesan;
  statusEl.className = jenis; // 'loading', 'sukses', atau 'error'
}

function buatKartu(produk) {
  const kartu = document.createElement('article');
  kartu.className = 'card';

  const gambar = document.createElement('img');
  gambar.src = produk.thumbnail;
  gambar.alt = produk.title;
  gambar.loading = 'lazy';

  const judul = document.createElement('h3');
  judul.textContent = produk.title;

  const kategori = document.createElement('p');
  kategori.className = 'kategori';
  kategori.textContent = produk.category;

  const harga = document.createElement('p');
  harga.className = 'harga';
  harga.textContent = formatHarga(produk.price);

  const rating = document.createElement('p');
  rating.textContent = `Rating: ${produk.rating}`;

  const tombol = document.createElement('button');
  tombol.type = 'button';
  tombol.className = 'btn-favorit';
  tombol.dataset.id = produk.id;
  const sudahFavorit = favoritIds.includes(produk.id);
  tombol.textContent = sudahFavorit
    ? '♥ Hapus dari favorit'
    : '♡ Simpan ke favorit';

  kartu.append(gambar, judul, kategori, harga, rating, tombol);
  return kartu;
}

function tampilkanProduk(daftar) {
  productList.innerHTML = '';
  daftar.forEach((produk) => {
    productList.appendChild(buatKartu(produk));
  });
}

function tampilkanFavorit() {
  favoriteList.innerHTML = '';

  const daftarFavorit = semuaProduk.filter((produk) =>
    favoritIds.includes(produk.id)
  );

  if (daftarFavorit.length === 0) {
    const pesan = document.createElement('p');
    pesan.textContent = 'Belum ada produk favorit.';
    favoriteList.appendChild(pesan);
    return;
  }

  daftarFavorit.forEach((produk) => {
    favoriteList.appendChild(buatKartu(produk));
  });
}

// ---------- 5. Analisis data ----------
function hitungStatistik(daftar) {
  if (daftar.length === 0) return null;

  const totalHarga = daftar.reduce((jumlah, produk) => jumlah + produk.price, 0);
  const totalRating = daftar.reduce((jumlah, produk) => jumlah + produk.rating, 0);
  const termahal = daftar.reduce((maks, produk) =>
    produk.price > maks.price ? produk : maks
  );

  return {
    rataHarga: totalHarga / daftar.length,
    rataRating: totalRating / daftar.length,
    termahal,
  };
}

function buatStat(label, nilai, keterangan) {
  const kotak = document.createElement('div');
  kotak.className = 'stat';

  const teksLabel = document.createElement('p');
  teksLabel.className = 'stat-label';
  teksLabel.textContent = label;

  const teksNilai = document.createElement('p');
  teksNilai.className = 'stat-nilai';
  teksNilai.textContent = nilai;

  const teksKet = document.createElement('p');
  teksKet.textContent = keterangan;

  kotak.append(teksLabel, teksNilai, teksKet);
  return kotak;
}

function tampilkanStatistik(daftar) {
  statsEl.innerHTML = '';
  const hasil = hitungStatistik(daftar);

  if (!hasil) {
    const pesan = document.createElement('p');
    pesan.textContent = 'Belum ada data untuk dihitung.';
    statsEl.appendChild(pesan);
    return;
  }

  statsEl.append(
    buatStat('Rata-rata harga', formatHarga(hasil.rataHarga), `dari ${daftar.length} produk`),
    buatStat('Rata-rata rating', hasil.rataRating.toFixed(2), 'dari semua produk di rak'),
    buatStat('Produk termahal', formatHarga(hasil.termahal.price), hasil.termahal.title)
  );
}

// ---------- 6. Form saran (email + konfirmasi email) ----------
function bacaDataForm(form) {
  return {
    nama: form.nama.value.trim(),
    email: form.email.value.trim().toLowerCase(),
    email2: form.email2.value.trim().toLowerCase(),
  };
}

function validasiSaran(data) {
  const errors = {};

  if (data.nama.length === 0) {
    errors.nama = 'Nama wajib diisi.';
  }

  if (data.email.length === 0) {
    errors.email = 'Email wajib diisi.';
  } else if (!POLA_EMAIL.test(data.email)) {
    errors.email = 'Format email belum valid. Contoh: nama@gmail.com';
  }

  if (data.email2.length === 0) {
    errors.email2 = 'Konfirmasi email wajib diisi.';
  } else if (data.email2 !== data.email) {
    errors.email2 = 'Konfirmasi email tidak sama dengan email di atas.';
  }

  return errors;
}

function bersihkanErrorForm() {
  saranForm.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  saranForm
    .querySelectorAll('[aria-invalid="true"]')
    .forEach((el) => el.removeAttribute('aria-invalid'));
  formStatus.textContent = '';
}

function tanganiSubmitForm(event) {
  event.preventDefault();
  bersihkanErrorForm();

  const data = bacaDataForm(saranForm);
  const errors = validasiSaran(data);
  const daftarField = Object.keys(errors);

  if (daftarField.length > 0) {
    for (const [field, pesan] of Object.entries(errors)) {
      const errorEl = document.getElementById(`error-${field}`);
      if (errorEl) errorEl.textContent = '⚠ ' + pesan;

      const inputEl = saranForm.elements[field];
      if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
    }
    saranForm.elements[daftarField[0]]?.focus();
    formStatus.textContent = `Periksa kembali isian formulir (${daftarField.length} kolom bermasalah).`;
    return;
  }

  formStatus.textContent = `✓ Terima kasih, ${data.nama}! Data valid dan siap dikirim. (Belum dikirim ke server karena ini latihan front-end.)`;
  console.log('Data saran (belum dikirim):', data);
}

// ---------- 7. Tema terang/gelap ----------
function terapkanTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  themeToggle.textContent = tema === 'dark' ? 'Mode terang' : 'Mode gelap';
}

function bacaTema() {
  try {
    const tersimpan = localStorage.getItem(KEY_TEMA);
    if (tersimpan === 'dark' || tersimpan === 'light') return tersimpan;
  } catch (error) {
    console.error('Gagal membaca tema:', error.message);
  }
  return 'light';
}

function ubahTema() {
  const sekarang = document.documentElement.getAttribute('data-theme');
  const baru = sekarang === 'dark' ? 'light' : 'dark';
  terapkanTema(baru);
  try {
    localStorage.setItem(KEY_TEMA, baru);
  } catch (error) {
    console.error('Gagal menyimpan tema:', error.message);
  }
}

// ---------- 8. Event ----------
function tanganiKlikFavorit(event) {
  const tombol = event.target.closest('.btn-favorit');
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const asal = event.currentTarget.id;

  toggleFavorit(id);
  tampilkanProduk(semuaProduk);
  tampilkanFavorit();

  // kembalikan fokus ke tombol yang tadi ditekan (untuk pengguna keyboard)
  const tombolBaru = document.querySelector(`#${asal} [data-id="${id}"]`);
  if (tombolBaru) tombolBaru.focus();
}

productList.addEventListener('click', tanganiKlikFavorit);
favoriteList.addEventListener('click', tanganiKlikFavorit);
saranForm.addEventListener('submit', tanganiSubmitForm);
themeToggle.addEventListener('click', ubahTema);

// ---------- 9. Ambil data dari REST API ----------
async function ambilProduk() {
  tampilkanStatus('⏳ Memuat produk...', 'loading');

  try {
    const response = await fetch(`${API_URL}?limit=${PRODUCT_LIMIT}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    // hanya produk yang cocok untuk rak kecantikan
    semuaProduk = data.products.filter((produk) =>
      KATEGORI_RAK.includes(produk.category)
    );

    // buang favorit lama yang produknya tidak ada di rak
    favoritIds = favoritIds.filter((id) =>
      semuaProduk.some((produk) => produk.id === id)
    );
    simpanFavorit();

    tampilkanProduk(semuaProduk);
    tampilkanFavorit();
    tampilkanStatistik(semuaProduk);
    tampilkanStatus(`✓ Berhasil memuat ${semuaProduk.length} produk.`, 'sukses');
  } catch (error) {
    tampilkanStatus(
      `⚠ Gagal memuat produk (${error.message}). Periksa koneksi internet, lalu muat ulang halaman.`,
      'error'
    );
    console.error('Gagal mengambil data:', error.message);
  }
}

// ---------- 10. Mulai aplikasi ----------
terapkanTema(bacaTema());
ambilProduk();