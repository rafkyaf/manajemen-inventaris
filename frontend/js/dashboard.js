// =============================================
// dashboard.js - Logika Utama Dashboard
// =============================================
// File ini mengatur: navigasi halaman, CRUD barang & jadwal,
// render tabel, modal, filter/search, dan toast notifikasi.

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Kalau tidak ada token, paksa kembali ke halaman login
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

// ─── Inisialisasi ─────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Tampilkan nama dan role user di sidebar
document.getElementById('sidebar-user-name').textContent = user.nama || 'User';
document.getElementById('sidebar-user-role').textContent = user.role || '-';

// Tampilkan tanggal hari ini di topbar
document.getElementById('current-date').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ─── State (data yang disimpan di memori) ─────────────────────────────────────
let allBarang = [];  // Menyimpan semua data barang dari API
let allJadwal = [];  // Menyimpan semua data jadwal dari API

// ─── NAVIGASI HALAMAN ─────────────────────────────────────────────────────────
/**
 * Tampilkan halaman yang dipilih dan sembunyikan yang lain
 * @param {string} pageName - 'dashboard', 'barang', atau 'jadwal'
 */
function showPage(pageName) {
  // Sembunyikan semua halaman
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Tampilkan halaman yang dipilih
  document.getElementById(`page-${pageName}`).classList.add('active');

  // Update nav item aktif di sidebar
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`nav-${pageName}`).classList.add('active');

  // Update judul topbar
  const titles = {
    dashboard: ['Dashboard', `Halo, ${user.nama}! 👋`],
    barang:    ['Barang Dekorasi', 'Kelola inventaris dekorasi Anda'],
    jadwal:    ['Jadwal Sewa', 'Kelola jadwal penyewaan dekorasi']
  };
  document.getElementById('topbar-title').textContent    = titles[pageName][0];
  document.getElementById('topbar-subtitle').textContent = titles[pageName][1];

  // Muat data sesuai halaman
  if (pageName === 'dashboard') loadDashboard();
  if (pageName === 'barang')    loadBarang();
  if (pageName === 'jadwal')    loadJadwal();
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
function handleLogout() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
/**
 * Tampilkan notifikasi toast di pojok bawah kanan
 * @param {string} msg     - Pesan yang ditampilkan
 * @param {string} type    - 'success', 'error', atau 'warning'
 */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${msg}`;

  container.appendChild(toast);

  // Hapus toast setelah 3 detik
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

// Tutup modal saat klik di luar modal
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('show');
    }
  });
});

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
// Format angka menjadi format Rupiah
function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// Tentukan warna badge berdasarkan status
function getStatusBadge(status) {
  const map = {
    'Dikonfirmasi': 'badge-success',
    'Selesai':      'badge-info',
    'Pending':      'badge-warning',
    'Dibatalkan':   'badge-danger',
  };
  return `<span class="badge ${map[status] || 'badge-secondary'}">${status}</span>`;
}

// Badge kondisi barang
function getKondisiBadge(kondisi) {
  const map = {
    'Baik':         'badge-success',
    'Rusak Ringan': 'badge-warning',
    'Rusak Berat':  'badge-danger',
  };
  return `<span class="badge ${map[kondisi] || 'badge-secondary'}">${kondisi}</span>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    // Ambil data barang dan jadwal secara bersamaan (paralel)
    const [resBarang, resJadwal] = await Promise.all([
      apiFetch('/barang'),
      apiFetch('/jadwal')
    ]);

    const barang = resBarang?.data || [];
    const jadwal = resJadwal?.data || [];

    // Update stats cards
    document.getElementById('stat-total-barang').textContent = barang.length;
    document.getElementById('stat-total-jadwal').textContent = jadwal.length;
    document.getElementById('stat-jadwal-aktif').textContent =
      jadwal.filter(j => j.status === 'Dikonfirmasi').length;
    document.getElementById('stat-jadwal-pending').textContent =
      jadwal.filter(j => j.status === 'Pending').length;

    // Render tabel jadwal terbaru (ambil 5 data pertama)
    renderJadwalDashboard(jadwal.slice(0, 5));
  } catch (err) {
    console.error('Error load dashboard:', err);
  }
}

function renderJadwalDashboard(data) {
  const tbody = document.getElementById('table-jadwal-dashboard');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>Belum ada jadwal</h3>
            <p>Tambahkan jadwal sewa pertama Anda</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(j => `
    <tr>
      <td><strong>${j.nama_penyewa}</strong><br><small style="color:var(--text-muted)">${j.no_hp}</small></td>
      <td>${j.nama_acara}</td>
      <td>${j.tanggal_mulai} s/d ${j.tanggal_selesai}</td>
      <td>${j.lokasi}</td>
      <td>${getStatusBadge(j.status)}</td>
      <td>${formatRupiah(j.total_harga)}</td>
    </tr>
  `).join('');
}

