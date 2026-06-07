// =============================================
// api.js - Konfigurasi & Helper untuk Fetch API
// =============================================

// BASE_URL otomatis menyesuaikan environment:
// - Lokal (localhost): pakai http://localhost:3000/api
// - Production (Vercel): pakai /api (relative URL, domain sama)
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

/**
 * Helper function untuk fetch dengan JWT token.
 *
 * @param {string} endpoint   - Contoh: '/barang' atau '/jadwal/5'
 * @param {string} method     - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} body       - Data yang dikirim (untuk POST/PUT)
 * @returns {Promise<object>} - Response JSON dari server
 */
async function apiFetch(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  // Jika token expired/invalid, paksa logout
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  return data;
}
