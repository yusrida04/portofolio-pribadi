<?php
// backend/src/pengalaman.php

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$json = file_get_contents('php://input');
$data = json_decode($json);

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
$namaPerusahaan = trim($data->nama_perusahaan ?? '');
$jabatan = trim($data->jabatan ?? '');
$tahunMulai = trim($data->tahun_mulai ?? '');
$tahunSelesai = trim($data->tahun_selesai ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM pengalaman ORDER BY id DESC');
    $stmt->execute();
    echo json_encode([
        'status' => 'success',
        'pengalaman' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare('INSERT INTO pengalaman (nama_perusahaan, jabatan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan pengalaman']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $conn->prepare('UPDATE pengalaman SET nama_perusahaan=?, jabatan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssssi', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui pengalaman']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM pengalaman WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus pengalaman']);
    $stmt->close();
}

$conn->close();