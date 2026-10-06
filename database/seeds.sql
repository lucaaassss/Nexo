-- ==========================================================
-- NEXO SAAS - DEMO SEEDS DATA
-- Contraseñas hasheadas para password123: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ==========================================================

-- 1. Usuarios demo
INSERT INTO users (id, name, email, password_hash, avatar_url, role, theme_preference) VALUES
(1, 'Lucas Rossi', 'lucas@nexo.app', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'admin', 'dark'),
(2, 'Sofia Martinez', 'sofia@nexo.app', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'user', 'dark'),
(3, 'Matias Fernandez', 'matias@nexo.app', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'user', 'dark'),
(4, 'Valentina Gomez', 'valentina@nexo.app', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'user', 'dark');

-- 2. Proyectos
INSERT INTO projects (id, name, description, color, icon, status, created_by, invite_code) VALUES
(1, 'Lanzamiento Nexo SaaS 2.0', 'Plataforma integral de productividad y flujos de trabajo inteligentes con IA.', '#8b5cf6', 'rocket', 'active', 1, 'nexo-saas-2026-launch'),
(2, 'Rediseño UX/UI & Mobile App', 'Nueva experiencia de usuario inspirada en Linear y Notion con diseño modular.', '#06b6d4', 'palette', 'active', 1, 'nexo-mobile-redesign');

-- 3. Miembros del Proyecto (Roles: admin, leader, member, guest)
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'leader'),
(1, 3, 'member'),
(1, 4, 'guest'),
(2, 1, 'admin'),
(2, 2, 'leader'),
(2, 3, 'member');

-- 4. Tags
INSERT INTO tags (id, project_id, name, color) VALUES
(1, 1, 'Frontend', '#06b6d4'),
(2, 1, 'Backend PHP', '#8b5cf6'),
(3, 1, 'Diseño UI', '#ec4899'),
(4, 1, 'Seguridad', '#f97316'),
(5, 1, 'DevOps', '#10b981');

-- 5. Tareas del Proyecto 1
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, logged_hours, position) VALUES
(1, 1, 'Arquitectura del Front Controller y Router PHP', 'Definir el sistema MVC modular en PHP 8.2 con middlewares de seguridad y PDO.', 'completed', 'urgente', 1, 1, '2026-10-10', 8.0, 7.5, 0),
(2, 1, 'Desarrollar vistas Kanban con Drag & Drop nativo', 'Implementar eventos dragstart, dragover y drop para sincronizar estados vía API.', 'in_progress', 'alta', 2, 1, '2026-10-15', 12.0, 5.0, 0),
(3, 1, 'Implementar módulo de Chat con SSE y Reacciones', 'Canal en tiempo real con soporte para emojis, menciones y adjuntos.', 'in_progress', 'alta', 3, 1, '2026-10-18', 16.0, 8.0, 1),
(4, 1, 'Integración de Asistente IA para desglose de tareas', 'Conexión con endpoints de IA para generar subtareas y resúmenes automáticos.', 'todo', 'media', 1, 1, '2026-10-22', 10.0, 0.0, 0),
(5, 1, 'Panel de Analíticas y Gráficos interactivos', 'Crear gráficos Canvas para métricas de velocidad, burndown y productividad.', 'todo', 'media', 2, 1, '2026-10-25', 14.0, 0.0, 1),
(6, 1, 'Auditoría de seguridad y validaciones CSRF/XSS', 'Verificar protección contra inyecciones SQL y sanitización en todas las entradas.', 'in_review', 'urgente', 1, 1, '2026-10-12', 6.0, 5.5, 0),
(7, 1, 'Exportación de reportes de proyecto', 'Generación de reportes exportables en CSV/JSON del rendimiento del equipo.', 'completed', 'baja', 3, 1, '2026-10-08', 4.0, 4.0, 1);

