<?php
date_default_timezone_set('Asia/Manila');
class Database {
    private static $instance = null;
    private $conn;
    private function __construct() {
        $this->conn = new mysqli("localhost", "root", "", "paybach_db");
    }
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    public function getConnection() {
        return $this->conn;
    }
}
?>
