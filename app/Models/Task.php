<?php
/**
 * Nexo - Task Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Task extends Model {
    protected static string $table = 'tasks';

    public static function getProjectTasks(int $projectId, ?string $status = null, ?string $priority = null): array {
        $sql = "SELECT t.*, 
                       u_assign.name as assigned_name, u_assign.avatar_url as assigned_avatar, u_assign.email as assigned_email,
                       u_create.name as creator_name,
                       (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as total_subtasks,
                       (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND is_completed = 1) as completed_subtasks,
                       (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comments_count,
                       (SELECT COUNT(*) FROM files WHERE task_id = t.id) as attachments_count
                FROM tasks t
                LEFT JOIN users u_assign ON t.assigned_to = u_assign.id
                LEFT JOIN users u_create ON t.created_by = u_create.id
                WHERE t.project_id = ?";
        
        $params = [$projectId];

        if ($status) {
            $sql .= " AND t.status = ?";
            $params[] = $status;
        }

        if ($priority) {
            $sql .= " AND t.priority = ?";
            $params[] = $priority;
        }

        $sql .= " ORDER BY t.position ASC, t.created_at DESC";

        $tasks = self::query($sql, $params);

        // Adjuntar tags a cada tarea
        foreach ($tasks as &$task) {
            $task['tags'] = self::getTaskTags((int)$task['id']);
        }

        return $tasks;
    }

    public static function getTaskDetails(int $taskId): ?array {
        $sql = "SELECT t.*, 
                       u_assign.name as assigned_name, u_assign.avatar_url as assigned_avatar, u_assign.email as assigned_email,
                       u_create.name as creator_name, u_create.avatar_url as creator_avatar
                FROM tasks t
                LEFT JOIN users u_assign ON t.assigned_to = u_assign.id
                LEFT JOIN users u_create ON t.created_by = u_create.id
                WHERE t.id = ? LIMIT 1";
        
        $task = self::queryOne($sql, [$taskId]);
        if (!$task) return null;

        $task['subtasks'] = Subtask::where('task_id', $taskId, 'position ASC, id ASC');
        $task['comments'] = Comment::getTaskComments($taskId);
        $task['tags'] = self::getTaskTags($taskId);
        $task['attachments'] = Attachment::where('task_id', $taskId, 'created_at DESC');

        return $task;
    }

    public static function getTaskTags(int $taskId): array {
        $sql = "SELECT tg.* FROM tags tg
                JOIN task_tags tt ON tg.id = tt.tag_id
                WHERE tt.task_id = ?";
        return self::query($sql, [$taskId]);
    }

    public static function syncTags(int $taskId, array $tagIds): void {
        self::execute("DELETE FROM task_tags WHERE task_id = ?", [$taskId]);
        foreach ($tagIds as $tagId) {
            self::execute("INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)", [$taskId, $tagId]);
        }
    }
}
