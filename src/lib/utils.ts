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

export function getStatusDetails(status: TaskStatus) {
  switch (status) {
    case 'PENDIENTE':
      return {
        label: 'Pendiente',
        bg: 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700/60 font-medium',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
    case 'EN_PROGRESO':
      return {
        label: 'En progreso',
        bg: 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800/60 font-medium',
        dot: 'bg-violet-600 dark:bg-violet-400 animate-pulse',
      };
    case 'EN_REVISION':
      return {
        label: 'En revisión',
        bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 font-medium',
        dot: 'bg-amber-600 dark:bg-amber-400',
      };
    case 'FINALIZADA':
      return {
        label: 'Finalizada',
        bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 font-medium',
        dot: 'bg-emerald-600 dark:bg-emerald-400',
      };
    case 'CANCELADA':
      return {
        label: 'Cancelada',
        bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60 font-medium',
        dot: 'bg-rose-600 dark:bg-rose-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700/60 font-medium',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
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
        bg: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/60 font-semibold',
        iconColor: 'text-red-600 dark:text-red-400',
      };
    case 'ALTA':
      return {
        label: 'Alta',
        bg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800/60 font-semibold',
        iconColor: 'text-orange-600 dark:text-orange-400',
      };
    case 'MEDIA':
      return {
        label: 'Media',
        bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60 font-semibold',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'BAJA':
    default:
      return {
        label: 'Baja',
        bg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700/60 font-semibold',
        iconColor: 'text-slate-600 dark:text-slate-400',
      };
  }
}

/**
 * Retorna la fecha local actual en formato YYYY-MM-DD para inputs de tipo date
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

