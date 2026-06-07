// =============================================
// seed.js - Isi database PostgreSQL dengan data awal
// =============================================
// Jalankan SEKALI SAJA dengan: npm run seed

require('dotenv').config();
const pool = require('./database');
const bcrypt = require('bcryptjs');

const seed = async () => {
  console.log('🌱 Mulai mengisi data awal...\n');

  // ─── Seed Users ─────────────────────────────────────────────────────────────
  const users = [
    { nama: 'Admin Yoja', email: 'admin@yoja.com', password: 'admin123', role: 'admin' },
    { nama: 'Staff Dekorasi', email: 'staff@yoja.com', password: 'staff123', role: 'staff' }
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      'INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      [user.nama, user.email, hashed, user.role]
    );
    console.log(`✅ User: ${user.email} (password: ${user.password})`);
  }

  // ─── Seed Barang Dekorasi ────────────────────────────────────────────────────
  const barangList = [
    { nama: 'Backdrop Pernikahan Mewah', kategori: 'Backdrop', stok: 3, satuan: 'set', harga: 500000, kondisi: 'Baik', ket: 'Ukuran 4x2 meter, bahan premium' },
    { nama: 'Bunga Mawar Artificial', kategori: 'Bunga', stok: 50, satuan: 'tangkai', harga: 15000, kondisi: 'Baik', ket: 'Warna merah dan putih tersedia' },
    { nama: 'Lampu String Fairy Light', kategori: 'Lampu', stok: 20, satuan: 'gulung', harga: 50000, kondisi: 'Baik', ket: 'Panjang 10 meter per gulung' },
    { nama: 'Meja Tamu Oval', kategori: 'Furnitur', stok: 10, satuan: 'pcs', harga: 75000, kondisi: 'Baik', ket: null },
    { nama: 'Kursi Tiffany Gold', kategori: 'Furnitur', stok: 100, satuan: 'pcs', harga: 20000, kondisi: 'Baik', ket: 'Kursi cantik untuk acara formal' },
    { nama: 'Kain Organza Putih', kategori: 'Kain', stok: 30, satuan: 'meter', harga: 25000, kondisi: 'Baik', ket: null },
    { nama: 'Pita Satin Pink', kategori: 'Aksesori', stok: 100, satuan: 'meter', harga: 5000, kondisi: 'Baik', ket: null },
    { nama: 'Vas Bunga Kaca Besar', kategori: 'Aksesori', stok: 15, satuan: 'pcs', harga: 35000, kondisi: 'Baik', ket: 'Tinggi 40cm' },
  ];

  for (const b of barangList) {
    await pool.query(
      `INSERT INTO barang_dekorasi (nama_barang, kategori, stok, satuan, harga_sewa, kondisi, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [b.nama, b.kategori, b.stok, b.satuan, b.harga, b.kondisi, b.ket]
    );
    console.log(`✅ Barang: ${b.nama}`);
  }

  // ─── Seed Jadwal Sewa ────────────────────────────────────────────────────────
  const jadwalList = [
    {
      penyewa: 'Budi Santoso', hp: '081234567890', acara: 'Pernikahan Budi & Ani',
      mulai: '2024-07-15', selesai: '2024-07-16', lokasi: 'Gedung Serbaguna Makmur',
      status: 'Dikonfirmasi', harga: 5000000, catatan: 'Dekorasi full set'
    },
    {
      penyewa: 'Siti Rahayu', hp: '089876543210', acara: 'Ulang Tahun ke-25',
      mulai: '2024-07-20', selesai: '2024-07-20', lokasi: 'Rumah Pribadi Jl. Melati',
      status: 'Pending', harga: 1500000, catatan: 'Tema pink garden'
    },
    {
      penyewa: 'PT Maju Bersama', hp: '021-5551234', acara: 'Gathering Perusahaan',
      mulai: '2024-08-05', selesai: '2024-08-05', lokasi: 'Hotel Grand Sahid',
      status: 'Dikonfirmasi', harga: 8000000, catatan: null
    }
  ];

  for (const j of jadwalList) {
    await pool.query(
      `INSERT INTO jadwal_sewa (nama_penyewa, no_hp, nama_acara, tanggal_mulai, tanggal_selesai, lokasi, status, total_harga, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [j.penyewa, j.hp, j.acara, j.mulai, j.selesai, j.lokasi, j.status, j.harga, j.catatan]
    );
    console.log(`✅ Jadwal: ${j.acara}`);
  }

  console.log('\n🎉 Seeding selesai! Database sudah terisi data awal.');
  console.log('\n📝 Gunakan akun berikut untuk login:');
  console.log('   Admin → email: admin@yoja.com  | password: admin123');
  console.log('   Staff → email: staff@yoja.com  | password: staff123');

  await pool.end();
};

seed().catch(err => {
  console.error('❌ Seeding gagal:', err);
  process.exit(1);
});
