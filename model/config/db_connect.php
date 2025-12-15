<?php
date_default_timezone_set('Asia/Manila');

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') ?: '';
        $db   = getenv('DB_NAME') ?: 'paybach_db';

        $this->conn = new mysqli($host, $user, $pass, $db);

        if ($this->conn->connect_error) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Database connection failed"
            ]);
            exit; // IMPORTANT: stop output
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

function get_db_connection() {
    return Database::getInstance()->getConnection();
}

$conn = Database::getInstance()->getConnection();
