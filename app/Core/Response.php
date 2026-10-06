<?php
/**
 * Nexo - Core Response Helper
 */

declare(strict_types=1);

namespace App\Core;

class Response {
    public static function json(mixed $data, int $statusCode = 200, array $headers = []): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function redirect(string $url, int $statusCode = 302): void {
        http_response_code($statusCode);
        header("Location: {$url}");
        exit;
    }

    public static function sseHeader(): void {
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no'); // Para Nginx
        while (ob_get_level()) {
            ob_end_flush();
        }
        flush();
    }

    public static function sendSseEvent(string $event, mixed $data): void {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
        flush();
    }
}
