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
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Estado Central Reactivo de Nexor-Space (In-Memory + Database API Persistence Store)
 * Administra el estado global de la sesión, proyectos activos, tareas, chat,
 * notificaciones, archivos e historial de actividad sincronizados con la Base de Datos.
 */

// Usuario por defecto para el inicio de sesión inicial
export const DEFAULT_USER: User = {
  id: 'usr_admin_1',
  name: 'Administrador Nexor-Space',
  email: 'admin@nexor-space.app',
  usuario: 'admin_nexorspace',
  avatarUrl: '',
  role: 'ADMIN',
  bio: 'Arquitecto Principal del Sistema Nexor-Space',
  createdAt: new Date().toISOString(),
};

export class NexorSpaceStore {
  private static instance: NexorSpaceStore;
  
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

  public static getInstance(): NexorSpaceStore {
    if (!NexorSpaceStore.instance) {
      NexorSpaceStore.instance = new NexorSpaceStore();
    }
    return NexorSpaceStore.instance;
  }

  /** Carga el estado inicial y sincroniza con la base de datos */
  public initClientState() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.isInitialized = true;
      this.loadInitialState();
      this.syncWithDatabase();
      this.notify();
    }
  }

  /** Sincroniza proyectos y tareas desde la base de datos (Supabase prioritario) */
  public async syncWithDatabase() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Intentar obtener proyectos directamente desde Supabase si está configurado
      if (isSupabaseConfigured) {
        // Obtenemos los proyectos donde el creador sea el usuario actual
        const { data: supaProjects, error } = await supabase
          .from('proyectos')
          .select('*')
          .eq('creador_id', this.currentUser.id)
          .order('fecha_creacion', { ascending: false });
        if (!error && Array.isArray(supaProjects) && supaProjects.length > 0) {
          const formattedProjects: Project[] = supaProjects.map((p: any) => {
            const rawKey = p.nombre
              ? p.nombre.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRJ'
              : 'PRJ';

            return {
              id: String(p.id),
              key: rawKey,
              name: p.nombre || 'Sin nombre',
              description: p.descripcion || '',
              color: p.color || '#7C3AED',
              icon: 'FolderKanban',
              isArchived: p.estado === 'ARCHIVADO' || p.estado === 'INACTIVO',
              createdAt: p.fecha_creacion ? new Date(p.fecha_creacion).toISOString() : new Date().toISOString(),
              updatedAt: p.fecha_actualizacion ? new Date(p.fecha_actualizacion).toISOString() : new Date().toISOString(),
              members: [
                {
                  id: 'mem_' + p.id,
                  projectId: String(p.id),
                  userId: p.creador_id || this.currentUser.id,
                  role: 'ADMIN' as MemberRole,
                  joinedAt: p.fecha_creacion ? new Date(p.fecha_creacion).toISOString() : new Date().toISOString(),
                  user: this.currentUser,
                },
              ],
            };
          });

          this.projects = formattedProjects;

          if (!this.currentProject || !this.projects.some((p) => p.id === this.currentProject?.id)) {
            this.currentProject = this.projects[0];
          } else {
            const updatedCurrent = this.projects.find((p) => p.id === this.currentProject?.id);
            if (updatedCurrent) this.currentProject = updatedCurrent;
          }

          this.persistState();
          this.notify();
          return;
        } else if (!error && Array.isArray(supaProjects) && supaProjects.length === 0) {
          // Si Supabase devuelve 0 proyectos, limpiamos el estado
          this.projects = [];
          this.currentProject = null;
          this.tasks = [];
          this.persistState();
          this.notify();
          return;
        }
      }

      // 2. Fallback: Obtener proyectos desde la API local pasando el userId
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(this.currentUser.id)}`);
      if (res.ok) {
        const dbProjects = await res.json();
        if (Array.isArray(dbProjects) && dbProjects.length > 0) {
          const formattedProjects: Project[] = dbProjects.map((p: any) => ({
            id: p.id,
            key: p.key,
            name: p.name,
            description: p.description || '',
            color: p.color || '#7C3AED',
            icon: p.icon || 'FolderKanban',
            isArchived: Boolean(p.isArchived),
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
            members: (p.members || []).map((m: any) => ({
              id: m.id,
              projectId: m.projectId,
              userId: m.userId,
              role: m.role as MemberRole,
              joinedAt: m.joinedAt ? new Date(m.joinedAt).toISOString() : new Date().toISOString(),
              user: m.user ? {
                id: m.user.id,
                email: m.user.email,
                name: m.user.name,
                role: m.user.role,
                avatarUrl: m.user.avatarUrl || '',
                createdAt: m.user.createdAt || new Date().toISOString(),
              } : DEFAULT_USER,
            })),
          }));

          this.projects = formattedProjects;

          // Mantener o seleccionar proyecto activo
          if (!this.currentProject || !this.projects.some((p) => p.id === this.currentProject?.id)) {
            this.currentProject = this.projects[0];
          } else {
            const updatedCurrent = this.projects.find((p) => p.id === this.currentProject?.id);
            if (updatedCurrent) this.currentProject = updatedCurrent;
          }

          // Cargar tareas del proyecto activo desde la base de datos
          if (this.currentProject?.id) {
            await this.fetchTasksForProject(this.currentProject.id);
          }

          this.persistState();
          this.notify();
        } else if (Array.isArray(dbProjects) && dbProjects.length === 0) {
          // Si la API devuelve 0 proyectos, limpiamos el estado
          this.projects = [];
          this.currentProject = null;
          this.tasks = [];
          this.persistState();
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Sincronización con base de datos en modo offline:', err);
    }
  }

  /** Carga tareas de un proyecto desde la base de datos */
  public async fetchTasksForProject(projectId: string) {
    try {
      const res = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);
      if (res.ok) {
        const dbTasks = await res.json();
        if (Array.isArray(dbTasks)) {
          const formattedTasks: Task[] = dbTasks.map((t: any) => {
            let parsedTags: string[] = [];
            if (Array.isArray(t.tags)) {
              parsedTags = t.tags;
            } else if (typeof t.tags === 'string') {
              try {
                parsedTags = JSON.parse(t.tags);
              } catch {
                parsedTags = t.tags ? [t.tags] : [];
              }
            }

            return {
              id: t.id,
              key: t.key,
              title: t.title,
              description: t.description || '',
              priority: t.priority as TaskPriority,
              status: t.status as TaskStatus,
              estimatedHours: t.estimatedHours || 0,
              loggedHours: t.loggedHours || 0,
              position: t.position || 0,
              dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : undefined,
              startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : undefined,
              tags: parsedTags,
              projectId: t.projectId,
              assigneeId: t.assigneeId || undefined,
              creatorId: t.creatorId,
              assignee: t.assignee,
              creator: t.creator,
              subtasks: (t.subtasks || []).map((s: any) => ({
                id: s.id,
                taskId: s.taskId,
                title: s.title,
                completed: Boolean(s.completed),
                createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
              })),
              comments: (t.comments || []).map((c: any) => ({
                id: c.id,
                taskId: c.taskId,
                authorId: c.authorId,
                content: c.content,
                createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
                author: c.author || DEFAULT_USER,
              })),
              attachments: (t.attachments || []).map((a: any) => ({
                id: a.id,
                name: a.name,
                url: a.url,
                size: a.size || 0,
                type: a.type || 'file',
                taskId: a.taskId,
                projectId: a.projectId,
                uploaderId: a.uploaderId,
                createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
              })),
              createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
            };
          });

          // Combinar tareas existentes de otros proyectos con las recibidas
          const otherTasks = this.tasks.filter((t) => t.projectId !== projectId);
          this.tasks = [...otherTasks, ...formattedTasks];
          this.persistState();
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Error al cargar tareas de la base de datos:', err);
    }
  }

  /** Carga el estado guardado localmente si existe */
  private loadInitialState() {
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('nexorspace_projects');
        const savedTasks = localStorage.getItem('nexorspace_tasks');
        const savedChat = localStorage.getItem('nexorspace_chat');
        const savedFiles = localStorage.getItem('nexorspace_files');
        const savedLogs = localStorage.getItem('nexorspace_activity');
        const savedNotifs = localStorage.getItem('nexorspace_notifications');
        const savedUser = localStorage.getItem('nexorspace_current_user');

        if (savedUser) {
          try {
            this.currentUser = JSON.parse(savedUser);
          } catch(e) {
            console.error('Error parsing saved user', e);
          }
        }
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
            name: 'Proyecto Principal Nexor-Space',
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

          this.projects = [defaultProj];
          this.currentProject = defaultProj;
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
        localStorage.setItem('nexorspace_projects', JSON.stringify(this.projects));
        localStorage.setItem('nexorspace_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('nexorspace_chat', JSON.stringify(this.chatMessages));
        localStorage.setItem('nexorspace_files', JSON.stringify(this.attachments));
        localStorage.setItem('nexorspace_activity', JSON.stringify(this.activityLogs));
        localStorage.setItem('nexorspace_notifications', JSON.stringify(this.notifications));
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nexorspace_current_user', JSON.stringify(user));
      } catch (e) {}
    }
    this.notify();
  }

  /** Actualiza los datos de perfil del usuario en Supabase Auth y tabla usuarios */
  public async updateUserProfile(data: {
    nombre: string;
    apellido: string;
    usuario: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const fullName = `${data.nombre} ${data.apellido}`.trim();
    const updatedUser: User = {
      ...this.currentUser,
      name: fullName || data.nombre || this.currentUser.name,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : this.currentUser.avatarUrl,
      bio: data.bio !== undefined ? data.bio : this.currentUser.bio,
    };

    this.setCurrentUser(updatedUser);

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user;
        const targetUserId = authUser?.id || (!this.currentUser.id.startsWith('usr_admin') ? this.currentUser.id : null);

        // 1. Actualizar metadata en Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            usuario: data.usuario,
            foto_perfil: data.avatarUrl || '',
            avatar_url: data.avatarUrl || '',
            bio: data.bio,
            name: fullName,
          },
        });

        if (authError) {
          console.warn('Error al actualizar metadata en Supabase Auth:', authError.message);
        }

        // 2. Actualizar o insertar en la tabla 'usuarios' de Supabase
        if (targetUserId) {
          const { error: tableError } = await supabase.from('usuarios').upsert({
            id: targetUserId,
            nombre: data.nombre,
            apellido: data.apellido,
            usuario: data.usuario,
            email: authUser?.email || this.currentUser.email,
            foto_perfil: data.avatarUrl || '',
            estado: 'activo',
          });

          if (tableError) {
            console.warn('Error al actualizar tabla usuarios en Supabase:', tableError.message);
            if (tableError.code === '42501' || tableError.message?.includes('row-level security')) {
              return {
                success: false,
                error: 'Falta habilitar la política RLS en Supabase para la tabla usuarios (Permiso denegado por Row-Level Security).',
              };
            }
            return { success: false, error: tableError.message };
          }
        }

        return { success: true };
      } catch (err: any) {
        console.error('Error general al actualizar perfil:', err);
        return { success: false, error: err.message || 'Error al guardar perfil' };
      }
    }

    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS DE PROYECTO
  // ---------------------------------------------------------------------------

  /** Selecciona el proyecto activo actual y carga sus tareas desde la base de datos */
  public setCurrentProject(projectId: string) {
    const found = this.projects.find((p) => p.id === projectId);
    if (found) {
      this.currentProject = found;
      this.fetchTasksForProject(projectId);
      this.notify();
    }
  }

  /** Crea un nuevo proyecto y lo persiste en la base de datos */
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

    // Persistir en la Base de Datos (Prisma SQLite / API)
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description || '',
        color: data.color || '#7C3AED',
        icon: data.icon || 'FolderKanban',
        creatorId: this.currentUser.id,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((savedProject) => {
        if (savedProject && savedProject.id) {
          // Actualizar ID asignado por la base de datos
          newProject.id = savedProject.id;
          this.persistState();
        }
      })
      .catch((e) => console.warn('Error al persistir proyecto en base de datos:', e));

    // Si Supabase está disponible, guardar en tabla 'proyectos'
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const creatorId = session?.user?.id || (this.currentUser.id.startsWith('usr_') ? null : this.currentUser.id);

        supabase
          .from('proyectos')
          .insert({
            nombre: data.name,
            descripcion: data.description || '',
            color: data.color || '#7C3AED',
            creador_id: creatorId,
            estado: 'activo',
          })
          .select()
          .then(({ data: inserted, error }) => {
            if (error) {
              console.warn('Error al persistir proyecto en Supabase:', error.message);
            } else if (inserted && inserted[0]) {
              const supaItem = inserted[0];
              newProject.id = String(supaItem.id);
              this.persistState();
              this.notify();
            }
          });
      });
    }

    return newProject;
  }

  /** Actualiza la información de un proyecto en memoria y en la base de datos */
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

    // Actualizar en Supabase si está disponible
    if (isSupabaseConfigured) {
      supabase
        .from('proyectos')
        .update({
          ...(updates.name && { nombre: updates.name }),
          ...(updates.description !== undefined && { descripcion: updates.description }),
          ...(updates.color && { color: updates.color }),
          ...(updates.isArchived !== undefined && { estado: updates.isArchived ? 'inactivo' : 'activo' }),
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Error al actualizar proyecto en Supabase:', error.message);
        });
    }

    // Persistir en la API local
    fetch('/api/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch((e) => console.warn('Error al actualizar proyecto en base de datos:', e));
  }

  /** Elimina un proyecto de la base de datos y memoria */
  public deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.tasks = this.tasks.filter((t) => t.projectId !== id);
    this.chatMessages = this.chatMessages.filter((c) => c.projectId !== id);
    if (this.currentProject?.id === id) {
      this.currentProject = this.projects[0] || null;
    }
    this.persistState();

    // Eliminar de Supabase si está disponible
    if (isSupabaseConfigured) {
      supabase
        .from('proyectos')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Error al eliminar proyecto de Supabase:', error.message);
        });
    }

    // Eliminar de la base de datos local
    fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Error al eliminar proyecto en base de datos:', e));
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

  /** Crea una nueva tarea en el proyecto activo y la persiste en la base de datos */
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

    // Persistir en la base de datos
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'MEDIA',
        status: data.status || 'PENDIENTE',
        projectId,
        creatorId: this.currentUser.id,
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null,
        estimatedHours: data.estimatedHours || 0,
        tags: data.tags || [],
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((savedTask) => {
        if (savedTask && savedTask.id) {
          newTask.id = savedTask.id;
          if (savedTask.key) newTask.key = savedTask.key;
          this.persistState();
        }
      })
      .catch((e) => console.warn('Error persistiendo tarea en base de datos:', e));

    return newTask;
  }

  /** Actualiza los campos de una tarea en memoria y base de datos */
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

    // Actualizar en base de datos
    fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, ...updates }),
    }).catch((e) => console.warn('Error al actualizar tarea en base de datos:', e));
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

    // Actualizar en la base de datos
    fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus, position: newPosition }),
    }).catch((e) => console.warn('Error al mover tarea en base de datos:', e));
  }

  /** Elimina una tarea de la base de datos y memoria */
  public deleteTask(taskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      this.logActivity(task.projectId, 'DELETE_TASK', 'TASK', taskId, `Tarea "${task.title}" eliminada`);
    }
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.persistState();

    // Eliminar de base de datos
    fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Error al eliminar tarea de base de datos:', e));
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

    fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, loggedHours: task.loggedHours }),
    }).catch((e) => console.warn('Error actualizando horas trabajadas:', e));
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

    // Persistir en API de chat
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        senderId: this.currentUser.id,
        content,
        parentId,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => {
        if (saved && saved.id) {
          newMessage.id = saved.id;
          this.persistState();
        }
      })
      .catch((e) => console.warn('Error al guardar mensaje en base de datos:', e));

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

export const store = NexorSpaceStore.getInstance();
