import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Project, Task, MemberRole, TaskStatus } from '@/types';
import { getRolePermissions } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';

/**
 * Hook de React para consumir el estado global de Nexor-Space.
 * Sincroniza automáticamente los componentes con los cambios en la tienda de datos.
 * Carga el usuario real desde la sesión de Supabase si está disponible.
 */
export function useNexorSpace() {
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

    const syncUserFromSupabase = async (u: any) => {
      const meta = u.user_metadata || {};
      let nombre = meta.nombre || '';
      let apellido = meta.apellido || '';
      let usuario = meta.usuario || '';
      let avatarUrl = meta.foto_perfil || meta.avatar_url || meta.avatarUrl || '';

      // Consultar tabla 'usuarios' para obtener los datos más recientes
      try {
        const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id', u.id).maybeSingle();
        if (dbUser) {
          if (dbUser.nombre) nombre = dbUser.nombre;
          if (dbUser.apellido) apellido = dbUser.apellido;
          if (dbUser.usuario) usuario = dbUser.usuario;
          if (dbUser.foto_perfil) avatarUrl = dbUser.foto_perfil;
        } else {
          // Si el usuario aún no existe en la tabla usuarios, crearlo
          await supabase.from('usuarios').upsert({
            id: u.id,
            nombre: nombre || u.email?.split('@')[0] || 'Usuario',
            apellido: apellido || '',
            usuario: usuario || u.email?.split('@')[0] || 'user',
            email: u.email || '',
            foto_perfil: avatarUrl || '',
            estado: 'activo',
          });
        }
      } catch (err) {
        console.warn('Error sincronizando tabla usuarios:', err);
      }

      const name =
        nombre && apellido
          ? `${nombre} ${apellido}`.trim()
          : nombre || meta.name || meta.full_name || u.email?.split('@')[0] || 'Usuario';

      store.setCurrentUser({
        id: u.id,
        name,
        nombre,
        apellido,
        usuario,
        email: u.email || '',
        avatarUrl,
        role: meta.role || 'MEMBER',
        bio: meta.bio || '',
        createdAt: u.created_at || new Date().toISOString(),
      });
      store.syncWithDatabase();
    };

    // Cargar usuario real de Supabase si hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserFromSupabase(session.user);
      }
    });

    // Escuchar cambios de sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserFromSupabase(session.user);
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

    // Polling en tiempo real para recibir notificaciones y tareas nuevas automáticamente
    const intervalId = setInterval(() => {
      store.fetchNotificationsFromDB();
      if (store.currentProject?.id) store.fetchTasksForProject(store.currentProject.id);
    }, 5000);

    const onFocus = () => {
      store.fetchNotificationsFromDB();
      if (store.currentProject?.id) store.fetchTasksForProject(store.currentProject.id);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribe();
      subscription.unsubscribe();
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Filtrar datos específicos del proyecto activo
  const activeProjectId = state.currentProject?.id;
  const projectTasks = state.tasks.filter((t) => t.projectId === activeProjectId);
  const projectMessages = state.chatMessages.filter((m) => m.projectId === activeProjectId);
  const projectAttachments = state.attachments.filter((a) => a.projectId === activeProjectId);
  const projectActivities = state.activityLogs.filter((a) => a.projectId === activeProjectId);

  // Filtrar notificaciones que pertenezcan al usuario actual
  const userNotifications = state.notifications.filter(
    (n) =>
      !n.userId ||
      n.userId === state.currentUser.id ||
      (state.currentUser.email && n.userId === state.currentUser.email)
  );

  // Determinar rol y permisos del usuario en el proyecto activo
  const currentMember = state.currentProject?.members?.find(
    (m) =>
      m.userId === state.currentUser.id ||
      (m.user?.email && state.currentUser.email && m.user.email.toLowerCase() === state.currentUser.email.toLowerCase())
  );

  const userRole: MemberRole =
    currentMember?.role ||
    (state.currentUser.role === 'ADMIN' || state.currentUser.id === 'usr_admin_1' ? 'ADMIN' : 'MEMBER');
  // Obtener permisos centralizados desde la matriz RBAC
  const permissions = getRolePermissions(userRole);

  const isAdmin = userRole === 'ADMIN' || userRole === 'LEADER';
  const canCreateTask = permissions.canCreateTask;
  const canEditTask = permissions.canEditTask;
  const canDeleteTask = permissions.canDeleteTask;
  const canManageMembers = permissions.canManageMembers;
  const isMemberOnly = !isAdmin;

  return {
    ...state,
    userRole,
    isAdmin,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canManageMembers,
    isMemberOnly,
    notifications: userNotifications,
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
    deleteNotification: (notificationId: string) => store.deleteNotification(notificationId),
    clearAllNotifications: () => store.clearAllNotifications(),
  };
}
