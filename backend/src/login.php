<?php
// backend/src/login.php

header('Content-Type: application/json');

// Pastikan cors dan koneksi database tersedia
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';

// Hanya menerima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya metode POST yang diterima.']);
    exit;
}

// Membaca input JSON dari request body
$json = file_get_contents('php://input');
$data = json_decode($json);

$emailOrUser = isset($data->email) ? trim($data->email) : (isset($data->username) ? trim($data->username) : '');
$password = isset($data->password) ? trim($data->password) : '';

if (empty($emailOrUser) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email dan Password tidak boleh kosong!']);
    exit;
}

// Cari user pemilik admin (cocokkan email, username, atau alias admin)
$stmt = $conn->prepare('SELECT id, username, email, `password`, nama_lengkap FROM users WHERE email = ? OR username = ? OR (email IN ("admin@portofolio.com", "admin@example.com") AND ? IN ("admin@portofolio.com", "admin@example.com", "admin")) LIMIT 1');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Query prepare gagal.']);
    exit;
}

$stmt->bind_param('sss', $emailOrUser, $emailOrUser, $emailOrUser);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Verifikasi password hash
    if (password_verify($password, $row['password'])) {
        // Buat token acak (64 karakter hex)
        $token = bin2hex(random_bytes(32));

        // Simpan token ke database
        $updateStmt = $conn->prepare('UPDATE users SET token = ? WHERE id = ? LIMIT 1');
        $updateStmt->bind_param('si', $token, $row['id']);

        if (!$updateStmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui token!']);
            exit;
        }

        // Response berhasil
        echo json_encode([
            'status' => 'success',
            'message' => 'Login berhasil',
            'user' => [
                'id' => $row['id'],
                'username' => $row['username'],
                'email' => $row['email'],
                'nama_lengkap' => $row['nama_lengkap']
            ],
            'token' => $token
        ]);
        exit;
    }
}

// Jika email/password salah
http_response_code(401);
echo json_encode(['status' => 'error', 'message' => 'Email atau password salah!']);

$stmt->close();
$conn->close();