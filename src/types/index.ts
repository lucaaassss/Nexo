/**
 * Nexo SaaS Platform - Definitions & TypeScript Interfaces
 * Contiene todas las definiciones del modelo de dominio: Usuarios, Proyectos, Tareas, Chat, Archivos, Permisos e IA.
 */

// Roles de usuario dentro de un proyecto
export type MemberRole = 'ADMIN' | 'LEADER' | 'MEMBER' | 'GUEST';

// Estados posibles de una tarea
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'EN_REVISION' | 'FINALIZADA' | 'CANCELADA';

// Niveles de prioridad de una tarea
export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

// Modelo de Usuario
export interface User {
  id: string;
  email: string;
  name: string;
  nombre?: string;
  apellido?: string;
  usuario?: string;
  avatarUrl?: string;
  role: string;
  bio?: string;
  createdAt: string;
}

// Modelo de Proyecto
export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
}

// Integrante del Proyecto
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: User;
}

// Subtarea dentro de una tarea
export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Comentario en una tarea
export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

// Archivo Adjunto (en Tarea o Proyecto)
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  taskId?: string;
  projectId: string;
  uploaderId: string;
  createdAt: string;
  uploader?: User;
}

// Modelo Principal de Tarea
export interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  loggedHours: number;
  position: number;
  dueDate?: string;
  startDate?: string;
  tags: string[];
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  assignee?: User;
  creator?: User;
  subtasks?: Subtask[];
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Reacción con emoji en el chat
export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user?: User;
}

// Mensaje del Chat en Tiempo Real
export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  parentId?: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
  sender: User;
  reactions?: ChatReaction[];
  attachments?: Attachment[];
}

// Notificación de usuario
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'MENTION' | 'COMMENT' | 'SYSTEM' | 'INVITE';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

// Registro del Historial de Actividad (Audit Log)
export interface ActivityItem {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  entityType: 'TASK' | 'PROJECT' | 'CHAT' | 'FILE' | 'MEMBER';
  entityId: string;
  details: string;
  createdAt: string;
  user: User;
}

// Métricas de Analíticas del Proyecto
export interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  completionPercentage: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  tasksByPriority: {
    BAJA: number;
    MEDIA: number;
    ALTA: number;
    URGENTE: number;
  };
  teamActivityCount: number;
}

// Petición para funciones de IA
export interface AiRequestPayload {
  action: 'DECOMPOSE_PROJECT' | 'GENERATE_SUBTASKS' | 'ESTIMATE_TIME' | 'SUMMARIZE_CHAT' | 'PROJECT_QA';
  prompt?: string;
  context?: any;
}