-- 6. Subtareas
INSERT INTO subtasks (task_id, title, is_completed, position) VALUES
(1, 'Configurar index.php con auto-loader y .env', 1, 0),
(1, 'Implementar Router con soporte de métodos GET, POST, PUT, DELETE', 1, 1),
(1, 'Crear clase base Controller y PDO Database singleton', 1, 2),
(2, 'Diseñar columnas Kanban con glassmorphism', 1, 0),
(2, 'Programar lógica de Drag & Drop en vanilla JS', 0, 1),
(2, 'Crear endpoint PATCH /api/tasks/{id}/status', 0, 2),
(3, 'Crear tabla chat_messages con claves foráneas', 1, 0),
(3, 'Configurar Server-Sent Events (SSE) en PHP', 0, 1),
(3, 'Agregar selector de emojis y barra de respuestas', 0, 2),
(4, 'Crear Service AiService con soporte OpenAI/Gemini/Mock', 0, 0),
(4, 'Diseñar modal de prompt inteligente con recomendaciones', 0, 1);

-- 7. Asignación de Tags a Tareas
INSERT INTO task_tags (task_id, tag_id) VALUES
(1, 2), (1, 4),
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 2), (4, 5),
(5, 1), (5, 3),
(6, 4), (6, 2),
(7, 2);

-- 8. Comentarios
INSERT INTO comments (task_id, user_id, content) VALUES
(2, 1, '¡Excelente progreso con el diseño de las columnas Kanban! Asegúrate de que el drag & drop funcione fluido en móviles.'),
(2, 2, 'Totalmente Lucas. Ya estoy probando eventos touch para dispositivos móviles.'),
(3, 3, 'El endpoint de Server-Sent Events quedó super optimizado y consume mínimos recursos.');

-- 9. Mensajes de Chat
INSERT INTO chat_messages (id, project_id, user_id, message, is_edited) VALUES
(1, 1, 1, '¡Hola equipo! Bienvenidos al espacio de trabajo de Nexo 2.0. Hoy iniciamos la fase final del sprint.', 0),
(2, 1, 2, '¡Hola @Lucas! Ya tengo listas las maquetas de la vista Calendario y Timeline. Las subo al gestor de archivos.', 0),
(3, 1, 3, 'Excelente. Por mi parte estoy terminando el sistema de notificaciones y la sincronización en tiempo real.', 0),
(4, 1, 1, '¡Genial! Recuerden que el viernes hacemos el demo con todo el equipo.', 0);

-- 10. Reacciones del Chat
INSERT INTO chat_reactions (message_id, user_id, emoji) VALUES
(1, 2, '🚀'),
(1, 3, '🔥'),
(2, 1, '👏'),
(4, 2, '🙌'),
(4, 3, '💪');

-- 11. Notificaciones
INSERT INTO notifications (user_id, project_id, title, message, link, type, is_read) VALUES
(1, 1, 'Tarea Asignada', 'Se te asignó la tarea: Auditoría de seguridad y validaciones CSRF/XSS', '/projects/1?view=kanban', 'task_assigned', 0),
(1, 1, 'Nuevo mensaje en el Chat', 'Sofia Martinez mencionó al equipo en el canal general.', '/projects/1?view=chat', 'mention', 0),
(2, 1, 'Comentario en Tarea', 'Lucas Rossi comentó en "Desarrollar vistas Kanban"', '/projects/1?view=kanban', 'comment', 1);

-- 12. Historial de Actividad (Audit Log)
INSERT INTO activity_logs (project_id, user_id, action, description, metadata) VALUES
(1, 1, 'project_created', 'Lucas Rossi creó el proyecto "Lanzamiento Nexo SaaS 2.0".', '{"color": "#8b5cf6"}'),
(1, 2, 'member_joined', 'Sofia Martinez se unió como Líder de Proyecto.', '{"role": "leader"}'),
(1, 1, 'task_created', 'Lucas Rossi creó la tarea "Arquitectura del Front Controller y Router PHP".', '{"task_id": 1}'),
(1, 1, 'task_completed', 'Lucas Rossi completó la tarea "Arquitectura del Front Controller y Router PHP".', '{"task_id": 1}'),
(1, 3, 'task_created', 'Matias Fernandez creó la tarea "Implementar módulo de Chat con SSE y Reacciones".', '{"task_id": 3}');
