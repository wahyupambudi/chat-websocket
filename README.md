# Aplikasi Grup Chat WebSocket Sederhana

Aplikasi ini adalah contoh sederhana dari sistem grup chat real-time yang dibangun menggunakan **Node.js** dengan **Express** dan **WebSockets**. Antarmuka pengguna (UI) dibangun dengan **HTML**, **JavaScript**, dan distyling menggunakan **Tailwind CSS** untuk desain yang responsif. Aplikasi ini mendukung obrolan publik, pesan pribadi, dan menampilkan riwayat pengguna yang telah bergabung.

-----

## Fitur

  * **Obrolan Real-time**: Pesan dikirim dan diterima secara instan oleh semua anggota grup.
  * **Pesan Pribadi (Private Message)**: Pengguna dapat mengirim pesan langsung ke pengguna lain yang sedang online.
  * **Inisial Pengguna**: Setiap pesan chat dilengkapi dengan inisial nama depan pengirim, memberikan identifikasi visual yang cepat.
  * **Daftar Pengguna Online**: Menampilkan daftar pengguna yang sedang aktif dalam chat, dengan indikator visual untuk user yang sedang dipilih.
  * **Riwayat Pengguna**: Menampilkan daftar nama pengguna yang pernah bergabung ke chat sejak server dimulai, ditampilkan dalam bentuk "tag".
  * **Responsif**: Antarmuka pengguna menyesuaikan diri dengan berbagai ukuran layar (desktop dan mobile) berkat Tailwind CSS.
  * **Input Nama Pengguna**: Pengguna dapat memasukkan nama mereka sebelum bergabung ke chat.
  * **Notifikasi Sistem**: Pesan sistem untuk peristiwa seperti pengguna bergabung atau keluar, serta kesalahan koneksi.

-----

## Teknologi yang Digunakan

  * **Backend**:
      * **Node.js**: Lingkungan runtime JavaScript sisi server.
      * **Express.js**: Framework web minimalis untuk Node.js, digunakan untuk menyajikan file statis.
      * **ws**: Library WebSocket populer untuk implementasi WebSocket di Node.js.
  * **Frontend**:
      * **HTML5**: Struktur dasar halaman web.
      * **JavaScript (Vanilla)**: Logika sisi klien untuk interaksi WebSocket, manajemen UI, dan manipulasi DOM.
      * **Tailwind CSS**: Framework CSS utility-first untuk styling yang responsif dan modular.
      * **PostCSS & Autoprefixer**: Digunakan oleh Tailwind untuk pemrosesan CSS.
      * **Google Fonts (Poppins)**: Untuk tipografi yang bersih dan modern.

-----

## Instalasi dan Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi ini di lingkungan lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal yang berikut ini:

  * **Node.js** (disarankan versi LTS)
  * **npm** (Node Package Manager, biasanya terinstal bersama Node.js)

### Langkah-langkah Instalasi

1.  **Kloning Repositori:**

    ```bash
    git clone https://github.com/wahyupambudi/chat-websocket.git
    cd chat-websocket
    ```

2.  **Instal Dependensi:**
    Navigasi ke direktori proyek Anda di terminal dan instal semua dependensi yang diperlukan:

    ```bash
    npm install
    ```

3.  **Bangun (Build) CSS Tailwind:**
    Tailwind CSS memerlukan proses build untuk menghasilkan file CSS akhir (`public/output.css`). Jalankan perintah ini di **terminal terpisah** dan biarkan tetap berjalan karena memiliki mode `watch` (untuk pengembangan).

    ```bash
    npm run watch-css
    ```

    *Catatan: Jika Anda ingin build untuk produksi, gunakan `npm run build-css` yang tidak memiliki `--watch`.*

4.  **Mulai Server Node.js:**
    Di terminal lain, mulai server aplikasi Anda:

    ```bash
    npm start
    ```

    Anda akan melihat pesan di konsol seperti: `Server listening on http://localhost:3000`.

### Menggunakan Aplikasi

1.  Buka browser web Anda dan navigasikan ke `http://localhost:3000`.
2.  Anda akan melihat daftar "Riwayat User" (jika ada) langsung muncul.
3.  Masukkan **nama pengguna** Anda di kolom yang tersedia dan klik "Gabung Chat".
4.  Untuk menguji fitur chat, buka beberapa tab atau jendela browser lain ke alamat yang sama (`http://localhost:3000`), dan gunakan nama pengguna yang berbeda di setiap tab.
5.  **Memilih Penerima Pesan**:
      * **Chat Publik**: Klik pada item "Semua (Public Chat)" di daftar "User Online". Latar belakangnya akan berubah untuk menunjukkan bahwa Anda sedang chat di grup publik.
      * **Pesan Pribadi**: Klik pada nama pengguna tertentu di daftar "User Online". Latar belakang item tersebut akan berubah, dan pesan yang Anda kirim hanya akan terlihat oleh Anda dan pengguna tersebut.

-----

## Struktur Proyek

```
chat-websocket/
├── server.js                   # Logika server Node.js dan WebSocket
├── public/                     # Folder berisi file frontend
│   ├── index.html              # Antarmuka pengguna (UI) utama
│   ├── style.css               # File input untuk Tailwind CSS
│   ├── output.css              # Output CSS yang dihasilkan oleh Tailwind (dibuat otomatis)
│   └── assets/
│       └── script.js           # Logika JavaScript sisi klien
├── package.json                # Konfigurasi proyek dan dependensi
├── tailwind.config.js          # Konfigurasi Tailwind CSS
└── postcss.config.js           # Konfigurasi PostCSS
```

-----

## Deployment

Aplikasi ini terdiri dari dua bagian utama: **Backend** (server Node.js WebSocket) dan **Frontend** (HTML/CSS/JS). Untuk *deploy* ke publik, mereka perlu di-hosting secara terpisah:

1.  **Deploy Backend (server.js):**
    Karena `server.js` menjalankan server persisten dengan WebSockets, Anda perlu platform hosting yang mendukung Node.js sebagai *Web Service* atau *Backend Service*.

      * **Rekomendasi**: **Render.com**, Heroku, Railway.
      * Setelah di-deploy, Anda akan mendapatkan URL publik (misalnya, `https://your-backend-app.onrender.com`).

2.  **Deploy Frontend (public/ folder):**
    File-file frontend Anda (`index.html`, `output.css`, `script.js`) dapat di-hosting sebagai situs statis.

      * **Rekomendasi**: **Netlify**, Vercel, GitHub Pages.
-----

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan *fork* repositori dan ajukan *pull request*.

-----

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).

-----