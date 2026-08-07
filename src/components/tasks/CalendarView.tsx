'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '@/types';
import { getStatusDetails, getPriorityDetails } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

/**
 * Componente CalendarView
 * Vista de calendario mensual para planificar entregas según la fecha límite.
 */
export function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
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

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      {/* Controles de Navegación del Calendario */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-violet-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
              className={`min-h-[100px] p-2 rounded-xl border flex flex-col justify-start transition-all ${
                isToday
                  ? 'bg-violet-950/20 border-violet-500/50 shadow-md ring-1 ring-violet-500/30'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/40'
              }`}
            >
              <span className={`text-xs font-semibold mb-1 ${isToday ? 'text-violet-400 font-bold' : 'text-zinc-400'}`}>
                {day}
              </span>

              <div className="space-y-1 overflow-y-auto max-h-[70px]">
                {dayTasks.map((t) => {
                  const status = getStatusDetails(t.status);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`p-1.5 rounded-lg border text-[10px] truncate cursor-pointer font-medium hover:scale-105 transition-transform ${status.bg}`}
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
