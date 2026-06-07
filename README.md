# 🌸 Yoja Dekorasi – Sistem Manajemen Inventaris

Aplikasi full-stack untuk manajemen inventaris dan penjadwalan tim dekorasi Yoja Dekorasi.

## 📁 Struktur Proyek

```
manajemen-inventaris/
├── backend/               ← Express.js API
│   ├── middleware/
│   │   └── auth.js        ← Middleware JWT
│   ├── routes/
│   │   ├── auth.js        ← Login & Register
│   │   ├── barang.js      ← CRUD Barang
│   │   └── jadwal.js      ← CRUD Jadwal
│   ├── database.js        ← Setup SQLite
│   ├── server.js          ← Entry point
│   ├── seed.js            ← Data awal
│   ├── .env               ← Konfigurasi
│   └── package.json
│
└── frontend/              ← HTML/CSS/JS Murni
    ├── css/
    │   ├── style.css      ← Style dashboard
    │   └── login.css      ← Style halaman login
    ├── js/
    │   ├── api.js         ← Helper fetch + BASE_URL
    │   └── dashboard.js   ← Logika dashboard CRUD
    ├── login.html         ← Halaman login/register
    ├── dashboard.html     ← Halaman dashboard utama
    └── vercel.json        ← Konfigurasi Vercel
```

---

## 🚀 Cara Menjalankan Lokal

### 1. Jalankan Backend

```bash
cd backend
npm install
node seed.js    # Isi data awal (jalankan SEKALI SAJA)
npm run dev     # Jalankan server dengan auto-reload
```

Server berjalan di: `http://localhost:3000`

### 2. Buka Frontend

Buka file `frontend/login.html` langsung di browser, atau gunakan extension **Live Server** di VS Code.

### 3. Login

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@yoja.com     | admin123   |
| Staff | staff@yoja.com     | staff123   |

---

## 🔌 Daftar Endpoint API

### Auth
| Method | Endpoint              | Deskripsi          | Auth?  |
|--------|-----------------------|--------------------|--------|
| POST   | `/api/auth/register`  | Daftar akun baru   | ❌     |
| POST   | `/api/auth/login`     | Login → dapat token| ❌     |
| GET    | `/api/auth/profile`   | Lihat profil       | ✅ JWT |

### Barang Dekorasi
| Method | Endpoint           | Deskripsi             | Auth?  |
|--------|--------------------|-----------------------|--------|
| GET    | `/api/barang`      | Ambil semua barang    | ✅ JWT |
| GET    | `/api/barang/:id`  | Ambil satu barang     | ✅ JWT |
| POST   | `/api/barang`      | Tambah barang baru    | ✅ JWT |
| PUT    | `/api/barang/:id`  | Update barang         | ✅ JWT |
| DELETE | `/api/barang/:id`  | Hapus barang          | ✅ JWT |

Query params GET semua: `?search=backdrop&kategori=Backdrop`

### Jadwal Sewa
| Method | Endpoint           | Deskripsi             | Auth?  |
|--------|--------------------|-----------------------|--------|
| GET    | `/api/jadwal`      | Ambil semua jadwal    | ✅ JWT |
| GET    | `/api/jadwal/:id`  | Ambil satu jadwal     | ✅ JWT |
| POST   | `/api/jadwal`      | Tambah jadwal baru    | ✅ JWT |
| PUT    | `/api/jadwal/:id`  | Update jadwal         | ✅ JWT |
| DELETE | `/api/jadwal/:id`  | Hapus jadwal          | ✅ JWT |

Query params GET semua: `?status=Pending&search=budi`

---

## ☁️ Panduan Deploy

### Backend → Render.com

1. Buat akun di [render.com](https://render.com)
2. Push folder `backend/` ke GitHub repository baru
3. Di Render, klik **"New Web Service"** → hubungkan repository
4. Isi konfigurasi:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Tambahkan **Environment Variable**:
   - `JWT_SECRET` = `ganti_dengan_secret_acak_panjang`
   - `NODE_ENV` = `production`
6. Klik **Deploy** → tunggu build selesai
7. **Catatan penting**: Render free tier menggunakan filesystem sementara, jadi database SQLite akan **reset saat deploy ulang**. Untuk production, pertimbangkan migrasi ke PostgreSQL (Render menyediakan gratis).

### Frontend → Vercel

1. Buat akun di [vercel.com](https://vercel.com)
2. Push folder `frontend/` ke GitHub repository baru
3. Di Vercel, klik **"New Project"** → hubungkan repository
4. Biarkan semua setting default (Vercel otomatis deteksi HTML statis)
5. Klik **Deploy**

### Menghubungkan Frontend ke Backend yang Sudah Di-deploy

Setelah backend berhasil deploy, salin URL-nya (contoh: `https://yoja-api.onrender.com`).

Buka file `frontend/js/api.js` dan ganti baris:
```js
// Sebelum:
const BASE_URL = 'http://localhost:3000/api';

// Sesudah:
const BASE_URL = 'https://yoja-api.onrender.com/api';
```

Kemudian push perubahan ini ke GitHub. Vercel akan otomatis redeploy.

---

## 🛠️ Teknologi yang Digunakan

| Layer    | Teknologi                        |
|----------|----------------------------------|
| Backend  | Node.js + Express.js             |
| Database | SQLite (via better-sqlite3)      |
| Auth     | JWT (jsonwebtoken) + bcryptjs    |
| Frontend | HTML5 + CSS3 + Vanilla JavaScript|
| Deploy   | Render (backend) + Vercel (frontend) |
