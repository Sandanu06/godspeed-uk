<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include config file
require_once __DIR__ . '/config.php';

// Start session
session_start();

// Set content type
header('Content-Type: application/json');

// Get global PDO instance
global $pdo;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'login':
                try {
                    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = ?");
                    $stmt->execute([$data['username']]);
                    $user = $stmt->fetch();
                    
                    if ($user && password_verify($data['password'], $user['password'])) {
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['isLoggedIn'] = true;
                        echo json_encode(['success' => true]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                    }
                } catch(PDOException $e) {
                    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
                }
                break;
                
            case 'logout':
                session_destroy();
                echo json_encode(['success' => true]);
                break;
                
            case 'check':
                echo json_encode(['loggedIn' => isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true]);
                break;
        }
    }
}
?> 