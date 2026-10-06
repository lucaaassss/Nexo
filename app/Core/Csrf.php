<?php
/**
 * Nexo - CSRF Protection Manager
 */

declare(strict_types=1);

namespace App\Core;

class Csrf {
    public static function getToken(): string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['_csrf_token'];
    }

    public static function input(): string {
        $token = self::getToken();
        return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    public static function validate(): bool {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $sessionToken = $_SESSION['_csrf_token'] ?? null;
        if (!$sessionToken) {
            return false;
        }

        // Obtener de POST o headers
        $requestToken = $_POST['_csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!$requestToken && !empty($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            $requestToken = $data['_csrf_token'] ?? null;
        }

        return hash_equals((string)$sessionToken, (string)$requestToken);
    }
}
