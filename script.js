/* ==========================================================
   NEXO - Lógica Interactiva (script.js)
   Modo Oscuro/Claro, Tablero Kanban Dinámico y Formularios
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initMetricsAnimation();
  initKanbanApp();
  initContactForm();
});

/* ----------------------------------------------------------
   1. Tema Oscuro / Claro
   ---------------------------------------------------------- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('nexo_theme') || 'dark';
  
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexo_theme', newTheme);
    });
  }
}

/* ----------------------------------------------------------
   2. Menú Móvil
   ---------------------------------------------------------- */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Cerrar al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

/* ----------------------------------------------------------
   3. Animación de Métricas en el Hero
   ---------------------------------------------------------- */
function initMetricsAnimation() {
  const metricElements = document.querySelectorAll('.metric-number');
  
  metricElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isDecimal = target % 1 !== 0;
    let current = 0;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    }, stepTime);
  });
}

/* ----------------------------------------------------------
   4. Tablero Kanban Dinámico
   ---------------------------------------------------------- */
let tasks = [
  { id: 1, title: 'Diseñar flujo de onboarding', desc: 'Definir los pasos clave para la experiencia del usuario.', priority: 'alta', status: 'todo' },
  { id: 2, title: 'Integrar pasarela de pagos', desc: 'Configurar webhooks y verificar respuestas exitosas.', priority: 'media', status: 'in-progress' },
  { id: 3, title: 'Configurar paleta de colores', desc: 'Armonizar tokens de diseño en dark/light mode.', priority: 'baja', status: 'done' }
];

let nextTaskId = 4;

function initKanbanApp() {
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskInput = document.getElementById('new-task-input');
  const prioritySelect = document.getElementById('task-priority-select');

  if (addTaskBtn && taskInput) {
    addTaskBtn.addEventListener('click', () => {
      const title = taskInput.value.trim();
      if (!title) {
        taskInput.focus();
        return;
      }

      const priority = prioritySelect.value;
      const newTask = {
        id: nextTaskId++,
        title: title,
        desc: 'Nueva actividad creada desde el panel interactivo.',
        priority: priority,
        status: 'todo'
      };

      tasks.push(newTask);
      taskInput.value = '';
      renderKanban();
    });

    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTaskBtn.click();
      }
    });
  }

  // Render inicial
  renderKanban();
}

function renderKanban() {
  const cardsTodo = document.getElementById('cards-todo');
  const cardsProgress = document.getElementById('cards-in-progress');
  const cardsDone = document.getElementById('cards-done');

  if (!cardsTodo || !cardsProgress || !cardsDone) return;

  // Limpiar columnas
  cardsTodo.innerHTML = '';
  cardsProgress.innerHTML = '';
  cardsDone.innerHTML = '';

  let countTodo = 0;
  let countProgress = 0;
  let countDone = 0;

  tasks.forEach(task => {
    const cardEl = document.createElement('div');
    cardEl.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
    cardEl.setAttribute('data-id', task.id);

    let buttonsHtml = '';
    if (task.status === 'todo') {
      countTodo++;
      buttonsHtml = `
        <button class="move-btn" onclick="moveTask(${task.id}, 'in-progress')" title="Mover a En Progreso">
          Avanzar <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
      cardEl.innerHTML = `
        <span class="task-tag tag-${task.priority}">${capitalize(task.priority)}</span>
        <h5>${escapeHtml(task.title)}</h5>
        <p>${escapeHtml(task.desc)}</p>
        <div class="card-footer">${buttonsHtml}</div>
      `;
      cardsTodo.appendChild(cardEl);
    } else if (task.status === 'in-progress') {
      countProgress++;
      buttonsHtml = `
        <button class="move-btn" onclick="moveTask(${task.id}, 'todo')" title="Regresar a Por Hacer">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="move-btn" onclick="moveTask(${task.id}, 'done')" title="Completar">
          Listo <i class="fa-solid fa-check"></i>
        </button>
      `;
      cardEl.innerHTML = `
        <span class="task-tag tag-${task.priority}">${capitalize(task.priority)}</span>
        <h5>${escapeHtml(task.title)}</h5>
        <p>${escapeHtml(task.desc)}</p>
        <div class="card-footer">${buttonsHtml}</div>
      `;
      cardsProgress.appendChild(cardEl);
    } else if (task.status === 'done') {
      countDone++;
      buttonsHtml = `
        <button class="move-btn" onclick="moveTask(${task.id}, 'in-progress')" title="Reabrir">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      cardEl.innerHTML = `
        <span class="task-tag tag-${task.priority}">${capitalize(task.priority)}</span>
        <h5>${escapeHtml(task.title)}</h5>
        <p>${escapeHtml(task.desc)}</p>
        <div class="card-footer">${buttonsHtml}</div>
      `;
      cardsDone.appendChild(cardEl);
    }
  });

  // Actualizar contadores
  const elCountTodo = document.getElementById('count-todo');
  const elCountProgress = document.getElementById('count-progress');
  const elCountDone = document.getElementById('count-done');
  const elTotalCount = document.getElementById('total-tasks-count');

  if (elCountTodo) elCountTodo.textContent = countTodo;
  if (elCountProgress) elCountProgress.textContent = countProgress;
  if (elCountDone) elCountDone.textContent = countDone;
  if (elTotalCount) elTotalCount.textContent = tasks.length;
}

// Funciones globales expuestas al window para los onclick
window.moveTask = function(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    renderKanban();
  }
};

window.deleteTask = function(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  renderKanban();
};

/* ----------------------------------------------------------
   5. Formulario de Contacto
   ---------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const feedbackEl = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm && feedbackEl) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      }

      setTimeout(() => {
        const name = document.getElementById('name').value;
        feedbackEl.className = 'form-feedback success';
        feedbackEl.innerHTML = `<strong>¡Gracias, ${escapeHtml(name)}!</strong> Tu solicitud ha sido recibida. Nos pondremos en contacto a la brevedad.`;
        
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Enviar Solicitud</span> <i class="fa-solid fa-paper-plane"></i>';
        }

        setTimeout(() => {
          feedbackEl.style.display = 'none';
        }, 6000);
      }, 900);
    });
  }
}

/* Helpers */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
