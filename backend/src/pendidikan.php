<?php
// backend/src/pendidikan.php

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// Membaca data JSON dari body request atau query parameter
$json = file_get_contents('php://input');
$data = json_decode($json);

// Menangkap token dari Header Authorization, Body JSON, atau Query Parameter GET
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = '';

if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
} else {
    $token = trim($data->token ?? $_GET['token'] ?? '');
}

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'pesan' => 'Silahkan login terlebih dahulu']);
    exit;
}

verifyToken($token);

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaInstitusi = trim($data->nama_institusi ?? '');
$tingkat = trim($data->tingkat ?? '');
$jurusan = trim($data->jurusan ?? '');
$tahunMulai = trim($data->tahun_mulai ?? '');
$tahunSelesai = trim($data->tahun_selesai ?? '');

// READ: Ambil seluruh riwayat pendidikan
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM riwayat_pendidikan ORDER BY id DESC');
    $stmt->execute();
    echo json_encode([
        'status' => 'success',
        'riwayat_pendidikan' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();

// CREATE: Tambah riwayat pendidikan baru
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare('INSERT INTO riwayat_pendidikan (nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sssss', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan riwayat pendidikan']);
    $stmt->close();

// UPDATE: Perbarui riwayat berdasarkan ID
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $conn->prepare('UPDATE riwayat_pendidikan SET nama_institusi=?, tingkat=?, jurusan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
    $stmt->bind_param('sssssi', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui riwayat pendidikan']);
    $stmt->close();

// DELETE: Hapus riwayat berdasarkan ID
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM riwayat_pendidikan WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus riwayat pendidikan']);
    $stmt->close();
}

$conn->close();