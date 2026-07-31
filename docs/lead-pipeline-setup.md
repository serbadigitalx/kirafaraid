# Persediaan Lead Pipeline KiraFaraid

Sistem ini menggunakan halaman Astro statik untuk kandungan awam, fungsi Vercel untuk API, dan Supabase Postgres untuk penyimpanan lead peribadi.

## 1. Sediakan Supabase

1. Cipta projek Supabase untuk KiraFaraid.
2. Pilih lokasi data yang sesuai selepas menilai keperluan privasi dan pemindahan data anda.
3. Jalankan migrasi `supabase/migrations/20260731100000_create_lead_pipeline.sql` menggunakan Supabase CLI atau SQL Editor.
4. Ambil Project URL dan secret key (`sb_secret_...`) dari Settings > API Keys. Secret key hanya boleh digunakan di Vercel, bukan dalam pemboleh ubah `PUBLIC_*`.

RLS diaktifkan pada kedua-dua jadual. Tiada polisi awam dicipta. Hanya API pelayan yang menggunakan `service_role` boleh membaca atau mengubah rekod.

## 2. Cipta akaun dashboard

Jana hash kata laluan berasingan untuk setiap pengguna:

```bash
npm run leads:hash-password -- "kata-laluan-yang-panjang"
```

Masukkan output ke dalam `LEADS_DASHBOARD_USERS`. Gunakan satu identiti bagi setiap orang supaya sejarah perubahan menunjukkan pelaku sebenar.

Contoh struktur:

```json
[
  {
    "username": "afiq",
    "name": "Afiq",
    "role": "owner",
    "passwordHash": "salt:210000:hash"
  },
  {
    "username": "pakar",
    "name": "Nama Pakar",
    "role": "partner",
    "passwordHash": "salt:210000:hash"
  }
]
```

## 3. Tetapkan pemboleh ubah Vercel

Salin setiap nama daripada `.env.example` ke Project Settings > Environment Variables di Vercel:

- `PUBLIC_LEAD_PARTNER_NAME`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `LEADS_HASH_SECRET`
- `LEADS_SESSION_SECRET`
- `LEADS_DASHBOARD_USERS`

Jana dua rahsia berbeza dengan sekurang-kurangnya 32 aksara. Selepas mengubah mana-mana pemboleh ubah, buat deployment baharu.

`PUBLIC_LEAD_PARTNER_NAME` mesti menggunakan nama sebenar orang atau organisasi yang menerima lead. Nama ini dipaparkan dalam persetujuan pengguna dan Dasar Privasi.

## 4. Uji sebelum pelancaran

1. Hantar satu borang konsultasi dari keputusan kalkulator.
2. Pastikan nombor rujukan dipaparkan.
3. Log masuk di `/partner/leads` menggunakan kedua-dua akaun.
4. Tukar status, tetapkan tarikh susulan dan tambah nota dalaman.
5. Pastikan sejarah aktiviti menunjukkan pengguna yang membuat perubahan.
6. Uji pautan telefon, WhatsApp dan e-mel.
7. Pastikan pengguna tanpa sesi menerima respons 401 daripada API dashboard.

## 5. Perjanjian operasi dengan pakar

Catat secara bertulis:

- tujuan lead boleh digunakan;
- siapa yang boleh mengakses data;
- tempoh maksimum untuk hubungan pertama;
- larangan menjual atau berkongsi lead;
- kaedah merekod hasil dan sebab lead ditutup;
- jadual pemadaman rekod;
- tindakan jika berlaku akses tanpa kebenaran;
- asas dan bukti bagi sebarang komisen.

## 6. Operasi berkala

- Semak lead baharu dan susulan setiap hari bekerja.
- Semak akaun dashboard apabila ahli kerjasama berubah.
- Padam atau nyahpengenalan rekod yang tidak lagi diperlukan.
- Putar rahsia sesi dan hash jika disyaki terdedah.
- Jangan eksport spreadsheet kecuali perlu. Jika dieksport, lindungi fail dan padam selepas digunakan.
