# Skenario 01: Pendaftaran Akun Baru (Register)

## Status
❌ FAIL

## Deskripsi
Pengujian alur pendaftaran akun pengguna baru secara komprehensif, mencakup pengisian form di aplikasi mobile, validasi format field, pembuatan dompet (wallet Rp 0), pencegahan duplikasi email/username, serta inisialisasi level keamanan akun (Level 1).

## Parameter Uji (Test Data)
- **Nama Lengkap**: `QA User <timestamp>`
- **Username**: `user_<random_id>` (alphanumeric, min 3 karakter)
- **Email**: `user_<random_id>@bukainjalan.test`
- **Password**: `Password123!` (kombinasi huruf besar, kecil, angka, simbol)

## Langkah Pengujian (Steps)
1. **Buka Aplikasi**: Masuk ke Beranda aplikasi BukainJalan.
2. **Navigasi ke Auth**: Tap tab *Profil* -> Bottom Sheet ajakan daftar muncul -> Tap *Daftar dengan Email*.
3. **Validasi Form Kosong**: Cek pesan error jika tombol ditekan saat form belum diisi.
4. **Input Data Valid**: Masukkan Nama Lengkap, Username, Email, Password, Konfirmasi Password.
5. **Checkbox Persetujuan**: Centang persetujuan Syarat & Ketentuan serta Kebijakan Privasi.
6. **Submit**: Tekan tombol *Daftar Sekarang*.
7. **Verifikasi Output**:
   - Akun terbentuk di database dengan ID valid.
   - Dompet (Wallet) diinisialisasi dengan saldo `Rp 0`.
   - Access token JWT langsung diterbitkan atau user diarahkan ke login.
   - Negative test: Pendaftaran ulang dengan email yang sama harus ditolak (409 Conflict).

## Hasil yang Diharapkan (Expected Results)
- Registrasi berhasil tanpa error 500.
- Durasi respon API pendaftaran < 500ms.
- Integritas data profil dan wallet terjamin secara atomik.


### Catatan Eksekusi Terakhir (10/10/2026, 12.55.50 WIB)
- [FAIL] Fatal Error Pengujian Register: fetch failed