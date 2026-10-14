import { API_URL, PRODUCT_LIMIT } from './config.js';

const productList = document.getElementById('product-list');

let semuaProduk = [];

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

  kartu.append(gambar, judul, kategori, harga, rating);
  return kartu;
}

function tampilkanProduk(daftar) {
  productList.innerHTML = '';
  daftar.forEach((produk) => {
    productList.appendChild(buatKartu(produk));
  });
}

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
  } catch (error) {
    console.error('Gagal mengambil data:', error.message);
  }
}

ambilProduk();