<?php
// backend/src/verify_login.php

require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// Ambil token dari Authorization Header, POST Body, atau Query Parameter GET
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

$json = file_get_contents('php://input');
$data = json_decode($json);

$token = '';
if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
} else {
    $token = trim($data->token ?? $_GET['token'] ?? '');
}

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Token tidak boleh kosong']);
    exit;
}

// Panggil fungsi verifikasi dari commonfunction.php
verifyToken($token);

echo json_encode(['status' => 'success', 'message' => 'Token valid']);

$conn->close();