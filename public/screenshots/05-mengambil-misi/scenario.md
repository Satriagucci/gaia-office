# Skenario 05: Mengambil Misi oleh Talent (Take Mission / Create Order)

## Status
✅ PASS

## Deskripsi
Pengujian alur pengambilan misi oleh Talent terverifikasi (Mitra Kerja). Meliputi verifikasi syarat kelayakan KYC Level 3 (KTP, Selfie, Email, Phone), pencarian misi terbuka pada radar/feed, proses klaim misi via `POST /orders/protected/mission/:id/take`, pembentukan Order dengan status `TAKEN`, dan pengurangan kuota pekerja yang dibutuhkan (*workersNeeded*).

## Parameter Uji (Test Data)
- **Talent**: Pengguna dengan status `KYC Level 3 • VERIFIED`
- **Target Misi**: Misi berstatus `OPEN` dengan escrow yang sudah dibayar dari Skenario 04
- **Bid / Penawaran**: Sesuai reward misi atau custom bid amount

## Langkah Pengujian (Steps)
1. **Verifikasi Hak Akses Talent**:
   - Memastikan Talent telah terverifikasi penuh (Level 3 KYC).
   - Negative Test: Akun Level 1 atau belum KYC harus diblokir dengan HTTP 403 (*KYC verification required*).
2. **Eksplorasi Misi Aktif**:
   - Talent membuka tab *Misi* atau *Peta Radar*.
   - Memilih misi yang terbuka dan memiliki sisa slot pekerja.
3. **Klaim / Ambil Misi**:
   - Tekan tombol *Ambil Misi Ini*.
   - Kirim `POST /orders/protected/mission/:missionId/take`.
4. **Verifikasi Output**:
   - Record Order terbentuk di database dengan ID UUID.
   - Status Order adalah `TAKEN`.
   - Kuota sisa pekerja misi berkurang.
   - Order muncul di tab *Aktivitas / Order Saya* milik Talent (`/orders/me`).
   - Misi berpindah status jika seluruh slot pekerja telah terpenuhi.

## Hasil yang Diharapkan (Expected Results)
- Transaksi pengambilan misi aman dari *race condition* (optimistic concurrency control).
- Talent menerima konfirmasi penugasan resmi dengan instruksi kerja dan kontak darurat.
- Dana escrow tetap terkunci aman hingga pekerjaan diselesaikan dan disetujui.


### Catatan Eksekusi Terakhir (10/10/2026, 13.05.05 WIB)
- [PASS] Proteksi KYC Level 3 (Blokir User Non-KYC): Berhasil ditolak dengan kode 403: KYC verification required (Level 3).
- [PASS] Promosi Kelayakan Talent ke Level 3 • VERIFIED: Talent resmi berstatus Level 3 (VERIFIED)
- [PASS] Pengambilan Misi Resmi oleh Talent (Order Created): Order ID: de9c6e2a-aea3-4a65-b15f-d9199035876c, Status: TAKEN, BidAmount: Rp default
- [PASS] Verifikasi Riwayat Pekerjaan Aktif Talent (/orders/me): Order aktif terdaftar pada workspace pekerjaan talent