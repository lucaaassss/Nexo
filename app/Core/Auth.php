<?php
/**
 * Nexo - Authentication and RBAC Manager
 */

declare(strict_types=1);

namespace App\Core;

use Config\Database;
use PDO;

class Auth {
    private static ?array $currentUser = null;

    public static function initSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 86400 * 30,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }

    public static function check(): bool {
        self::initSession();
        return !empty($_SESSION['user_id']);
    }

    public static function id(): ?int {
        self::initSession();
        return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
    }

    public static function user(): ?array {
        if (!self::check()) {
            return null;
        }

        if (self::$currentUser === null) {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT id, name, email, avatar_url, role, theme_preference, created_at FROM users WHERE id = ?");
            $stmt->execute([self::id()]);
            $user = $stmt->fetch();
            if ($user) {
                self::$currentUser = $user;
            } else {
                self::logout();
            }
        }

        return self::$currentUser;
    }

    public static function attempt(string $email, string $password): bool {
        self::initSession();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([trim($email)]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            self::login($user);
            return true;
        }

        return false;
    }

    public static function login(array $user): void {
        self::initSession();
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        self::$currentUser = $user;
    }

    public static function logout(): void {
        self::initSession();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        self::$currentUser = null;
    }

    public static function getProjectRole(int $projectId): ?string {
        $userId = self::id();
        if (!$userId) return null;

        $pdo = Database::getConnection();
        
        // Verificar si es el dueño
        $stmtOwner = $pdo->prepare("SELECT created_by FROM projects WHERE id = ?");
        $stmtOwner->execute([$projectId]);
        $ownerId = $stmtOwner->fetchColumn();
        if ($ownerId !== false && (int)$ownerId === $userId) {
            return 'admin';
        }

        // Verificar en project_members
        $stmt = $pdo->prepare("SELECT role FROM project_members WHERE project_id = ? AND user_id = ?");
        $stmt->execute([$projectId, $userId]);
        $role = $stmt->fetchColumn();

        return $role ?: null;
    }

    public static function hasProjectRole(int $projectId, array|string $allowedRoles): bool {
        $role = self::getProjectRole($projectId);
        if (!$role) return false;

        $allowedRoles = (array)$allowedRoles;
        return in_array($role, $allowedRoles, true);
    }
}
