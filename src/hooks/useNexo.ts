import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Project, Task, MemberRole, TaskStatus } from '@/types';
import { supabase } from '@/lib/supabase';

/**
 * Hook de React para consumir el estado global de Nexo.
 * Sincroniza automáticamente los componentes con los cambios en la tienda de datos.
 * Carga el usuario real desde la sesión de Supabase si está disponible.
 */
export function useNexo() {
  const [state, setState] = useState({
    currentUser: store.currentUser,
    projects: store.projects,
    currentProject: store.currentProject,
    tasks: store.tasks,
    chatMessages: store.chatMessages,
    attachments: store.attachments,
    notifications: store.notifications,
    activityLogs: store.activityLogs,
  });

  useEffect(() => {
    // Cargar estado guardado de localStorage tras la hidratación del cliente
    store.initClientState();

    // Cargar usuario real de Supabase si hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};

        // Construir nombre desde metadatos o desde email
        const nombre = meta.nombre || '';
        const apellido = meta.apellido || '';
        const name =
          nombre && apellido
            ? `${nombre} ${apellido}`.trim()
            : nombre || meta.name || meta.full_name || u.email?.split('@')[0] || 'Usuario';

        store.setCurrentUser({
          id: u.id,
          name,
          nombre,
          apellido,
          usuario: meta.usuario || '',
          email: u.email || '',
          avatarUrl: meta.avatar_url || meta.avatarUrl || '',
          role: meta.role || 'MEMBER',
          bio: meta.bio || '',
          createdAt: u.created_at || new Date().toISOString(),
        });
        store.syncWithDatabase();
      }
    });

    // Escuchar cambios de sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};

        const nombre = meta.nombre || '';
        const apellido = meta.apellido || '';
        const name =
          nombre && apellido
            ? `${nombre} ${apellido}`.trim()
            : nombre || meta.name || meta.full_name || u.email?.split('@')[0] || 'Usuario';

        store.setCurrentUser({
          id: u.id,
          name,
          nombre,
          apellido,
          usuario: meta.usuario || '',
          email: u.email || '',
          avatarUrl: meta.avatar_url || meta.avatarUrl || '',
          role: meta.role || 'MEMBER',
          bio: meta.bio || '',
          createdAt: u.created_at || new Date().toISOString(),
        });
        store.syncWithDatabase();
      }
    });

    // Suscribirse a los cambios en la tienda
    const unsubscribe = store.subscribe(() => {
      setState({
        currentUser: store.currentUser,
        projects: store.projects,
        currentProject: store.currentProject,
        tasks: store.tasks,
        chatMessages: store.chatMessages,
        attachments: store.attachments,
        notifications: store.notifications,
        activityLogs: store.activityLogs,
      });
    });

    return () => {
      unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  // Filtrar datos específicos del proyecto activo
  const activeProjectId = state.currentProject?.id;
  const projectTasks = state.tasks.filter((t) => t.projectId === activeProjectId);
  const projectMessages = state.chatMessages.filter((m) => m.projectId === activeProjectId);
  const projectAttachments = state.attachments.filter((a) => a.projectId === activeProjectId);
  const projectActivities = state.activityLogs.filter((a) => a.projectId === activeProjectId);

  return {
    ...state,
    projectTasks,
    projectMessages,
    projectAttachments,
    projectActivities,
    // Exponer métodos de acción
    setCurrentUser: (user: any) => store.setCurrentUser(user),
    updateUserProfile: (data: Parameters<typeof store.updateUserProfile>[0]) => store.updateUserProfile(data),
    setCurrentProject: (id: string) => store.setCurrentProject(id),
    createProject: (data: Parameters<typeof store.createProject>[0]) => store.createProject(data),
    updateProject: (id: string, updates: Partial<Project>) => store.updateProject(id, updates),
    deleteProject: (id: string) => store.deleteProject(id),
    addMemberToProject: (projectId: string, email: string, role: MemberRole) => store.addMemberToProject(projectId, email, role),
    createTask: (data: Parameters<typeof store.createTask>[0]) => store.createTask(data),
    updateTask: (taskId: string, updates: Partial<Task>) => store.updateTask(taskId, updates),
    moveTaskStatus: (taskId: string, status: TaskStatus, pos: number) => store.moveTaskStatus(taskId, status, pos),
    deleteTask: (taskId: string) => store.deleteTask(taskId),
    addSubtask: (taskId: string, title: string) => store.addSubtask(taskId, title),
    toggleSubtask: (taskId: string, subtaskId: string) => store.toggleSubtask(taskId, subtaskId),
    logTimeWorked: (taskId: string, hours: number) => store.logTimeWorked(taskId, hours),
    addComment: (taskId: string, content: string) => store.addComment(taskId, content),
    sendChatMessage: (content: string, parentId?: string) => store.sendChatMessage(content, parentId),
    toggleMessageReaction: (messageId: string, emoji: string) => store.toggleMessageReaction(messageId, emoji),
    uploadFile: (name: string, url: string, size: number, type: string, taskId?: string) => store.uploadFile(name, url, size, type, taskId),
    deleteFile: (fileId: string) => store.deleteFile(fileId),
    markNotificationsAsRead: () => store.markNotificationsAsRead(),
  };
}
