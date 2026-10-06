<?php
/**
 * Nexo - Database PDO Connection Manager
 */

declare(strict_types=1);

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    private static ?string $driver = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            self::connect();
        }
        return self::$instance;
    }

    public static function getDriver(): string {
        if (self::$driver === null) {
            self::$driver = strtolower(env('DB_DRIVER', 'mysql'));
        }
        return self::$driver;
    }

    private static function connect(): void {
        $driver = self::getDriver();

        try {
            if ($driver === 'sqlite') {
                $dbFile = STORAGE_PATH . '/database.sqlite';
                $isNew = !file_exists($dbFile) || filesize($dbFile) === 0;

                self::$instance = new PDO('sqlite:' . $dbFile, null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);

                // Habilitar foreign keys en SQLite
                self::$instance->exec('PRAGMA foreign_keys = ON;');

                if ($isNew) {
                    self::initializeSchema();
                }
            } else {
                $host = env('DB_HOST', '127.0.0.1');
                $port = env('DB_PORT', '3306');
                $dbName = env('DB_DATABASE', 'nexo_db');
                $username = env('DB_USERNAME', 'root');
                $password = env('DB_PASSWORD', '');

                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

                self::$instance = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
            }
        } catch (PDOException $e) {
            // Si falla MySQL y estamos en desarrollo, fallback elegante a SQLite
            if ($driver === 'mysql' && APP_ENV === 'development') {
                error_log("Fallo conexion MySQL ({$e->getMessage()}). Activando fallback a SQLite...");
                self::$driver = 'sqlite';
                self::connect();
                return;
            }

            if (APP_DEBUG) {
                die("Error crítico de base de datos: " . $e->getMessage());
            } else {
                http_response_code(500);
                die("Error conectando con el servicio de base de datos.");
            }
        }
    }

    public static function initializeSchema(): void {
        require_once ROOT_PATH . '/database/DatabaseSeeder.php';
        \Database\DatabaseSeeder::run(self::$instance, self::getDriver());
    }
}
