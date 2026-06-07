// =============================================
// database.js - Setup & Koneksi PostgreSQL (Neon)
// =============================================
// Menggunakan pg (node-postgres) yang kompatibel dengan Vercel.
// Koneksi via DATABASE_URL dari environment variable.

require('dotenv').config();
const { Pool } = require('pg');

// Buat connection pool
// - Di production (Vercel): pakai DATABASE_URL dari Neon
// - Di lokal: pakai DATABASE_URL dari file .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // Wajib untuk Neon di production
    : false                           // Tidak perlu SSL di lokal
});

// ─── Inisialisasi Tabel ───────────────────────────────────────────────────────
// Dipanggil saat server pertama kali start.
// Gunakan CREATE TABLE IF NOT EXISTS agar aman dijalankan berkali-kali.
const initDB = async () => {
  try {
    // Tabel Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        nama       TEXT   NOT NULL,
        email      TEXT   NOT NULL UNIQUE,
        password   TEXT   NOT NULL,
        role       TEXT   NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabel Barang Dekorasi
    await pool.query(`
      CREATE TABLE IF NOT EXISTS barang_dekorasi (
        id          SERIAL PRIMARY KEY,
        nama_barang TEXT    NOT NULL,
        kategori    TEXT    NOT NULL,
        stok        INTEGER NOT NULL DEFAULT 0,
        satuan      TEXT    NOT NULL DEFAULT 'pcs',
        harga_sewa  NUMERIC NOT NULL DEFAULT 0,
        kondisi     TEXT    NOT NULL DEFAULT 'Baik',
        keterangan  TEXT,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabel Jadwal Sewa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jadwal_sewa (
        id              SERIAL PRIMARY KEY,
        nama_penyewa    TEXT    NOT NULL,
        no_hp           TEXT    NOT NULL,
        nama_acara      TEXT    NOT NULL,
        tanggal_mulai   DATE    NOT NULL,
        tanggal_selesai DATE    NOT NULL,
        lokasi          TEXT    NOT NULL,
        status          TEXT    NOT NULL DEFAULT 'Pending',
        total_harga     NUMERIC NOT NULL DEFAULT 0,
        catatan         TEXT,
        created_at      TIMESTAMP DEFAULT NOW(),
        updated_at      TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database PostgreSQL dan tabel berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Gagal inisialisasi database:', error.message);
    throw error;
  }
};

// Jalankan inisialisasi saat module di-load
initDB();

module.exports = pool;
