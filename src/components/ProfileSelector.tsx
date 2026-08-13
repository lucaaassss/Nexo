'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, CheckCircle2 } from 'lucide-react';

export type UserRole = 'alumno' | 'profesor';

interface ProfileSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  error?: string;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  selectedRole,
  onSelectRole,
  error,
}) => {
  const roles: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    badgeText: string;
  }[] = [
    {
      id: 'alumno',
      title: 'Alumno',
      description: 'Accedé a tus proyectos y actividades.',
      icon: <GraduationCap className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
      badgeText: 'Estudiante',
    },
    {
      id: 'profesor',
      title: 'Profesor',
      description: 'Gestioná tus proyectos y equipos.',
      icon: <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      badgeText: 'Docente / Guía',
    },
  ];

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Seleccioná tu perfil <span className="text-violet-500">*</span>
        </label>
        {selectedRole && (
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 animate-fade-in">
            Perfil: {selectedRole === 'alumno' ? 'Alumno' : 'Profesor'}
          </span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Selección de Perfil"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectRole(role.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRole(role.id);
                }
              }}
              className={`relative flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 group ${
                isSelected
                  ? 'border-violet-600 dark:border-violet-500 bg-violet-50/80 dark:bg-violet-950/40 shadow-lg shadow-violet-500/10'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-850/70'
              }`}
            >
              {/* Highlight Indicator Background with Framer Motion */}
              {isSelected && (
                <motion.div
                  layoutId="profileHighlight"
                  className="absolute inset-0 rounded-xl bg-violet-500/5 dark:bg-violet-500/10 border-2 border-violet-600 dark:border-violet-500 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="flex items-start justify-between w-full mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      {role.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center">
                  {isSelected ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </motion.div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600" />
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
