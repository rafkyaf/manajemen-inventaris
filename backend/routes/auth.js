// =============================================
// routes/auth.js - Route Login & Register (PostgreSQL)
// =============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database');

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const result = await pool.query(
      'INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role',
      [nama, email, hashedPassword, role || 'staff']
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    // Cari user berdasarkan email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        user: { id: user.id, nama: user.nama, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ─── GET /api/auth/profile ────────────────────────────────────────────────────
const verifyToken = require('../middleware/auth');
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nama, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error profile:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
