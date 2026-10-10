# Skenario 02: Masuk Akun & Otentikasi (Login)

## Status
✅ PASS

## Deskripsi
Pengujian alur otentikasi pengguna terdaftar, penerbitan JWT Access Token, validasi sesi ke endpoint terproteksi (`/screens/profile`), serta pengujian ketahanan terhadap percobaan login gagal dengan password salah.

## Parameter Uji (Test Data)
- **Kredensial Valid**: Akun yang terdaftar dari Skenario 01.
- **Kredensial Tidak Valid**: Email terdaftar dengan password salah (`WrongPassword999!`).
- **Target Proteksi**: Header `Authorization: Bearer <token>`.

## Langkah Pengujian (Steps)
1. **Navigasi ke Form Login**: Buka aplikasi -> Tab Profil -> Tap *Masuk*.
2. **Uji Kredensial Salah (Negative Test)**:
   - Masukkan email terdaftar dan password salah.
   - Verifikasi munculnya pesan error user-friendly (*Email atau password salah*) tanpa membocorkan eksistensi akun.
3. **Uji Kredensial Valid (Happy Path)**:
   - Masukkan email dan password yang sesuai.
   - Tekan tombol *Masuk Sekarang*.
4. **Verifikasi Output**:
   - Respon API mengembalikan HTTP 200 dengan `accessToken`.
   - Token dapat digunakan untuk mengakses endpoint profil dan saldo dompet.
   - Session tersimpan pada Secure Storage perangkat mobile.

## Hasil yang Diharapkan (Expected Results)
- Waktu proses otentikasi login < 300ms.
- Sesi pengguna valid dan tidak kedaluwarsa sebelum waktunya.
- User langsung diarahkan ke layar Beranda/Profil aktif dengan data yang sesuai.


### Catatan Eksekusi Terakhir (10/10/2026, 13.04.57 WIB)
- [PASS] Penolakan Password Salah: Berhasil ditolak dengan kode 401: Kredensial tidak valid
- [PASS] Otentikasi Login Valid: Token JWT berhasil diterbitkan (eyJhbGciOiJIUzI1NiIs...)
- [PASS] Verifikasi Token pada Rute Terproteksi: Token berhasil mengakses layout profil terproteksi