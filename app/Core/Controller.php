<?php
/**
 * Nexo - Base Controller
 */

declare(strict_types=1);

namespace App\Core;

abstract class Controller {
    protected function render(string $view, array $data = [], string $layout = 'main'): void {
        View::render($view, $data, $layout);
    }

    protected function json(mixed $data, int $statusCode = 200): void {
        Response::json($data, $statusCode);
    }

    protected function success(mixed $data = [], string $message = 'Operación exitosa', int $statusCode = 200): void {
        Response::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    protected function error(string $message = 'Ha ocurrido un error', int $statusCode = 400, array $errors = []): void {
        Response::json([
            'success' => false,
            'error' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    protected function redirect(string $url): void {
        Response::redirect($url);
    }

    protected function requireAuth(): void {
        if (!Auth::check()) {
            if ($this->isAjax()) {
                $this->error('No autorizado. Por favor inicia sesión.', 401);
            } else {
                $this->redirect('/login');
            }
        }
    }

    protected function requireCsrf(): void {
        if (!Csrf::validate()) {
            $this->error('Token de seguridad CSRF inválido o expirado.', 403);
        }
    }

    protected function isAjax(): bool {
        return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
               (!empty($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) ||
               str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/api/');
    }

    protected function getJsonInput(): array {
        $content = file_get_contents('php://input');
        if (empty($content)) {
            return [];
        }
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    protected function user(): ?array {
        return Auth::user();
    }

    protected function userId(): ?int {
        return Auth::id();
    }
}
