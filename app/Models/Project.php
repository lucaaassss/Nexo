<?php
/**
 * Nexo - Project Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Project extends Model {
    protected static string $table = 'projects';

    public static function getUserProjects(int $userId): array {
        $sql = "SELECT DISTINCT p.*, 
                       COALESCE(pm.role, 'admin') as member_role,
                       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
                       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
                       (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as members_count
                FROM projects p
                LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
                WHERE p.created_by = ? OR pm.user_id = ?
                ORDER BY p.updated_at DESC";
        
        return self::query($sql, [$userId, $userId, $userId]);
    }

    public static function findByInviteCode(string $code): ?array {
        $rows = self::where('invite_code', trim($code));
        return $rows[0] ?? null;
    }

    public static function getMembers(int $projectId): array {
        $sql = "SELECT pm.id as member_id, pm.role, pm.joined_at, u.id as user_id, u.name, u.email, u.avatar_url
                FROM project_members pm
                JOIN users u ON pm.user_id = u.id
                WHERE pm.project_id = ?
                ORDER BY pm.joined_at ASC";
        return self::query($sql, [$projectId]);
    }
}
