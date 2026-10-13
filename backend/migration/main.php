<?php
// Pastikan file koneksi dan fungsi pendukung sudah dipanggil
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// Di hosting cloud database sudah disediakan, jadi kegagalan di sini diabaikan
try {
    $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
} catch (mysqli_sql_exception $e) {
    // lanjut saja
}

// 1. Pilih Database
$conn->select_db(DB_NAME);

// 2. Tabel Users
$sql = 'CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(255) NOT NULL UNIQUE,
 email VARCHAR(255) NOT NULL UNIQUE,
 `password` VARCHAR(255) NOT NULL,
 nama_lengkap VARCHAR(255) NOT NULL,
 nomor_hp VARCHAR(255) NOT NULL,
 foto VARCHAR(255) NOT NULL,
 token VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Users Table Checked/Created');

// 3. Tabel Riwayat Pendidikan
$sql = 'CREATE TABLE IF NOT EXISTS riwayat_pendidikan (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nama_institusi VARCHAR(255) NOT NULL,
 tingkat VARCHAR(255) NOT NULL,
 jurusan VARCHAR(255) NOT NULL,
 tahun_mulai INT NOT NULL,
 tahun_selesai INT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Riwayat Pendidikan Table Checked/Created');

// 4. Tabel Pengalaman
$sql = 'CREATE TABLE IF NOT EXISTS pengalaman (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nama_perusahaan VARCHAR(255) NOT NULL,
 jabatan VARCHAR(255) NOT NULL,
 tahun_mulai INT NOT NULL,
 tahun_selesai INT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Pengalaman Table Checked/Created');

// 5. Tabel Kontak Aktif
$sql = 'CREATE TABLE IF NOT EXISTS kontak_aktif (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nama_media VARCHAR(255) NOT NULL,
 url VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Kontak Aktif Table Checked/Created');

// 6. Tabel Keahlian
$sql = 'CREATE TABLE IF NOT EXISTS keahlian (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nama_keahlian VARCHAR(255) NOT NULL,
 level VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Keahlian Table Checked/Created');

// 7. Tabel Karya Terbaik
$sql = 'CREATE TABLE IF NOT EXISTS karya_terbaik (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nama_karya VARCHAR(255) NOT NULL,
 deskripsi TEXT NOT NULL,
 url VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
executeQuery($sql, 'Karya Terbaik Table Checked/Created');

// 8. Seeding Akun Default Admin (Hanya dimasukkan jika admin belum ada)
$checkAdmin =$conn->query("SELECT id FROM users WHERE username = 'admin'");
if ($checkAdmin &&$checkAdmin->num_rows === 0) {
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);$sql = "INSERT INTO users (username, email, password, nama_lengkap, nomor_hp, foto)
     VALUES ('admin', 'admin@example.com', '$hashedPassword', 'Administrator', '081234567890', 'default.png')";
    executeQuery($sql, 'Default User Created');
} else {
    echo "Default User 'admin' sudah ada.<br>";
}

$conn->close();
?>