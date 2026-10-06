<?php
/**
 * Nexo - Project Member Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class ProjectMember extends Model {
    protected static string $table = 'project_members';

    public static function findMember(int $projectId, int $userId): ?array {
        $sql = "SELECT * FROM project_members WHERE project_id = ? AND user_id = ? LIMIT 1";
        return self::queryOne($sql, [$projectId, $userId]);
    }
}
