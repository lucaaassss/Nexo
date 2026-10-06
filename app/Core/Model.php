<?php
/**
 * Nexo - Base Model with PDO Query Helper
 */

declare(strict_types=1);

namespace App\Core;

use Config\Database;
use PDO;

abstract class Model {
    protected static string $table = '';
    protected static string $primaryKey = 'id';

    public static function getPdo(): PDO {
        return Database::getConnection();
    }

    public static function all(string $orderBy = 'id DESC'): array {
        $pdo = self::getPdo();
        $table = static::$table;
        $stmt = $pdo->query("SELECT * FROM {$table} ORDER BY {$orderBy}");
        return $stmt->fetchAll();
    }

    public static function find(int|string $id): ?array {
        $pdo = self::getPdo();
        $table = static::$table;
        $pk = static::$primaryKey;
        $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE {$pk} = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function where(string $column, mixed $value, string $orderBy = 'id ASC'): array {
        $pdo = self::getPdo();
        $table = static::$table;
        $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE {$column} = ? ORDER BY {$orderBy}");
        $stmt->execute([$value]);
        return $stmt->fetchAll();
    }

    public static function create(array $data): int {
        $pdo = self::getPdo();
        $table = static::$table;

        $columns = array_keys($data);
        $placeholders = array_map(fn($col) => ":{$col}", $columns);

        $sql = "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);

        return (int)$pdo->lastInsertId();
    }

    public static function update(int|string $id, array $data): bool {
        $pdo = self::getPdo();
        $table = static::$table;
        $pk = static::$primaryKey;

        $setParts = [];
        $params = [];
        foreach ($data as $col => $val) {
            $setParts[] = "{$col} = :{$col}";
            $params[$col] = $val;
        }
        $params['pk_id'] = $id;

        $sql = "UPDATE {$table} SET " . implode(', ', $setParts) . " WHERE {$pk} = :pk_id";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public static function delete(int|string $id): bool {
        $pdo = self::getPdo();
        $table = static::$table;
        $pk = static::$primaryKey;
        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE {$pk} = ?");
        return $stmt->execute([$id]);
    }

    public static function query(string $sql, array $params = []): array {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function queryOne(string $sql, array $params = []): ?array {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function execute(string $sql, array $params = []): bool {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($params);
    }
}
