<?php
// backend/src/karya.php

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
$namaKarya = trim($data->nama_karya ?? '');
$deskripsi = trim($data->deskripsi ?? '');
$url = trim($data->url ?? '');
$gambar = trim($data->gambar ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM karya_terbaik ORDER BY id DESC');
    $stmt->execute();
    echo json_encode([
        'status' => 'success',
        'karya_terbaik' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare('INSERT INTO karya_terbaik (nama_karya, deskripsi, url, gambar) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $namaKarya, $deskripsi, $url, $gambar);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan project']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $conn->prepare('UPDATE karya_terbaik SET nama_karya=?, deskripsi=?, url=?, gambar=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssssi', $namaKarya, $deskripsi, $url, $gambar, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui project']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM karya_terbaik WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus project']);
    $stmt->close();
}

$conn->close();