<?php
// backend/library/dbconnection.php
// Konfigurasi dibaca dari environment variable (produksi),
// dengan nilai default untuk localhost.
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_NAME', getenv('DB_NAME') ?: 'portofolio');
define('DB_PORT', (int) (getenv('DB_PORT') ?: 3306));

$conn = mysqli_init();
$flags = 0;
if (getenv('DB_SSL') === '1') {
    // Wajib untuk TiDB Cloud / Aiven
    $conn->ssl_set(null, null, null, null, null);
    $flags = MYSQLI_CLIENT_SSL;
}

try {
    $conn->real_connect(DB_HOST, DB_USER, DB_PASS, null, DB_PORT, null, $flags);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    die(json_encode(['status' => 'error', 'message' => 'Koneksi database gagal']));
}

// Coba memilih database target
try {
    $conn->select_db(DB_NAME);
} catch (mysqli_sql_exception $e) {
    // Database belum ada (normal saat migrasi pertama kali)
}
