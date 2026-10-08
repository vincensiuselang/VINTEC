# Setup halaman /admin

Halaman admin ada di `vintec.tech/admin`. Isinya jumlah pengunjung, klik per link, sumber traffic, sama grafik harian. Datanya disimpen di Supabase.

## 1. Bikin tabel di Supabase

1. Buka project Supabase, masuk ke **SQL Editor**, klik **New query**.
2. Copy semua isi `supabase/schema.sql`, paste, terus **Run**.
3. File ini aman dijalanin ulang kalau nanti ada update.

## 2. Bikin akun admin

1. Masuk ke **Authentication > Users > Add user > Create new user**.
2. Isi email `vincensiuselang@gmail.com` dan password, terus centang **Auto Confirm User**.
3. Masuk ke **Authentication > Sign In / Providers**, matiin **Allow new users to sign up**. Orang lain tetap gak bisa baca data walaupun bikin akun, tapi mending ditutup sekalian.

Mau nambah admin lain? Bikin user-nya, terus jalanin ini di SQL Editor:

```sql
insert into public.admin_users (email) values ('email@lain.com');
```

## 3. Isi .env

1. Copy `.env.example` jadi `.env`.
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari **Project Settings > API**.
3. Pakai key **anon** (publishable). Jangan pernah pakai key `service_role`.

## 4. Tes lokal

```bash
npm run dev
```

1. Buka `localhost:3000`, klik beberapa link.
2. Buka `localhost:3000/admin`, login, dan angkanya harusnya udah muncul.

Catatan: browser yang pernah login ke /admin otomatis gak dihitung lagi, jadi tes klik-nya pakai jendela incognito. Pengaturannya ada di checkbox paling bawah halaman admin.

## 5. Deploy ke Hostinger

```bash
npm run build
```

1. Upload semua isi folder `dist` ke `public_html`, termasuk `admin.html` dan `.htaccess`.
2. `.htaccess` itu file tersembunyi. Di File Manager Hostinger, nyalain **Show hidden files** dulu biar keliatan.
3. Kalau di `public_html` udah ada `.htaccess`, jangan ditimpa. Tambahin isinya aja ke file yang lama.

`.env` dibaca pas build, jadi setiap ganti isi `.env` harus build ulang.

## Cara baca angkanya

- **Pengunjung unik** dihitung per browser, bukan per orang. Satu orang yang buka dari HP dan laptop kehitung 2. In-app browser TikTok kadang ngehapus storage, jadi angkanya bisa sedikit lebih tinggi dari aslinya.
- **Conversion** = persen pengunjung yang klik minimal satu link.
- **Sumber** kebaca otomatis dari in-app browser TikTok/IG/FB. Kalau mau lebih detail, misalnya bio TikTok vs link di caption YouTube, pakai link kayak `vintec.tech/?utm_source=youtube`.
- Counter "visitors" di pojok kanan atas website masih pakai abacus, terpisah dari data admin ini.
