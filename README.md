# patungan. — Interactive Expense Splitter

Front end sederhana untuk membagi tagihan bersama secara cepat dan transparan. Project ini dibuat sebagai static site tanpa framework atau backend sehingga dapat langsung dibuka di browser.

## Fitur

- Kalkulasi subtotal, biaya layanan, tip, total akhir, dan nominal per orang secara real-time.
- Tambah, hapus, dan ubah nama peserta.
- Pilihan tip 0%, 5%, 10%, dan 15%.
- Tombol reset ke contoh data awal.
- Salin ringkasan patungan ke clipboard.
- Layout responsif untuk desktop dan mobile.

## Menjalankan project

Buka file `index.html` langsung di browser, atau jalankan local server sederhana dari folder project:

```bash
python3 -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Struktur file

- `index.html` — markup halaman dan komponen UI.
- `styles.css` — design system, layout responsif, serta animasi ringan.
- `script.js` — state peserta, rumus kalkulasi, reset, dan clipboard.
