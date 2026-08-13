import {
  Project,
  Task,
  User,
  ChatMessage,
  Attachment,
  NotificationItem,
  ActivityItem,
  MemberRole,
  TaskStatus,
  TaskPriority,
} from '@/types';

/**
 * Estado Central Reactivo de Nexo (In-Memory + API Persistence Store)
 * Administra el estado global de la sesión, proyectos activos, tareas, chat,
 * notificaciones, archivos e historial de actividad en tiempo real.
 */

// Usuario por defecto para el inicio de sesión inicial
export const DEFAULT_USER: User = {
  id: 'usr_admin_1',
  name: 'Administrador Nexo',
  email: 'admin@nexo.app',
  avatarUrl: '',
  role: 'ADMIN',
  bio: 'Arquitecto Principal del Sistema Nexo',
  createdAt: new Date().toISOString(),
};

export class NexoStore {
  private static instance: NexoStore;
  
  public currentUser: User = DEFAULT_USER;
  public projects: Project[] = [];
  public currentProject: Project | null = null;
  public tasks: Task[] = [];
  public chatMessages: ChatMessage[] = [];
  public attachments: Attachment[] = [];
  public notifications: NotificationItem[] = [];
  public activityLogs: ActivityItem[] = [];
  public listeners: Set<() => void> = new Set();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NexoStore {
    if (!NexoStore.instance) {
      NexoStore.instance = new NexoStore();
    }
    return NexoStore.instance;
  }

