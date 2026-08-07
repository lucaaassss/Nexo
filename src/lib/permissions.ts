import { MemberRole } from '@/types';

/**
 * Módulo de Control de Acceso Basado en Roles (RBAC) para Nexo
 * Define qué acciones puede realizar un usuario según su rol en el proyecto.
 */

export interface Permissions {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageMembers: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canComment: boolean;
  canSendChatMessage: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canUseAi: boolean;
}

/**
 * Obtiene el mapa de permisos correspondiente a un rol de proyecto.
 * @param role Rol del integrante (ADMIN, LEADER, MEMBER, GUEST)
 */
export function getRolePermissions(role: MemberRole): Permissions {
  switch (role) {
    case 'ADMIN':
      return {
        canEditProject: true,
        canDeleteProject: true,
        canManageMembers: true,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canComment: true,
        canSendChatMessage: true,
        canUploadFiles: true,
        canDeleteFiles: true,
        canUseAi: true,
      };

    case 'LEADER':
      return {
        canEditProject: true,
        canDeleteProject: false,
        canManageMembers: true,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canComment: true,
        canSendChatMessage: true,
        canUploadFiles: true,
        canDeleteFiles: true,
        canUseAi: true,
      };

    case 'MEMBER':
      return {
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: false,
        canComment: true,
        canSendChatMessage: true,
        canUploadFiles: true,
        canDeleteFiles: false,
        canUseAi: true,
      };

    case 'GUEST':
    default:
      return {
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTask: false,
        canEditTask: false,
        canDeleteTask: false,
        canComment: true,
        canSendChatMessage: true,
        canUploadFiles: false,
        canDeleteFiles: false,
        canUseAi: false,
      };
  }
}
