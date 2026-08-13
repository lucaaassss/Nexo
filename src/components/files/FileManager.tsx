'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Film,
  Code,
  Download,
  Trash2,
  Search,
  Folder,
} from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';
import { formatFileSize, formatDate } from '@/lib/utils';
import { Attachment } from '@/types';

/**
 * Componente FileManager
 * Almacenamiento seguro de archivos del proyecto con filtros por tipo, subida interactiva y vista previa.
 */
export function FileManager() {
  const { projectAttachments, uploadFile, deleteFile, currentProject } = useNexo();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  /** Procesa la subida de un nuevo archivo */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fakeUrl = URL.createObjectURL(file);
      uploadFile(file.name, fakeUrl, file.size, file.type);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fakeUrl = URL.createObjectURL(file);
      uploadFile(file.name, fakeUrl, file.size, file.type);
    }
  };

  /** Resuelve el icono adecuado según el tipo MIME del archivo */
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-purple-400" />;
    if (type.startsWith('video/')) return <Film className="w-6 h-6 text-indigo-400" />;
    if (type.includes('json') || type.includes('javascript') || type.includes('html'))
      return <Code className="w-6 h-6 text-emerald-400" />;
    return <FileText className="w-6 h-6 text-violet-400" />;
  };

  const filteredAttachments = projectAttachments
    .filter((a) => (filterType === 'ALL' ? true : a.type.toLowerCase().includes(filterType.toLowerCase())))
    .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Zona de Carga Drag & Drop */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-8 border-2 border-dashed border-zinc-800 hover:border-violet-500/50 rounded-3xl bg-zinc-950/40 flex flex-col items-center justify-center text-center transition-all group"
      >
        <div className="p-4 rounded-2xl bg-violet-600/10 text-violet-400 group-hover:scale-110 transition-transform mb-3 border border-violet-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 mb-1">
          Arrastra y suelta tus archivos aquí
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Admite imágenes, documentos PDF, videos y archivos de código hasta 100MB
        </p>
        <label className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 cursor-pointer transition-all">
          Seleccionar Archivos
          <input type="file" multiple onChange={handleFileInput} className="hidden" />
        </label>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'image', 'pdf', 'video', 'code'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filterType === type
                  ? 'bg-violet-600 text-white font-semibold shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {type === 'ALL' ? 'Todos los Archivos' : type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar archivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Grilla de Archivos */}
      {filteredAttachments.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 border border-zinc-800/80 rounded-2xl bg-zinc-950/20">
          <Folder className="w-10 h-10 mx-auto mb-2 opacity-40 text-violet-400" />
          <p className="text-xs">No hay archivos subidos en este proyecto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttachments.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-violet-500/40 flex flex-col justify-between space-y-3 group transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-100 truncate group-hover:text-violet-300">
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => deleteFile(file.id)}
                  title="Eliminar archivo"
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                <span>{formatDate(file.createdAt)}</span>
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-medium"
                >
                  <Download className="w-3 h-3" />
                  Descargar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
