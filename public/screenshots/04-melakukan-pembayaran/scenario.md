# Skenario 04: Melakukan Pembayaran Escrow (Payment)

## Status
✅ PASS

## Deskripsi
Pengujian siklus pembayaran pendanaan jaminan (Escrow Deposit) untuk misi yang dibuat oleh Client. Meliputi pembuatan dynamic QRIS, pembentukan nomor Virtual Account (BCA/Mandiri/BRI), pemeriksaan status polling real-time (`/payment/check`), serta simulasi pelunasan (instant settlement) yang membuka status misi menjadi `OPEN`.

## Parameter Uji (Test Data)
- **Entity Type**: `mission`
- **Entity ID**: ID Misi dari Skenario 03
- **Metode Pembayaran**: QRIS Dinamis & Virtual Account (BCA)
- **Status Akhir Diharapkan**: `isPaid: true`, `status: OPEN`, `paymentStatus: SUCCESS`

## Langkah Pengujian (Steps)
1. **Generate Dynamic QRIS**:
   - Kirim `POST /payment/qris` dengan `entityType: mission` dan `entityId`.
   - Validasi string QRIS EMVCo valid (panjang string, prefix `00020101`, nominal sesuai).
2. **Generate Virtual Account**:
   - Kirim `POST /payment/va` dengan `bankCode: BCA`.
   - Validasi nomor akun dengan prefix bank merchant (`8821...`).
3. **Polling Status Sebelum Bayar**:
   - Panggil `GET /payment/check/mission/:id`.
   - Pastikan flag `isPaid: false` dan `status: AWAITING_PAYMENT`.
4. **Eksekusi Pembayaran / Settlement**:
   - Panggil `POST /payment/simulate-pay` untuk simulasi pelunasan instan.
5. **Verifikasi Output Setelah Bayar**:
   - Panggil kembali polling check: status berubah menjadi `isPaid: true`.
   - Saldo dompet escrow client bertambah secara atomik sesuai nilai jaminan.
   - Status misi berubah menjadi `OPEN`, sehingga sekarang tampil di radar pencarian talent.

## Hasil yang Diharapkan (Expected Results)
- Transaksi escrow terselesaikan secara aman (OCC dan ACID transaction).
- Misi aktif dan siap diambil oleh talent.


### Catatan Eksekusi Terakhir (10/10/2026, 13.05.01 WIB)
- [PASS] Generate Dynamic QRIS (EMVCo Protocol): QRIS String valid (194 chars), Nominal: Rp 36750
- [PASS] Generate Virtual Account BCA: VA Number: 882104636961, Expired: 2026-10-11
- [PASS] Polling Cek Status Pembayaran (Sebelum Bayar): Status Terbaca: isPaid=false, paymentStatus=PENDING
- [PASS] Simulasi Instant Settlement Escrow (Test Mode): Simulasi pembayaran misi berhasil! Escrow telah terisi dan misi dibuka.
- [PASS] Verifikasi Transisi Status Misi (OPEN / isPaid: true): Misi berhasil diaktifkan dengan status: OPEN