// =============================================
// routes/jadwal.js - CRUD Jadwal Sewa (PostgreSQL)
// =============================================

const express = require('express');
const router = express.Router();
const pool = require('../database');
const verifyToken = require('../middleware/auth');

// Semua route butuh JWT token
router.use(verifyToken);

// ─── GET /api/jadwal ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM jadwal_sewa WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (nama_penyewa ILIKE $${paramIndex} OR nama_acara ILIKE $${paramIndex + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    query += ' ORDER BY tanggal_mulai ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get jadwal:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jadwal.' });
  }
});

// ─── GET /api/jadwal/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jadwal_sewa WHERE id = $1',
      [req.params.id]
    );
    const jadwal = result.rows[0];

    if (!jadwal) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    res.json({ success: true, data: jadwal });
  } catch (error) {
    console.error('Error get jadwal by id:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jadwal.' });
  }
});

// ─── POST /api/jadwal ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      nama_penyewa, no_hp, nama_acara,
      tanggal_mulai, tanggal_selesai,
      lokasi, status, total_harga, catatan
    } = req.body;

    if (!nama_penyewa || !no_hp || !nama_acara || !tanggal_mulai || !tanggal_selesai || !lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Nama penyewa, no HP, nama acara, tanggal, dan lokasi wajib diisi.'
      });
    }

    if (new Date(tanggal_mulai) > new Date(tanggal_selesai)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai.'
      });
    }

    const result = await pool.query(
      `INSERT INTO jadwal_sewa
         (nama_penyewa, no_hp, nama_acara, tanggal_mulai, tanggal_selesai, lokasi, status, total_harga, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nama_penyewa, no_hp, nama_acara, tanggal_mulai, tanggal_selesai,
       lokasi, status || 'Pending', total_harga || 0, catatan || null]
    );

    res.status(201).json({
      success: true,
      message: 'Jadwal berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error tambah jadwal:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan jadwal.' });
  }
});

// ─── PUT /api/jadwal/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_penyewa, no_hp, nama_acara,
      tanggal_mulai, tanggal_selesai,
      lokasi, status, total_harga, catatan
    } = req.body;

    const existing = await pool.query('SELECT id FROM jadwal_sewa WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    const result = await pool.query(
      `UPDATE jadwal_sewa
       SET nama_penyewa = $1, no_hp = $2, nama_acara = $3,
           tanggal_mulai = $4, tanggal_selesai = $5,
           lokasi = $6, status = $7, total_harga = $8, catatan = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [nama_penyewa, no_hp, nama_acara, tanggal_mulai, tanggal_selesai,
       lokasi, status, total_harga, catatan || null, id]
    );

    res.json({
      success: true,
      message: 'Jadwal berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error update jadwal:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal.' });
  }
});

// ─── DELETE /api/jadwal/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id FROM jadwal_sewa WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    await pool.query('DELETE FROM jadwal_sewa WHERE id = $1', [id]);

    res.json({ success: true, message: 'Jadwal berhasil dihapus.' });
  } catch (error) {
    console.error('Error hapus jadwal:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal.' });
  }
});

module.exports = router;
