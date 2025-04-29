<?php
require_once 'config.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM items ORDER BY name");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} 
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'add':
                $stmt = $pdo->prepare("INSERT INTO items (name, quantity) VALUES (?, ?)");
                $stmt->execute([$data['name'], $data['quantity']]);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
                break;
                
            case 'update':
                $stmt = $pdo->prepare("UPDATE items SET name = ?, quantity = ? WHERE id = ?");
                $stmt->execute([$data['name'], $data['quantity'], $data['id']]);
                echo json_encode(['success' => true]);
                break;
                
            case 'delete':
                $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
                $stmt->execute([$data['id']]);
                echo json_encode(['success' => true]);
                break;
        }
    }
}
?> 