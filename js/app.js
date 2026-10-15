import { API_URL, PRODUCT_LIMIT, KEY_FAVORIT, KEY_TEMA } from './config.js';

const productList = document.getElementById('product-list');
const favoriteList = document.getElementById('favorite-list');

let semuaProduk = [];
let favoritIds = bacaFavorit();

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
  localStorage.setItem(KEY_FAVORIT, JSON.stringify(favoritIds));
}

function toggleFavorit(id) {
  if (favoritIds.includes(id)) {
    favoritIds = favoritIds.filter((item) => item !== id);
  } else {
    favoritIds.push(id);
  }
  simpanFavorit();
}

function formatHarga(angka) {
  return '$' + angka.toFixed(2);
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
  tombol.textContent = sudahFavorit ? '♥ Hapus dari favorit' : '♡ Simpan ke favorit';

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

function tanganiKlikFavorit(event) {
  const tombol = event.target.closest('.btn-favorit');
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const asal = event.currentTarget.id;

  toggleFavorit(id);
  tampilkanProduk(semuaProduk);
  tampilkanStatistik(semuaProduk);
  tampilkanFavorit();

  // kembalikan fokus ke tombol yang tadi ditekan (untuk pengguna keyboard)
  const tombolBaru = document.querySelector(`#${asal} [data-id="${id}"]`);
  if (tombolBaru) tombolBaru.focus();
}

productList.addEventListener('click', tanganiKlikFavorit);
favoriteList.addEventListener('click', tanganiKlikFavorit);

async function ambilProduk() {
  try {
    const response = await fetch(`${API_URL}?limit=${PRODUCT_LIMIT}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    semuaProduk = data.products;

    console.log('Jumlah produk:', semuaProduk.length);
    tampilkanProduk(semuaProduk);
    tampilkanStatistik(semuaProduk);
    tampilkanFavorit();

  } catch (error) {
    console.error('Gagal mengambil data:', error.message);
  }
}

// ---------- analisis data ----------
const statsEl = document.getElementById('stats');

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

ambilProduk();

// ---------- tema terang/gelap ----------
const themeToggle = document.getElementById('theme-toggle');

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

themeToggle.addEventListener('click', ubahTema);
terapkanTema(bacaTema());