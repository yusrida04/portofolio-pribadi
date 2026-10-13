<?php
// backend/index.php

// Paksa tampilkan error secara langsung
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // 1. Panggil CORS di pintu masuk utama
    require_once __DIR__ . '/library/cors.php';

    // 2. Parsing Path URL
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $scriptName = dirname($_SERVER['SCRIPT_NAME']);
    $path = str_replace($scriptName, '', $uri);
    $path = trim($path, '/');

    // 3. Jika mengakses root backend
    if ($path === '' || $path === 'index.php') {
        echo json_encode(['status' => 'success', 'message' => 'Selamat datang di backend portofolio']);
        exit;
    }

    // 4. Routing dinamis ke folder src/
    $safePath = basename($path);
    $filePath = __DIR__ . '/src/' . $safePath . '.php';

    if (file_exists($filePath)) {
        require_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint tidak ditemukan']);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit;
}