  /** Carga el estado inicial desde localStorage solo en el cliente tras la hidratación */
  public initClientState() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.isInitialized = true;
      this.loadInitialState();
      this.notify();
    }
  }

  /** Carga el estado guardado localmente si existe */
  private loadInitialState() {
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('nexo_projects');
        const savedTasks = localStorage.getItem('nexo_tasks');
        const savedChat = localStorage.getItem('nexo_chat');
        const savedFiles = localStorage.getItem('nexo_files');
        const savedLogs = localStorage.getItem('nexo_activity');
        const savedNotifs = localStorage.getItem('nexo_notifications');

        if (savedProjects) this.projects = JSON.parse(savedProjects);
        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        if (savedChat) this.chatMessages = JSON.parse(savedChat);
        if (savedFiles) this.attachments = JSON.parse(savedFiles);
        if (savedLogs) this.activityLogs = JSON.parse(savedLogs);
        if (savedNotifs) this.notifications = JSON.parse(savedNotifs);

        if (this.projects.length === 0) {
          const defaultProj: Project = {
            id: 'proj_demo_1',
            key: 'NEX',
            name: 'Proyecto Principal Nexo',
            description: 'Espacio de trabajo centralizado para tareas, chat y archivos del equipo.',
            color: '#7C3AED',
            icon: 'FolderKanban',
            isArchived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [
              {
                id: 'mem_1',
                projectId: 'proj_demo_1',
                userId: DEFAULT_USER.id,
                role: 'ADMIN',
                joinedAt: new Date().toISOString(),
                user: DEFAULT_USER,
              },
            ],
          };

          const defaultTasks: Task[] = [
            {
              id: 'tsk_1',
              key: 'NEX-1',
              title: 'Diseñar arquitectura del sistema y base de datos',
              description: 'Definir esquemas de modelos en Prisma y la estructura de endpoints REST API.',
              priority: 'ALTA',
              status: 'FINALIZADA',
              estimatedHours: 8,
              loggedHours: 8,
              position: 1,
              dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              tags: ['Backend', 'DB', 'Prisma'],
              projectId: 'proj_demo_1',
              creatorId: DEFAULT_USER.id,
              creator: DEFAULT_USER,
              subtasks: [
                { id: 'sub_1', taskId: 'tsk_1', title: 'Crear esquema Prisma', completed: true, createdAt: new Date().toISOString() },
                { id: 'sub_2', taskId: 'tsk_1', title: 'Configurar cliente DB Singleton', completed: true, createdAt: new Date().toISOString() },
              ],
              comments: [
                { id: 'cmt_1', taskId: 'tsk_1', authorId: DEFAULT_USER.id, content: 'Esquema validado correctamente.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), author: DEFAULT_USER }
              ],
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'tsk_2',
              key: 'NEX-2',
              title: 'Implementar interfaz Kanban reactiva con Drag & Drop',
              description: 'Desarrollar el tablero con @hello-pangea/dnd para mover tarjetas entre estados.',
              priority: 'URGENTE',
              status: 'EN_PROGRESO',
              estimatedHours: 12,
              loggedHours: 6,
              position: 1,
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
              tags: ['Frontend', 'React', 'Kanban'],
              projectId: 'proj_demo_1',
              creatorId: DEFAULT_USER.id,
              creator: DEFAULT_USER,
              subtasks: [
                { id: 'sub_3', taskId: 'tsk_2', title: 'Crear componentes de columna', completed: true, createdAt: new Date().toISOString() },
                { id: 'sub_4', taskId: 'tsk_2', title: 'Conectar manejador de arrastrar y soltar', completed: false, createdAt: new Date().toISOString() },
              ],
              comments: [],
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'tsk_3',
              key: 'NEX-3',
              title: 'Integrar asistente inteligente Nexo AI',
              description: 'Desarrollar modal y respuestas automatizadas con IA para resumen de proyectos.',
              priority: 'MEDIA',
              status: 'EN_REVISION',
              estimatedHours: 6,
              loggedHours: 4,
              position: 1,
              dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
              tags: ['AI', 'SaaS', 'Feature'],
              projectId: 'proj_demo_1',
              creatorId: DEFAULT_USER.id,
              creator: DEFAULT_USER,
              subtasks: [],
              comments: [],
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'tsk_4',
              key: 'NEX-4',
              title: 'Optimización de rendimiento y modo oscuro',
              description: 'Ajustar tokens de TailwindCSS v4 y resolver advertencias de hidratación SSR.',
              priority: 'BAJA',
              status: 'PENDIENTE',
              estimatedHours: 4,
              loggedHours: 0,
              position: 1,
              dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
              tags: ['CSS', 'UI', 'Performance'],
              projectId: 'proj_demo_1',
              creatorId: DEFAULT_USER.id,
              creator: DEFAULT_USER,
              subtasks: [],
              comments: [],
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          const defaultChat: ChatMessage[] = [
            {
              id: 'msg_1',
              projectId: 'proj_demo_1',
              senderId: DEFAULT_USER.id,
              content: '¡Bienvenidos al espacio de trabajo de Nexo! Aquí podemos coordinar tareas, compartir archivos y chatear.',
              isSystem: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sender: DEFAULT_USER,
              reactions: [{ id: 'rct_1', messageId: 'msg_1', userId: DEFAULT_USER.id, emoji: '🚀', createdAt: new Date().toISOString(), user: DEFAULT_USER }],
            },
          ];

          this.projects = [defaultProj];
          this.currentProject = defaultProj;
          this.tasks = defaultTasks;
          this.chatMessages = defaultChat;
          this.persistState();
        } else {
          this.currentProject = this.projects[0];
        }
      } catch (e) {
        console.error('Error cargando estado inicial:', e);
      }
    }
  }

  /** Guarda los datos persistentes en localStorage */
  private persistState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nexo_projects', JSON.stringify(this.projects));
        localStorage.setItem('nexo_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('nexo_chat', JSON.stringify(this.chatMessages));
        localStorage.setItem('nexo_files', JSON.stringify(this.attachments));
        localStorage.setItem('nexo_activity', JSON.stringify(this.activityLogs));
        localStorage.setItem('nexo_notifications', JSON.stringify(this.notifications));
      } catch (e) {
        console.error('Error guardando estado:', e);
      }
    }
    this.notify();
  }

  /** Suscribe un componente a cambios en la tienda de datos */
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notifica a los suscriptores cuando cambia el estado */
  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  /** Actualiza el usuario actual y notifica a los suscriptores */
  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.notify();
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS DE PROYECTO
  // ---------------------------------------------------------------------------

  /** Selecciona el proyecto activo actual */
  public setCurrentProject(projectId: string) {
    const found = this.projects.find((p) => p.id === projectId);
    if (found) {
      this.currentProject = found;
      this.notify();
    }
  }

  /** Crea un nuevo proyecto */
  public createProject(data: { name: string; key: string; description?: string; color?: string; icon?: string }): Project {
    const projId = 'proj_' + Date.now();
    const newProject: Project = {
      id: projId,
      key: data.key.toUpperCase(),
      name: data.name,
      description: data.description || '',
      color: data.color || '#7C3AED',
      icon: data.icon || 'FolderKanban',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: 'mem_' + Date.now(),
          projectId: projId,
          userId: this.currentUser.id,
          role: 'ADMIN',
          joinedAt: new Date().toISOString(),
          user: this.currentUser,
        },
      ],
    };

    this.projects.push(newProject);
    this.currentProject = newProject;
    
    this.logActivity(newProject.id, 'CREATE_PROJECT', 'PROJECT', newProject.id, `Proyecto "${newProject.name}" creado`);
    this.persistState();
    return newProject;
  }

  /** Actualiza la información de un proyecto */
  public updateProject(id: string, updates: Partial<Project>) {
    this.projects = this.projects.map((p) => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        if (this.currentProject?.id === id) this.currentProject = updated;
        return updated;
      }
      return p;
    });
    this.logActivity(id, 'UPDATE_PROJECT', 'PROJECT', id, `Configuración del proyecto actualizada`);
    this.persistState();
  }

  /** Elimina un proyecto */
  public deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.tasks = this.tasks.filter((t) => t.projectId !== id);
    this.chatMessages = this.chatMessages.filter((c) => c.projectId !== id);
    if (this.currentProject?.id === id) {
      this.currentProject = this.projects[0] || null;
    }
    this.persistState();
  }

  /** Agrega un miembro a un proyecto */
  public addMemberToProject(projectId: string, email: string, role: MemberRole) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    const newMemberUser: User = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
    };

    const newMembership = {
      id: 'mem_' + Date.now(),
      projectId,
      userId: newMemberUser.id,
      role,
      joinedAt: new Date().toISOString(),
      user: newMemberUser,
    };

    project.members = [...(project.members || []), newMembership];
    this.logActivity(projectId, 'ADD_MEMBER', 'MEMBER', newMemberUser.id, `Miembro ${email} añadido con rol ${role}`);
    this.persistState();
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS DE TAREAS
  // ---------------------------------------------------------------------------

  /** Crea una nueva tarea en el proyecto activo */
  public createTask(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
    estimatedHours?: number;
  }): Task {
    const projectId = this.currentProject?.id || 'proj_default';
    const projectKey = this.currentProject?.key || 'NEX';
    const projectTasksCount = this.tasks.filter((t) => t.projectId === projectId).length + 1;

    const newTask: Task = {
      id: 'tsk_' + Date.now(),
      key: `${projectKey}-${projectTasksCount}`,
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'MEDIA',
      status: data.status || 'PENDIENTE',
      estimatedHours: data.estimatedHours || 0,
      loggedHours: 0,
      position: projectTasksCount,
      dueDate: data.dueDate,
      tags: data.tags || [],
      projectId,
      assigneeId: data.assigneeId,
      creatorId: this.currentUser.id,
      assignee: data.assigneeId ? this.currentUser : undefined,
      creator: this.currentUser,
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.push(newTask);
    this.logActivity(projectId, 'CREATE_TASK', 'TASK', newTask.id, `Tarea "${newTask.title}" creada`);

    if (data.assigneeId) {
      this.createNotification(data.assigneeId, 'Tarea Asignada', `Se te asignó la tarea: ${newTask.title}`, 'TASK_ASSIGNED');
    }

    this.persistState();
    return newTask;
  }

  /** Actualiza los campos de una tarea */
  public updateTask(taskId: string, updates: Partial<Task>) {
    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        if (updates.status && updates.status !== t.status) {
          this.logActivity(t.projectId, 'CHANGE_STATUS', 'TASK', t.id, `Estado de "${t.title}" cambiado a ${updates.status}`);
        }
        return updated;
      }
      return t;
    });
    this.persistState();
  }

  /** Actualiza el orden y estado de una tarea tras un Drag & Drop en Kanban */
  public moveTaskStatus(taskId: string, newStatus: TaskStatus, newPosition: number) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.status = newStatus;
    task.position = newPosition;
    task.updatedAt = new Date().toISOString();

    this.logActivity(task.projectId, 'DRAG_TASK', 'TASK', taskId, `Tarea "${task.title}" movida a ${newStatus}`);
    this.persistState();
  }

  /** Elimina una tarea */
  public deleteTask(taskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      this.logActivity(task.projectId, 'DELETE_TASK', 'TASK', taskId, `Tarea "${task.title}" eliminada`);
    }
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.persistState();
  }

  /** Agrega una subtarea a una tarea */
  public addSubtask(taskId: string, title: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: 'sub_' + Date.now(),
      taskId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    task.subtasks = [...(task.subtasks || []), newSubtask];
    this.persistState();
  }

  /** Alterna el estado completado de una subtarea */
  public toggleSubtask(taskId: string, subtaskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    task.subtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    this.persistState();
  }

  /** Registra tiempo trabajado en una tarea */
  public logTimeWorked(taskId: string, hours: number) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.loggedHours = (task.loggedHours || 0) + hours;
    this.logActivity(task.projectId, 'LOG_TIME', 'TASK', taskId, `Registradas ${hours}h trabajadas en "${task.title}"`);
    this.persistState();
  }

  /** Agrega un comentario a una tarea */
  public addComment(taskId: string, content: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: 'cmt_' + Date.now(),
      taskId,
      authorId: this.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: this.currentUser,
    };

    task.comments = [...(task.comments || []), newComment];
    this.logActivity(task.projectId, 'ADD_COMMENT', 'TASK', taskId, `Nuevo comentario en "${task.title}"`);
    this.persistState();
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS DE CHAT EN TIEMPO REAL
  // ---------------------------------------------------------------------------

  /** Envia un mensaje al chat del proyecto */
  public sendChatMessage(content: string, parentId?: string): ChatMessage {
    const projectId = this.currentProject?.id || 'proj_default';

    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      projectId,
      senderId: this.currentUser.id,
      content,
      parentId,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: this.currentUser,
      reactions: [],
    };

    this.chatMessages.push(newMessage);
    this.persistState();
    return newMessage;
  }

  /** Agrega una reacción emoji a un mensaje */
  public toggleMessageReaction(messageId: string, emoji: string) {
    const msg = this.chatMessages.find((m) => m.id === messageId);
    if (!msg) return;

    msg.reactions = msg.reactions || [];
    const existing = msg.reactions.find((r) => r.userId === this.currentUser.id && r.emoji === emoji);

    if (existing) {
      msg.reactions = msg.reactions.filter((r) => r.id !== existing.id);
    } else {
      msg.reactions.push({
        id: 'rct_' + Date.now(),
        messageId,
        userId: this.currentUser.id,
        emoji,
        createdAt: new Date().toISOString(),
        user: this.currentUser,
      });
    }

    this.persistState();
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS DE ARCHIVOS
  // ---------------------------------------------------------------------------

  /** Registra un nuevo archivo adjunto subido al proyecto */
  public uploadFile(name: string, url: string, size: number, type: string, taskId?: string): Attachment {
    const projectId = this.currentProject?.id || 'proj_default';

    const newAttachment: Attachment = {
      id: 'att_' + Date.now(),
      name,
      url,
      size,
      type,
      taskId,
      projectId,
      uploaderId: this.currentUser.id,
      createdAt: new Date().toISOString(),
      uploader: this.currentUser,
    };

    this.attachments.push(newAttachment);
    this.logActivity(projectId, 'UPLOAD_FILE', 'FILE', newAttachment.id, `Archivo "${name}" subido al proyecto`);
    this.persistState();
    return newAttachment;
  }

  /** Elimina un archivo adjunto */
  public deleteFile(fileId: string) {
    this.attachments = this.attachments.filter((a) => a.id !== fileId);
    this.persistState();
  }

  // ---------------------------------------------------------------------------
  // NOTIFICACIONES E HISTORIAL
  // ---------------------------------------------------------------------------

  /** Genera una notificación */
  public createNotification(userId: string, title: string, message: string, type: 'TASK_ASSIGNED' | 'MENTION' | 'COMMENT' | 'SYSTEM' | 'INVITE') {
    const notif: NotificationItem = {
      id: 'ntf_' + Date.now(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    this.persistState();
  }

  /** Marca notificaciones como leídas */
  public markNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persistState();
  }

  /** Registra una acción en el historial de auditoría */
  private logActivity(projectId: string, action: string, entityType: 'TASK' | 'PROJECT' | 'CHAT' | 'FILE' | 'MEMBER', entityId: string, details: string) {
    const item: ActivityItem = {
      id: 'act_' + Date.now(),
      projectId,
      userId: this.currentUser.id,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
      user: this.currentUser,
    };
    this.activityLogs.unshift(item);
  }
}

export const store = NexoStore.getInstance();
