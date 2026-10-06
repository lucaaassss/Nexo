<?php
/**
 * Nexo - User Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class User extends Model {
    protected static string $table = 'users';

    public static function findByEmail(string $email): ?array {
        $rows = self::where('email', trim($email));
        return $rows[0] ?? null;
    }

    public static function search(string $query, int $limit = 10): array {
        $sql = "SELECT id, name, email, avatar_url, role FROM users WHERE name LIKE ? OR email LIKE ? LIMIT {$limit}";
        return self::query($sql, ["%{$query}%", "%{$query}%"]);
    }
}
