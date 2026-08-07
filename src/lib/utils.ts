import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '@/types';

/**
 * Utilidades generales para Nexo SaaS
 */

/**
 * Combina clases de Tailwind de forma dinámica resolviendo conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha ISO a formato en español legible (ej. 15 de Ago, 2026)
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una fecha y hora (ej. 15 de Ago, 14:30)
 */
export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea el tamaño de archivo en bytes a unidades legibles (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Obtiene las iniciales de un nombre completo para el Avatar
 */
export function getInitials(name: string): string {
  if (!name) return 'NX';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Retorna las clases CSS y etiqueta legible para los estados de tareas
 */
export function getStatusDetails(status: TaskStatus) {
  switch (status) {
    case 'PENDIENTE':
      return {
        label: 'Pendiente',
        bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        dot: 'bg-zinc-400',
      };
    case 'EN_PROGRESO':
      return {
        label: 'En progreso',
        bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        dot: 'bg-violet-400 animate-pulse',
      };
    case 'EN_REVISION':
      return {
        label: 'En revisión',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'FINALIZADA':
      return {
        label: 'Finalizada',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'CANCELADA':
      return {
        label: 'Cancelada',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        dot: 'bg-zinc-400',
      };
  }
}

/**
 * Retorna las clases CSS y etiqueta legible para las prioridades de tareas
 */
export function getPriorityDetails(priority: TaskPriority) {
  switch (priority) {
    case 'URGENTE':
      return {
        label: 'Urgente',
        bg: 'bg-red-500/15 text-red-400 border-red-500/30',
        iconColor: 'text-red-400',
      };
    case 'ALTA':
      return {
        label: 'Alta',
        bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        iconColor: 'text-orange-400',
      };
    case 'MEDIA':
      return {
        label: 'Media',
        bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        iconColor: 'text-indigo-400',
      };
    case 'BAJA':
    default:
      return {
        label: 'Baja',
        bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        iconColor: 'text-slate-400',
      };
  }
}
