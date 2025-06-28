# Aplikasi Grup Chat WebSocket Sederhana

*Ganti URL gambar dengan tangkapan layar aplikasi Anda.*

Aplikasi ini adalah contoh sederhana dari sebuah sistem grup chat real-time yang dibangun menggunakan **Node.js** dengan **Express** dan **WebSockets** (melalui library `ws`), serta antarmuka pengguna yang responsif menggunakan **Tailwind CSS**. Aplikasi ini mendukung obrolan publik dan fitur pesan pribadi antar pengguna yang sedang online.

-----

## Fitur

  * **Obrolan Real-time**: Pesan dikirim dan diterima secara instan oleh semua anggota grup.
  * **Pesan Pribadi (Private Message)**: Pengguna dapat mengirim pesan langsung ke pengguna lain yang sedang online.
  * **Daftar Pengguna Online**: Menampilkan daftar pengguna yang sedang aktif dalam chat.
  * **Responsif**: Antarmuka pengguna menyesuaikan diri dengan berbagai ukuran layar (desktop dan mobile) berkat **Tailwind CSS**.
  * **Input Nama Pengguna**: Pengguna dapat memasukkan nama mereka sebelum bergabung ke chat.
  * **Notifikasi Sistem**: Pesan sistem untuk peristiwa seperti pengguna bergabung atau keluar.

-----

## Teknologi yang Digunakan

  * **Backend**:
      * **Node.js**: Lingkungan runtime JavaScript sisi server.
      * **Express.js**: Framework web minimalis untuk Node.js.
      * **ws**: Library WebSocket untuk Node.js.
  * **Frontend**:
      * **HTML5**: Struktur dasar halaman web.
      * **JavaScript (Vanilla)**: Logika sisi klien untuk interaksi WebSocket dan UI.
      * **Tailwind CSS**: Framework CSS utility-first untuk styling yang responsif.
      * **Google Fonts (Poppins)**: Untuk tipografi yang bersih dan modern.

-----

## Instalasi dan Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi ini di lingkungan lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal yang berikut ini:

  * **Node.js** (disarankan versi LTS)
  * **npm** (Node Package Manager, biasanya terinstal bersama Node.js)

### Langkah-langkah Instalasi

1.  **Kloning Repositori (Opsional, jika ini ada di Git):**

    ```bash
    git clone https://github.com/your-username/chat-app-websocket.git
    cd chat-app-websocket
    ```

    *Jika Anda membuat folder secara manual, lewati langkah ini dan pastikan Anda berada di direktori proyek `chat-app`.*

2.  **Instal Dependensi:**
    Navigasi ke direktori proyek Anda di terminal dan instal semua dependensi yang diperlukan:

    ```bash
    npm install
    ```

3.  **Bangun (Build) CSS Tailwind:**
    Tailwind CSS memerlukan proses build untuk menghasilkan file CSS yang akan digunakan oleh browser. Jalankan perintah ini di **terminal terpisah** dan biarkan tetap berjalan karena memiliki mode `watch`.

    ```bash
    npm run build-css
    ```

4.  **Mulai Server Node.js:**
    Di terminal lain, mulai server aplikasi:

    ```bash
    npm start
    ```

    Anda akan melihat pesan di konsol seperti: `Server listening on http://localhost:3000`.

### Menggunakan Aplikasi

1.  Buka browser web Anda dan navigasikan ke `http://localhost:3000`.
2.  Masukkan **nama pengguna** Anda di kolom yang tersedia dan klik "Gabung Chat".
3.  Untuk menguji fitur chat, buka beberapa tab atau jendela browser lain ke alamat yang sama (`http://localhost:3000`), dan gunakan nama pengguna yang berbeda di setiap tab.
4.  **Untuk Chat Publik**: Pastikan "Semua (Public Chat)" terpilih di daftar "User Online". Ketik pesan Anda dan kirim. Pesan akan terlihat oleh semua pengguna.
5.  **Untuk Pesan Pribadi**: Klik nama pengguna yang Anda tuju di daftar "User Online". Area pesan akan menunjukkan siapa penerimanya. Ketik pesan Anda; pesan ini hanya akan terlihat oleh Anda dan pengguna yang dituju.

-----

## Struktur Proyek

```
chat-app/
├── server.js               # Logika server Node.js dan WebSocket
├── public/
│   ├── index.html          # Antarmuka pengguna (frontend)
│   ├── style.css           # File input untuk Tailwind CSS
│   └── output.css          # Output CSS yang dihasilkan oleh Tailwind
└── package.json            # Konfigurasi proyek dan dependensi
```

-----

## Pengembangan Lebih Lanjut (Ide)

  * **Manajemen Sesi/Autentikasi**: Tambahkan sistem login untuk mengelola pengguna yang lebih persisten.
  * **Penyimpanan Pesan**: Integrasikan dengan database (misalnya, MongoDB, PostgreSQL) untuk menyimpan riwayat chat.
  * **Notifikasi**: Tambahkan notifikasi suara atau visual untuk pesan baru.
  * **Ruang Obrolan (Rooms)**: Izinkan pengguna membuat dan bergabung ke ruang obrolan yang berbeda.
  * **Emotikon/Media**: Dukungan untuk pengiriman emotikon atau file media kecil.
  * **Peningkatan UI/UX**: Desain yang lebih kompleks atau transisi UI yang lebih halus.

-----

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan fork repositori dan ajukan pull request.

-----

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).

-----