// ═════════════════════════════════════════════════════════════════════════════
// BARANG DEKORASI - CRUD
// ═════════════════════════════════════════════════════════════════════════════

// ── Load & Render Barang ─────────────────────────────────────────────────────
async function loadBarang() {
  try {
    const res = await apiFetch('/barang');
    allBarang = res?.data || [];
    renderTableBarang(allBarang);
  } catch (err) {
    console.error('Error load barang:', err);
    showToast('Gagal memuat data barang', 'error');
  }
}

function renderTableBarang(data) {
  const tbody = document.getElementById('table-barang');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>Tidak ada barang ditemukan</h3>
            <p>Coba ubah filter atau tambahkan barang baru</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((b, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${b.nama_barang}</strong>
        ${b.keterangan ? `<br><small style="color:var(--text-muted)">${b.keterangan}</small>` : ''}
      </td>
      <td><span class="badge badge-secondary">${b.kategori}</span></td>
      <td><strong>${b.stok}</strong> ${b.satuan}</td>
      <td>${formatRupiah(b.harga_sewa)}</td>
      <td>${getKondisiBadge(b.kondisi)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="editBarang(${b.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="deleteBarang(${b.id}, '${b.nama_barang}')" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Filter Barang ─────────────────────────────────────────────────────────────
function filterBarang() {
  const search   = document.getElementById('search-barang').value.toLowerCase();
  const kategori = document.getElementById('filter-kategori').value;

  const filtered = allBarang.filter(b => {
    const matchSearch   = b.nama_barang.toLowerCase().includes(search);
    const matchKategori = !kategori || b.kategori === kategori;
    return matchSearch && matchKategori;
  });

  renderTableBarang(filtered);
}

// ── Buka Modal Tambah Barang ──────────────────────────────────────────────────
function openModalBarang() {
  // Reset form
  document.getElementById('form-barang').reset();
  document.getElementById('barang-id').value = '';
  document.getElementById('modal-barang-title').textContent = 'Tambah Barang';
  openModal('modal-barang');
}

// ── Buka Modal Edit Barang ────────────────────────────────────────────────────
async function editBarang(id) {
  try {
    const res = await apiFetch(`/barang/${id}`);
    const b   = res.data;

    // Isi form dengan data barang yang dipilih
    document.getElementById('barang-id').value         = b.id;
    document.getElementById('barang-nama').value       = b.nama_barang;
    document.getElementById('barang-kategori').value   = b.kategori;
    document.getElementById('barang-stok').value       = b.stok;
    document.getElementById('barang-satuan').value     = b.satuan;
    document.getElementById('barang-harga').value      = b.harga_sewa;
    document.getElementById('barang-kondisi').value    = b.kondisi;
    document.getElementById('barang-keterangan').value = b.keterangan || '';

    document.getElementById('modal-barang-title').textContent = 'Edit Barang';
    openModal('modal-barang');
  } catch (err) {
    showToast('Gagal memuat data barang', 'error');
  }
}

// ── Submit Form Barang (Tambah / Edit) ───────────────────────────────────────
async function submitBarang(e) {
  e.preventDefault();

  const id = document.getElementById('barang-id').value;
  const body = {
    nama_barang: document.getElementById('barang-nama').value,
    kategori:    document.getElementById('barang-kategori').value,
    stok:        parseInt(document.getElementById('barang-stok').value) || 0,
    satuan:      document.getElementById('barang-satuan').value,
    harga_sewa:  parseFloat(document.getElementById('barang-harga').value) || 0,
    kondisi:     document.getElementById('barang-kondisi').value,
    keterangan:  document.getElementById('barang-keterangan').value,
  };

  const btn = document.getElementById('btn-submit-barang');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span>';

  try {
    let res;
    if (id) {
      // Ada ID = mode edit (PUT)
      res = await apiFetch(`/barang/${id}`, 'PUT', body);
    } else {
      // Tidak ada ID = mode tambah (POST)
      res = await apiFetch('/barang', 'POST', body);
    }

    if (res?.success) {
      closeModal('modal-barang');
      showToast(res.message, 'success');
      loadBarang(); // Reload tabel
    } else {
      showToast(res?.message || 'Gagal menyimpan data', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan. Coba lagi.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Simpan';
  }
}

// ── Hapus Barang ──────────────────────────────────────────────────────────────
async function deleteBarang(id, nama) {
  if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;

  try {
    const res = await apiFetch(`/barang/${id}`, 'DELETE');
    if (res?.success) {
      showToast('Barang berhasil dihapus', 'success');
      loadBarang();
    } else {
      showToast(res?.message || 'Gagal menghapus', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan', 'error');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// JADWAL SEWA - CRUD
// ═════════════════════════════════════════════════════════════════════════════

// ── Load & Render Jadwal ──────────────────────────────────────────────────────
async function loadJadwal() {
  try {
    const res = await apiFetch('/jadwal');
    allJadwal = res?.data || [];
    renderTableJadwal(allJadwal);
  } catch (err) {
    showToast('Gagal memuat data jadwal', 'error');
  }
}

function renderTableJadwal(data) {
  const tbody = document.getElementById('table-jadwal');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>Tidak ada jadwal ditemukan</h3>
            <p>Tambahkan jadwal sewa baru</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((j, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${j.nama_penyewa}</strong><br>
        <small style="color:var(--text-muted)">${j.no_hp}</small>
      </td>
      <td>${j.nama_acara}</td>
      <td>
        <small>${j.tanggal_mulai}</small><br>
        <small style="color:var(--text-muted)">s/d ${j.tanggal_selesai}</small>
      </td>
      <td>${j.lokasi}</td>
      <td>${getStatusBadge(j.status)}</td>
      <td>${formatRupiah(j.total_harga)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="editJadwal(${j.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="deleteJadwal(${j.id}, '${j.nama_acara}')" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Filter Jadwal ─────────────────────────────────────────────────────────────
function filterJadwal() {
  const search = document.getElementById('search-jadwal').value.toLowerCase();
  const status = document.getElementById('filter-status').value;

  const filtered = allJadwal.filter(j => {
    const matchSearch = j.nama_penyewa.toLowerCase().includes(search) ||
                        j.nama_acara.toLowerCase().includes(search);
    const matchStatus = !status || j.status === status;
    return matchSearch && matchStatus;
  });

  renderTableJadwal(filtered);
}

// ── Buka Modal Tambah Jadwal ──────────────────────────────────────────────────
function openModalJadwal() {
  document.getElementById('form-jadwal').reset();
  document.getElementById('jadwal-id').value = '';
  document.getElementById('modal-jadwal-title').textContent = 'Tambah Jadwal';
  openModal('modal-jadwal');
}

// ── Buka Modal Edit Jadwal ────────────────────────────────────────────────────
async function editJadwal(id) {
  try {
    const res = await apiFetch(`/jadwal/${id}`);
    const j   = res.data;

    document.getElementById('jadwal-id').value       = j.id;
    document.getElementById('jadwal-penyewa').value  = j.nama_penyewa;
    document.getElementById('jadwal-hp').value       = j.no_hp;
    document.getElementById('jadwal-acara').value    = j.nama_acara;
    document.getElementById('jadwal-mulai').value    = j.tanggal_mulai;
    document.getElementById('jadwal-selesai').value  = j.tanggal_selesai;
    document.getElementById('jadwal-lokasi').value   = j.lokasi;
    document.getElementById('jadwal-status').value   = j.status;
    document.getElementById('jadwal-harga').value    = j.total_harga;
    document.getElementById('jadwal-catatan').value  = j.catatan || '';

    document.getElementById('modal-jadwal-title').textContent = 'Edit Jadwal';
    openModal('modal-jadwal');
  } catch (err) {
    showToast('Gagal memuat data jadwal', 'error');
  }
}

// ── Submit Form Jadwal (Tambah / Edit) ────────────────────────────────────────
async function submitJadwal(e) {
  e.preventDefault();

  const id = document.getElementById('jadwal-id').value;
  const body = {
    nama_penyewa:    document.getElementById('jadwal-penyewa').value,
    no_hp:           document.getElementById('jadwal-hp').value,
    nama_acara:      document.getElementById('jadwal-acara').value,
    tanggal_mulai:   document.getElementById('jadwal-mulai').value,
    tanggal_selesai: document.getElementById('jadwal-selesai').value,
    lokasi:          document.getElementById('jadwal-lokasi').value,
    status:          document.getElementById('jadwal-status').value,
    total_harga:     parseFloat(document.getElementById('jadwal-harga').value) || 0,
    catatan:         document.getElementById('jadwal-catatan').value,
  };

  const btn = document.getElementById('btn-submit-jadwal');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span>';

  try {
    let res;
    if (id) {
      res = await apiFetch(`/jadwal/${id}`, 'PUT', body);
    } else {
      res = await apiFetch('/jadwal', 'POST', body);
    }

    if (res?.success) {
      closeModal('modal-jadwal');
      showToast(res.message, 'success');
      loadJadwal();
      // Refresh dashboard stats juga
      loadDashboard();
    } else {
      showToast(res?.message || 'Gagal menyimpan data', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan. Coba lagi.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Simpan';
  }
}

// ── Hapus Jadwal ──────────────────────────────────────────────────────────────
async function deleteJadwal(id, nama) {
  if (!confirm(`Yakin ingin menghapus jadwal "${nama}"?`)) return;

  try {
    const res = await apiFetch(`/jadwal/${id}`, 'DELETE');
    if (res?.success) {
      showToast('Jadwal berhasil dihapus', 'success');
      loadJadwal();
    } else {
      showToast(res?.message || 'Gagal menghapus', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan', 'error');
  }
}

// ─── Inisialisasi Halaman ─────────────────────────────────────────────────────
// Muat dashboard saat pertama kali dibuka
loadDashboard();
