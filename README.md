# patungan. — Interactive Expense Splitter

Front end statis untuk membagi tagihan bersama dengan sistem visual yang dapat diganti secara langsung. Project ini dibuat tanpa backend sehingga dapat langsung dibuka di browser.

## Fitur utama

Kalkulator menghitung subtotal, biaya layanan, tip, total akhir, dan nominal per orang secara real-time. Peserta dapat ditambah, dihapus, atau diganti namanya. Ringkasan hasil dapat disalin ke clipboard untuk langsung dikirim ke grup.

Aplikasi sekarang menyediakan 12 pilihan tema yang mengubah lebih dari sekadar warna: layout, bentuk kartu, ketebalan border, shadow, tipografi, spacing, tombol, navbar, timer, modal, dropdown, animasi, background, dan gaya ikon ikut menyesuaikan. Tema yang tersedia adalah Minimalism, Bento Grid, Maximalism, Neo-Brutalism, Liquid Glass, Cyberpunk, Retro Terminal, Frutiger Aero, Dark Fantasy, Medieval, Arcane, dan Celestial.

Setiap tema memiliki pasangan **Light dan Dark yang dirancang khusus**, bukan satu dark mode global. Ketika mode diganti, palette background, surface, teks, border, shadow, summary panel, dan aksen akan menyesuaikan karakter tema yang sedang aktif. Contohnya, Cyberpunk Light memakai cyan gelap di atas permukaan biru pucat, sedangkan Cyberpunk Dark memakai navy hampir hitam dengan neon cyan-magenta; Medieval Light memakai parchment terang, sedangkan Medieval Dark memakai brown-black dengan aksen amber.

Dark mode, light mode, timer sesi, modal quick guide, theme dropdown, toast feedback, hover states, serta sound effects menggunakan Web Audio API juga tersedia. SFX dapat dimatikan dari tombol gelombang suara di navbar. Preferensi tema, mode, dan suara tersimpan di browser melalui localStorage.

## Menjalankan project

Buka `index.html` langsung di browser, atau jalankan local server sederhana dari folder project:

```bash
python3 -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Struktur file

- `index.html` — markup halaman, kontrol tema, timer, dropdown, dan modal bantuan.
- `styles.css` — design system dasar dan override visual untuk 12 tema serta dark mode.
- `script.js` — kalkulasi, state peserta, theme switcher, timer, SFX, modal, reset, dan clipboard.
