<?php
header('X-Test-Version: v2');
// backend/src/public.php

// ===== CORS (harus paling atas, sebelum output apa pun) =====
$allowedOrigins = [
    'https://yusridasihite.vercel.app',
    'http://localhost:5173',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Preflight request: cukup balas OK
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../library/dbconnection.php';

// Hanya menerima metode GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Endpoint public hanya menerima GET']);
    exit;
}

// Kumpulan query untuk tiap bagian portofolio
$queries = [
    'profil' => 'SELECT nama_lengkap, email, nomor_hp, foto FROM users ORDER BY created_at ASC LIMIT 1',
    'riwayat_pendidikan' => 'SELECT nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai FROM riwayat_pendidikan ORDER BY tahun_mulai DESC',
    'pengalaman' => 'SELECT nama_perusahaan, jabatan, tahun_mulai, tahun_selesai FROM pengalaman ORDER BY tahun_mulai DESC',
    'kontak_aktif' => 'SELECT nama_media, url FROM kontak_aktif ORDER BY created_at ASC',
    'keahlian' => 'SELECT id, nama_keahlian, level FROM keahlian ORDER BY id ASC',
    'karya_terbaik' => 'SELECT id, nama_karya, deskripsi, url, gambar FROM karya_terbaik ORDER BY id DESC'
];

$response = [
    'status' => 'success',
    'data' => []
];

// Eksekusi tiap query dan susun hasilnya ke dalam satu array respons
foreach ($queries as $key => $query) {
    $stmt = $conn->prepare($query);
    if (!$stmt || !$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengambil data portofolio']);
        exit;
    }

    $result = $stmt->get_result();
    if ($key === 'profil') {
        $response['data'][$key] = $result->fetch_assoc();
    } else {
        $response['data'][$key] = $result->fetch_all(MYSQLI_ASSOC);
    }
    $stmt->close();
}

$conn->close();
echo json_encode($response);