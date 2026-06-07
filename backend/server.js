// =============================================
// server.js - Entry Point Backend API
// =============================================
// Di Vercel: hanya melayani /api/* routes
// Static files (HTML/CSS/JS) dilayani langsung oleh Vercel via vercel.json
// Di Lokal: juga melayani static files dari folder frontend

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Global ────────────────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Static Files: hanya aktif saat development lokal
// Di Vercel, static files dilayani via vercel.json (@vercel/static)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('/', (req, res) => res.redirect('/login.html'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));
app.use('/api/barang', require('./routes/barang'));
app.use('/api/jadwal', require('./routes/jadwal'));

// ─── Handler 404 untuk API ────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} tidak ditemukan.`
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server.'
  });
});

// ─── Jalankan Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
