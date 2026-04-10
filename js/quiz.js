/**
 * quiz.js — Lógica del Quiz "¿Por dónde empiezo?"
 */

(function () {
  'use strict';

  const WA_NUMBER = '573XXXXXXXXXX';

  const preguntas = [
    {
      id: 'vivienda',
      texto: '¿Qué tipo de vivienda tienes?',
      opciones: [
        { valor: 'casa', icono: '🏠', label: 'Casa' },
        { valor: 'apartamento', icono: '🏢', label: 'Apartamento' },
        { valor: 'local', icono: '🏭', label: 'Local u Oficina' }
      ]
    },
    {
      id: 'prioridad',
      texto: '¿Cuál es tu prioridad principal?',
      opciones: [
        { valor: 'seguridad', icono: '🔒', label: 'Seguridad' },
        { valor: 'confort', icono: '💡', label: 'Confort e iluminación' },
        { valor: 'ahorro', icono: '⚡', label: 'Ahorro energético' },
        { valor: 'todo', icono: '🎯', label: 'Todo lo anterior' }
      ]
    },
    {
      id: 'presupuesto',
      texto: '¿Cuál es tu presupuesto aproximado?',
      opciones: [
        { valor: 'menos2m', icono: '💰', label: 'Menos de $2M COP' },
        { valor: 'entre2m5m', icono: '💰💰', label: 'Entre $2M y $5M COP' },
        { valor: 'mas5m', icono: '💰💰💰', label: 'Más de $5M COP' }
      ]
    },
    {
      id: 'dispositivos',
      texto: '¿Ya tienes algún dispositivo inteligente?',
      opciones: [
        { valor: 'si', icono: '✅', label: 'Sí, tengo algo' },
        { valor: 'no', icono: '🚀', label: 'No, partiría desde cero' }
      ]
    }
  ];

  let pasoActual = 0;
  let respuestas = {};

  function calcularResultado(answers) {
    const { prioridad, presupuesto } = answers;
    if (prioridad === 'seguridad' && presupuesto === 'menos2m') {
      return {
        nombre: 'Pack Seguridad Básica',
        rango: '$1.8M – $2.8M COP',
        desc: 'Sensores de movimiento, cámaras IP y notificaciones en tiempo real. El punto de entrada ideal.'
      };
    }
    if (prioridad === 'seguridad') {
      return {
        nombre: 'Pack Seguridad Completa',
        rango: '$2.8M – $4.5M COP',
        desc: 'Sistema integral con cámaras 4K, acceso biométrico y alertas inteligentes.'
      };
    }
    if (prioridad === 'confort') {
      return {
        nombre: 'Pack Iluminación Inteligente',
        rango: '$1.5M – $3M COP',
        desc: 'Escenas personalizadas: cine, lectura, descanso. Control desde tu celular.'
      };
    }
    if (prioridad === 'ahorro') {
      return {
        nombre: 'Pack Eficiencia Energética',
        rango: '$2.5M – $4M COP',
        desc: 'Monitoreo de consumo y automatización que reduce tu factura de energía hasta un 30%.'
      };
    }
    if (prioridad === 'todo' && presupuesto === 'mas5m') {
      return {
        nombre: 'Pack Domótica Completa',
        rango: '$8M – $15M COP',
        desc: 'Automatización total: iluminación, seguridad, climatización, audio y control por voz.'
      };
    }
    return {
      nombre: 'Pack Entrada',
      rango: '$1.5M – $2.5M COP',
      desc: 'El primer paso para un hogar inteligente. Instalación rápida y sin obras.'
    };
  }

  function actualizarProgreso() {
    const total = preguntas.length;
    const pct = ((pasoActual) / total) * 100;
    const fill = document.querySelector('.quiz-progress-fill');
    const label = document.querySelector('.quiz-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = 'Pregunta ' + (pasoActual + 1) + ' de ' + total;
  }

  function mostrarPaso(index) {
    document.querySelectorAll('.quiz-step').forEach(function (el, i) {
      el.classList.toggle('active', i === index);
    });
    document.querySelector('.quiz-resultado').classList.remove('active');
    actualizarProgreso();
  }

  function mostrarResultado() {
    document.querySelectorAll('.quiz-step').forEach(function (el) {
      el.classList.remove('active');
    });

    const resultado = calcularResultado(respuestas);
    const contenedor = document.querySelector('.quiz-resultado');

    contenedor.querySelector('.resultado-nombre').textContent = resultado.nombre;
    contenedor.querySelector('.resultado-desc').textContent = resultado.desc;
    contenedor.querySelector('.resultado-inversion').textContent = '💰 ' + resultado.rango;

    const msgWA = encodeURIComponent(
      'Hola, Carlos! Completé el quiz de i-Homotic y me recomendaron el ' + resultado.nombre +
      ' (' + resultado.rango + '). Quiero más información.'
    );
    const btnWA = contenedor.querySelector('.btn-resultado-wa');
    if (btnWA) btnWA.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msgWA;

    const fill = document.querySelector('.quiz-progress-fill');
    if (fill) fill.style.width = '100%';
    const label = document.querySelector('.quiz-progress-label');
    if (label) label.textContent = '¡Listo! Tu resultado personalizado';

    contenedor.classList.add('active');
  }

  function construirPasos() {
    const contenedor = document.getElementById('quiz-pasos');
    if (!contenedor) return;

    preguntas.forEach(function (pregunta, idx) {
      const step = document.createElement('div');
      step.className = 'quiz-step' + (idx === 0 ? ' active' : '');
      step.setAttribute('data-step', idx);

      const titulo = document.createElement('h2');
      titulo.className = 'quiz-question';
      titulo.textContent = pregunta.texto;
      step.appendChild(titulo);

      const grid = document.createElement('div');
      grid.className = 'quiz-options';

      pregunta.opciones.forEach(function (opcion) {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.setAttribute('data-valor', opcion.valor);
        btn.type = 'button';

        const iconEl = document.createElement('span');
        iconEl.className = 'option-icon';
        iconEl.textContent = opcion.icono;

        const labelEl = document.createElement('span');
        labelEl.className = 'option-label';
        labelEl.textContent = opcion.label;

        btn.appendChild(iconEl);
        btn.appendChild(labelEl);

        btn.addEventListener('click', function () {
          // Deseleccionar otras opciones del mismo paso
          grid.querySelectorAll('.quiz-option').forEach(function (b) {
            b.classList.remove('selected');
          });
          btn.classList.add('selected');
          respuestas[pregunta.id] = opcion.valor;

          const btnSig = step.querySelector('.quiz-btn-next');
          if (btnSig) btnSig.disabled = false;
        });

        grid.appendChild(btn);
      });

      step.appendChild(grid);

      // Navegación
      const nav = document.createElement('div');
      nav.className = 'quiz-nav';

      if (idx > 0) {
        const btnBack = document.createElement('button');
        btnBack.className = 'quiz-btn-back';
        btnBack.type = 'button';
        btnBack.textContent = '← Anterior';
        btnBack.addEventListener('click', function () {
          pasoActual--;
          mostrarPaso(pasoActual);
        });
        nav.appendChild(btnBack);
      } else {
        nav.appendChild(document.createElement('span'));
      }

      const btnNext = document.createElement('button');
      btnNext.className = 'quiz-btn-next';
      btnNext.type = 'button';
      btnNext.textContent = idx < preguntas.length - 1 ? 'Siguiente →' : 'Ver mi resultado →';
      btnNext.disabled = true;

      // Si ya hay respuesta guardada para esta pregunta (al navegar atrás)
      if (respuestas[pregunta.id]) {
        btnNext.disabled = false;
      }

      btnNext.addEventListener('click', function () {
        if (pasoActual < preguntas.length - 1) {
          pasoActual++;
          mostrarPaso(pasoActual);
          // Restaurar estado del botón siguiente si ya había respuesta
          const sigStep = document.querySelectorAll('.quiz-step')[pasoActual];
          const sigPregunta = preguntas[pasoActual];
          const sigBtn = sigStep.querySelector('.quiz-btn-next');
          if (sigBtn && respuestas[sigPregunta.id]) {
            sigBtn.disabled = false;
            const opcionGuardada = sigStep.querySelector('[data-valor="' + respuestas[sigPregunta.id] + '"]');
            if (opcionGuardada) opcionGuardada.classList.add('selected');
          }
        } else {
          mostrarResultado();
        }
      });

      nav.appendChild(btnNext);
      step.appendChild(nav);
      contenedor.appendChild(step);
    });
  }

  function reiniciar() {
    pasoActual = 0;
    respuestas = {};
    // Limpiar selecciones
    document.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.classList.remove('selected');
    });
    document.querySelectorAll('.quiz-btn-next').forEach(function (btn) {
      btn.disabled = true;
    });
    document.querySelector('.quiz-resultado').classList.remove('active');
    mostrarPaso(0);
  }

  function init() {
    construirPasos();
    actualizarProgreso();

    const btnReiniciar = document.getElementById('btn-reiniciar');
    if (btnReiniciar) {
      btnReiniciar.addEventListener('click', reiniciar);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
