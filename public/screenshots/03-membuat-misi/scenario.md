# Skenario 03: Membuat Misi Baru (Create Mission)

## Status
✅ PASS

## Deskripsi
Pengujian alur pembuatan order/misi baru oleh Client (Pemberi Kerja). Meliputi verifikasi syarat kontak (Level 2 telepon), pemilihan kategori pekerjaan, pengisian deskripsi, penentuan imbalan (reward), perhitungan biaya platform (app fee & escrow), dan status awal misi `AWAITING_PAYMENT`.

## Parameter Uji (Test Data)
- **Judul Misi**: `Bantu Antar Dokumen & Belanja ke Menteng`
- **Deskripsi**: `Perlu bantuan segera antar dokumen penting dari Senayan ke Menteng hari ini sebelum jam 5 sore.`
- **Reward**: `Rp 35.000` (Tier reguler ramah pengguna)
- **Kategori**: `Belanja & Titip` / `Jasa Fisik`
- **Lokasi**: `Jakarta Pusat`
- **Tipe**: On-site (Fisik)

## Langkah Pengujian (Steps)
1. **Verifikasi Kontak Pengguna**:
   - Client melakukan verifikasi nomor HP (OTP Mock: `1234`) untuk memenuhi syarat Level 2 pembukaan misi.
2. **Navigasi ke Form Buat Misi**:
   - Di mobile app tap FAB `+` / tombol *Buat Misi*.
3. **Pengisian Field Wajib**:
   - Input Judul Misi (min 5 karakter).
   - Input Deskripsi (min 10 karakter).
   - Pilih Kategori dari katalog.
   - Tentukan Imbalan (Reward per orang).
4. **Validasi Batasan (Negative Test)**:
   - Cek penolakan reward di bawah batas minimum (`Rp 1.000`).
5. **Submit Misi**:
   - Kirim `POST /missions`.
6. **Verifikasi Output**:
   - Record Misi terbentuk di database dengan ID UUID.
   - Status awal adalah `AWAITING_PAYMENT` dan `paymentStatus: PENDING`.
   - Transaksi topup/escrow tercatat menunggu pembayaran.

## Hasil yang Diharapkan (Expected Results)
- Misi tersimpan secara utuh dan aman di database.
- Perhitungan biaya platform transparan (wage + fee).
- Misi siap dilanjutkan ke tahap pembayaran (Skenario 04).


### Catatan Eksekusi Terakhir (10/10/2026, 13.04.58 WIB)
- [PASS] Verifikasi Nomor Telepon Client (Level 2 Requirement): Nomor telepon berhasil diverifikasi via OTP
- [PASS] Validasi Batas Minimum Reward (< Rp 1.000): Berhasil diblokir sistem validasi (HTTP 422)
- [PASS] Pembuatan Misi Baru oleh Client: Misi ID: 42e32c74-a9ab-46e1-be47-38a367bd8611, Status: AWAITING_PAYMENT, PaymentStatus: PENDING
- [PASS] Integritas Status Awal (AWAITING_PAYMENT): Misi terkunci dalam status pending payment sebelum escrow didanai