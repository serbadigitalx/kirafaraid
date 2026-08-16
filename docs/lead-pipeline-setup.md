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
- `CRON_SECRET` (pilihan, lihat bahagian 7)

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
8. Pastikan `curl https://www.kirafaraid.my/api/health` memulangkan `{"ok":true}`.

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

## 6. Elak projek Supabase dijeda

Supabase pelan percuma menjeda projek selepas kira-kira 7 hari tanpa aktiviti. Apabila
dijeda, hos API berhenti menjawab. Dashboard lead memaparkan
`Senarai lead tidak dapat dimuatkan.` dan borang konsultasi awam turut gagal. Data
tersimpan tidak hilang; projek perlu dipulihkan dari
Supabase Dashboard > Restore project.

Dua ketukan harian ke `/api/health` menghalang jedaan itu. Kedua-duanya sengaja
digandakan kerana ia gagal secara berasingan:

- `vercel.json` mengandungi entri `crons`. **Sahkan** ia benar-benar berdaftar di
  Vercel Dashboard > Project > Cron Jobs selepas deployment. Adapter Astro menjana
  konfigurasi Build Output API sendiri, jadi `crons` dalam `vercel.json` tidak dijamin
  diguna pakai.
- `.github/workflows/supabase-keep-alive.yml` melakukan perkara sama dari GitHub
  Actions dan menghantar notifikasi apabila ketukan gagal. GitHub melumpuhkan jadual
  ini selepas 60 hari repositori tidak aktif, jadi semak semula sekali-sekala.

Jika `CRON_SECRET` ditetapkan di Vercel, `/api/health` memerlukan
`Authorization: Bearer <CRON_SECRET>`. Vercel Cron menghantar header itu secara
automatik. Untuk GitHub Actions, simpan nilai sama sebagai repository secret bernama
`CRON_SECRET`. Biarkan kosong jika anda mahu health check terbuka.

Pelan Supabase Pro membuang auto-pause sepenuhnya dan merupakan penyelesaian kekal
bagi sistem yang menyimpan lead pelanggan sebenar.

## 7. Pemulihan lead semasa gangguan

Jika penyimpanan gagal, `POST /api/leads` memulangkan 503 kepada pengguna dan
merekodkan butiran lead ke log Vercel sebagai satu baris bermula dengan
`LEAD_SAVE_FAILED`. Baris itu ialah satu-satunya salinan yang tinggal.

Cari `LEAD_SAVE_FAILED` di Vercel > Logs, ambil JSON selepas awalan itu, dan masukkan
semula rekod secara manual selepas pangkalan data pulih. Log Vercel mempunyai tempoh
simpanan terhad, jadi buat pemulihan secepat mungkin selepas gangguan.

## 8. Operasi berkala

- Semak lead baharu dan susulan setiap hari bekerja.
- Semak `/api/health` dan status projek Supabase jika dashboard memaparkan ralat.
- Semak akaun dashboard apabila ahli kerjasama berubah.
- Padam atau nyahpengenalan rekod yang tidak lagi diperlukan.
- Putar rahsia sesi dan hash jika disyaki terdedah.
- Jangan eksport spreadsheet kecuali perlu. Jika dieksport, lindungi fail dan padam selepas digunakan.
