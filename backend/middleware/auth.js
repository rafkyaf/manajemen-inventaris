// =============================================
// middleware/auth.js - Middleware Verifikasi JWT
// =============================================
// File ini berisi fungsi yang dijalankan SEBELUM handler route.
// Tugasnya: memeriksa apakah request punya token JWT yang valid.

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization
  // Format header: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.'
    });
  }

  // Pisahkan "Bearer" dari token-nya
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Format token salah. Gunakan format: Bearer <token>'
    });
  }

  try {
    // Verifikasi token menggunakan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user dari token ke dalam req.user
    // supaya bisa diakses di route handler
    req.user = decoded;

    next(); // Lanjut ke handler berikutnya
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.'
    });
  }
};

module.exports = verifyToken;
