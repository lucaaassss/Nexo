<?php
/**
 * Nexo - View and Template Renderer
 */

declare(strict_types=1);

namespace App\Core;

class View {
    public static function render(string $view, array $data = [], string $layout = 'main'): void {
        $viewFile = APP_PATH . "/Views/{$view}.php";
        if (!file_exists($viewFile)) {
            throw new \RuntimeException("Vista '{$view}' no encontrada en {$viewFile}");
        }

        // Extraer variables para la vista
        extract($data);
        
        // Datos globales
        $currentUser = Auth::user();
        $csrfToken = Csrf::getToken();
        $appName = APP_NAME;

        // Renderizar contenido de la vista
        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        // Renderizar con layout
        if ($layout) {
            $layoutFile = APP_PATH . "/Views/layouts/{$layout}.php";
            if (file_exists($layoutFile)) {
                require $layoutFile;
                return;
            }
        }

        echo $content;
    }

    public static function partial(string $partial, array $data = []): void {
        $partialFile = APP_PATH . "/Views/partials/{$partial}.php";
        if (file_exists($partialFile)) {
            extract($data);
            $currentUser = Auth::user();
            require $partialFile;
        }
    }

    public static function escape(mixed $value): string {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    }
}

// Función global helper para escape seguro en vistas
if (!function_exists('e')) {
    function e(mixed $value): string {
        return \App\Core\View::escape($value);
    }
}
