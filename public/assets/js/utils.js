// public/assets/js/utils.js

/**
 * Mendapatkan inisial dari nama.
 * Mengambil huruf pertama dari setiap kata (maksimal dua).
 * @param {string} name - Nama lengkap.
 * @returns {string} Inisial nama.
 */
export function getInitials(name) {
    if (!name) return "";
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

/**
 * Fungsi placeholder untuk menghasilkan warna dari string.
 * Saat ini hanya mengembalikan warna statis.
 * Jika Anda ingin warna dinamis lagi, Anda bisa tambahkan algoritma hashing di sini.
 * @param {string} str - String untuk diubah menjadi warna.
 * @returns {object} Objek berisi bgColor dan textColor.
 */
export function stringToColor(str) {
    // Implementasi hashing warna Anda sebelumnya bisa masuk di sini
    // Untuk saat ini, kita akan menggunakan warna statis seperti yang diminta.
    return {
        bgColor: '#A78BFA', // Purple-400 (contoh)
        textColor: '#FFFFFF' // White
    };
}