// =============================================
// routes/barang.js - CRUD Barang Dekorasi (PostgreSQL)
// =============================================

const express = require('express');
const router = express.Router();
const pool = require('../database');
const verifyToken = require('../middleware/auth');

// Semua route butuh JWT token
router.use(verifyToken);

// ─── GET /api/barang ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, kategori } = req.query;

    let query = 'SELECT * FROM barang_dekorasi WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND nama_barang ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (kategori) {
      query += ` AND kategori = $${paramIndex}`;
      params.push(kategori);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get barang:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data barang.' });
  }
});

// ─── GET /api/barang/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM barang_dekorasi WHERE id = $1',
      [req.params.id]
    );
    const barang = result.rows[0];

    if (!barang) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    res.json({ success: true, data: barang });
  } catch (error) {
    console.error('Error get barang by id:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data barang.' });
  }
});

// ─── POST /api/barang ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nama_barang, kategori, stok, satuan, harga_sewa, kondisi, keterangan } = req.body;

    if (!nama_barang || !kategori) {
      return res.status(400).json({
        success: false,
        message: 'Nama barang dan kategori wajib diisi.'
      });
    }

    const result = await pool.query(
      `INSERT INTO barang_dekorasi (nama_barang, kategori, stok, satuan, harga_sewa, kondisi, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nama_barang, kategori, stok || 0, satuan || 'pcs', harga_sewa || 0, kondisi || 'Baik', keterangan || null]
    );

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error tambah barang:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan barang.' });
  }
});

// ─── PUT /api/barang/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, kategori, stok, satuan, harga_sewa, kondisi, keterangan } = req.body;

    // Cek apakah barang ada
    const existing = await pool.query('SELECT id FROM barang_dekorasi WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    const result = await pool.query(
      `UPDATE barang_dekorasi
       SET nama_barang = $1, kategori = $2, stok = $3, satuan = $4,
           harga_sewa = $5, kondisi = $6, keterangan = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [nama_barang, kategori, stok, satuan, harga_sewa, kondisi, keterangan || null, id]
    );

    res.json({
      success: true,
      message: 'Barang berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error update barang:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui barang.' });
  }
});

// ─── DELETE /api/barang/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id FROM barang_dekorasi WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    await pool.query('DELETE FROM barang_dekorasi WHERE id = $1', [id]);

    res.json({ success: true, message: 'Barang berhasil dihapus.' });
  } catch (error) {
    console.error('Error hapus barang:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus barang.' });
  }
});

module.exports = router;
