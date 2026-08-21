import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed de Base de Datos Nexor-Space ---');

  // 1. Crear o verificar Usuario Administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexor-space.app' },
    update: {},
    create: {
      id: 'usr_admin_1',
      name: 'Administrador Nexor-Space',
      email: 'admin@nexor-space.app',
      password: 'admin_password_hash',
      role: 'ADMIN',
      bio: 'Arquitecto Principal del Sistema Nexor-Space',
    },
  });

  // 2. Crear o verificar Usuario Alumno
  const studentUser = await prisma.user.upsert({
    where: { email: 'alumno@nexor-space.edu.ar' },
    update: {},
    create: {
      id: 'usr_student_1',
      name: 'Alumno Nexor-Space',
      email: 'alumno@nexor-space.edu.ar',
      password: 'student_password_hash',
      role: 'MEMBER',
      bio: 'Estudiante de 7mo Año',
    },
  });

  // 3. Crear Proyecto Principal
  const defaultProject = await prisma.project.upsert({
    where: { key: 'NEX' },
    update: {},
    create: {
      id: 'proj_demo_1',
      key: 'NEX',
      name: 'Proyecto Principal Nexor-Space',
      description: 'Espacio de trabajo centralizado para tareas, chat y archivos del equipo.',
      color: '#7C3AED',
      icon: 'FolderKanban',
      members: {
        create: [
          { userId: adminUser.id, role: 'ADMIN' },
          { userId: studentUser.id, role: 'MEMBER' },
        ],
      },
      tasks: {
        create: [
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
            creatorId: adminUser.id,
            tags: JSON.stringify(['Backend', 'DB', 'Prisma']),
            subtasks: {
              create: [
                { title: 'Crear esquema Prisma', completed: true },
                { title: 'Configurar cliente DB Singleton', completed: true },
              ],
            },
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
            position: 2,
            creatorId: adminUser.id,
            tags: JSON.stringify(['Frontend', 'React', 'Kanban']),
            subtasks: {
              create: [
                { title: 'Crear componentes de columna', completed: true },
                { title: 'Conectar manejador de arrastrar y soltar', completed: false },
              ],
            },
          },
          {
            id: 'tsk_3',
            key: 'NEX-3',
            title: 'Integrar asistente inteligente Nexor-Space AI',
            description: 'Desarrollar modal y respuestas automatizadas con IA para resumen de proyectos.',
            priority: 'MEDIA',
            status: 'EN_REVISION',
            estimatedHours: 6,
            loggedHours: 4,
            position: 3,
            creatorId: adminUser.id,
            tags: JSON.stringify(['AI', 'SaaS', 'Feature']),
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
            position: 4,
            creatorId: adminUser.id,
            tags: JSON.stringify(['CSS', 'UI', 'Performance']),
          },
        ],
      },
      messages: {
        create: [
          {
            id: 'msg_1',
            senderId: adminUser.id,
            content: '¡Bienvenidos al espacio de trabajo de Nexor-Space! Aquí podemos coordinar tareas, compartir archivos y chatear.',
          },
        ],
      },
    },
  });

  console.log('✅ Proyecto creado/conectado con ID:', defaultProject.id);
  console.log('--- Seed finalizado con éxito ---');
}

main()
  .catch((e) => {
    console.error('Error al ejecutar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
