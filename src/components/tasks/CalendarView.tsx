'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Task } from '@/types';
import { getStatusDetails } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask?: (dateStr?: string) => void;
}

/**
 * Componente CalendarView
 * Vista de calendario mensual para planificar entregas según la fecha límite.
 */
export function CalendarView({ tasks, onSelectTask, onOpenNewTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Calcular primer día y cantidad de días del mes
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      {/* Controles de Navegación del Calendario */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-violet-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-800"
          >
            Hoy
          </button>
          <button
            onClick={prevMonth}
            title="Mes anterior"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            title="Mes siguiente"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onOpenNewTask && (
            <button
              onClick={() => onOpenNewTask()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarea</span>
            </button>
          )}
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-[11px] font-semibold text-zinc-500 uppercase py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid del Mes */}
      <div className="grid grid-cols-7 gap-2">
        {paddingDays.map((_, index) => (
          <div key={`pad-${index}`} className="min-h-[90px] rounded-xl bg-zinc-950/20 border border-transparent" />
        ))}

        {daysArray.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = tasks.filter(
            (t) => t.dueDate && t.dueDate.startsWith(dateStr)
          );

          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className={`min-h-[105px] p-2 rounded-xl border flex flex-col justify-between transition-all group relative ${
                isToday
                  ? 'bg-violet-950/20 border-violet-500/50 shadow-md ring-1 ring-violet-500/30'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${isToday ? 'text-violet-400 font-bold' : 'text-zinc-400'}`}>
                  {day}
                </span>

                {onOpenNewTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewTask(dateStr);
                    }}
                    title={`Crear tarea para el ${day} de ${monthNames[month]}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-violet-600/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[70px] flex-1">
                {dayTasks.map((t) => {
                  const status = getStatusDetails(t.status);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`p-1.5 rounded-lg border text-[10px] truncate cursor-pointer font-medium hover:scale-102 transition-transform ${status.bg}`}
                    >
                      {t.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
