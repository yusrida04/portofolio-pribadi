<?php
// backend/src/users.php

header('Content-Type: application/json');

require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];

// Hanya menerima metode GET dan POST
if ($method !== 'GET' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
    exit;
}

// Menangkap token dari Authorization Header, GET, atau POST
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = '';

if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
} else {
    $data = ($method === 'POST') ? (object)$_POST : (object)$_GET;
    $token = trim($data->token ?? '');
}

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Silahkan login terlebih dahulu']);
    exit;
}

verifyToken($token);

// 1. GET: Ambil Detail Profil Pengguna Aktif
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, username, email, nama_lengkap, nomor_hp, foto, created_at FROM users WHERE token = ? LIMIT 1');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'success', 'user' => $user]);
    $conn->close();
    exit;
}

// 2. POST: UPDATE PROFIL (Validasi Input)
$data = (object)$_POST;
$username    = trim($data->username ?? '');
$email       = trim($data->email ?? '');
$namaLengkap = trim($data->nama_lengkap ?? '');
$nomorHp     = trim($data->nomor_hp ?? '');
$password    = trim($data->password ?? '');

if ($username === '' || $email === '' || $namaLengkap === '' || $nomorHp === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Data user tidak boleh kosong']);
    exit;
}

// Ambil foto lama jika tidak ada foto baru yang diunggah
$stmtUser = $conn->prepare('SELECT foto FROM users WHERE token = ? LIMIT 1');
$stmtUser->bind_param('s', $token);
$stmtUser->execute();
$currentUser = $stmtUser->get_result()->fetch_assoc();
$stmtUser->close();

$foto = $currentUser['foto'] ?? 'default.png';

// 3. LOGIKA UPLOAD FOTO BARU
if (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Upload foto gagal']);
        exit;
    }

    if ($_FILES['foto']['size'] > 5 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['status' => 'error', 'message' => 'Ukuran foto maksimal 5 MB']);
        exit;
    }

    $allowedMimeTypes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($_FILES['foto']['tmp_name']);

    if (!isset($allowedMimeTypes[$mimeType])) {
        http_response_code(415);
        echo json_encode(['status' => 'error', 'message' => 'Format foto harus JPG, PNG, atau WEBP']);
        exit;
    }

    $uploadDirectory = __DIR__ . '/../uploads';
    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0755, true);
    }

    // Nama acak unik
    $foto = bin2hex(random_bytes(16)) . '.' . $allowedMimeTypes[$mimeType];
    move_uploaded_file($_FILES['foto']['tmp_name'], $uploadDirectory . '/' . $foto);
}

// 4. SIMPAN PERUBAHAN KE DATABASE
if ($password !== '') {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('UPDATE users SET username = ?, email = ?, `password` = ?, nama_lengkap = ?, nomor_hp = ?, foto = ? WHERE token = ? LIMIT 1');
    $stmt->bind_param('sssssss', $username, $email, $passwordHash, $namaLengkap, $nomorHp, $foto, $token);
} else {
    $stmt = $conn->prepare('UPDATE users SET username = ?, email = ?, nama_lengkap = ?, nomor_hp = ?, foto = ? WHERE token = ? LIMIT 1');
    $stmt->bind_param('ssssss', $username, $email, $namaLengkap, $nomorHp, $foto, $token);
}

$stmt->execute();
$stmt->close();

echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui data user']);
$conn->close();