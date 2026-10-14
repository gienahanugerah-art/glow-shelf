import { API_URL, PRODUCT_LIMIT } from './config.js';

let semuaProduk = [];

async function ambilProduk() {
  try {
    const response = await fetch(`${API_URL}?limit=${PRODUCT_LIMIT}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    semuaProduk = data.products;

    console.log('Jumlah produk:', semuaProduk.length);
    console.log('Produk pertama:', semuaProduk[0]);
  } catch (error) {
    console.error('Gagal mengambil data:', error.message);
  }
}

ambilProduk();