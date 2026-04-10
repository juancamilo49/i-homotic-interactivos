/**
 * contacto.js — Formulario de Contacto con validación y webhook
 */

(function () {
  'use strict';

  const WA_NUMBER = '573XXXXXXXXXX';
  const WEBHOOK_URL = 'https://auto.lubrifrenosnacional.com/webhook/0238ce80-7f1b-47da-aec0-17370f3e3429';

  async function enviarFormulario(datos) {
    const payload = {
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      ciudad: datos.ciudad || '',
      interes: datos.interes,
      mensaje: datos.mensaje || '',
      timestamp: new Date().toISOString(),
      source: 'i-homotic-interactivos'
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  }

  function limpiarError(campo) {
    campo.classList.remove('campo-error');
    campo.removeAttribute('aria-invalid');
    const errorMsg = campo.parentElement.querySelector('.error-msg');
    if (errorMsg) errorMsg.remove();
  }

  function mostrarError(campo, mensaje) {
    limpiarError(campo);
    campo.classList.add('campo-error');
    campo.setAttribute('aria-invalid', 'true');
    const msg = document.createElement('p');
    msg.className = 'error-msg';
    msg.setAttribute('role', 'alert');
    msg.textContent = '⚠ ' + mensaje;
    campo.parentElement.appendChild(msg);
  }

  function validar(datos, form) {
    let valido = true;

    // Nombre
    const campoNombre = form.querySelector('#nombre');
    if (!datos.nombre || datos.nombre.trim() === '') {
      mostrarError(campoNombre, 'Por favor ingresa tu nombre completo.');
      valido = false;
    } else {
      limpiarError(campoNombre);
    }

    // Email
    const campoEmail = form.querySelector('#email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !emailRegex.test(datos.email)) {
      mostrarError(campoEmail, 'Ingresa un correo electrónico válido.');
      valido = false;
    } else {
      limpiarError(campoEmail);
    }

    // Teléfono
    const campoTel = form.querySelector('#telefono');
    const telLimpio = (datos.telefono || '').replace(/\D/g, '');
    if (!datos.telefono || telLimpio.length < 7) {
      mostrarError(campoTel, 'Ingresa un número de teléfono válido (mín. 7 dígitos).');
      valido = false;
    } else {
      limpiarError(campoTel);
    }

    // Interés
    const interesContainer = form.querySelector('.interes-grupo');
    const errorInteresExistente = interesContainer.parentElement.querySelector('.error-msg');
    if (!datos.interes) {
      if (!errorInteresExistente) {
        const msg = document.createElement('p');
        msg.className = 'error-msg';
        msg.setAttribute('role', 'alert');
        msg.textContent = '⚠ Selecciona al menos una opción de interés.';
        interesContainer.parentElement.appendChild(msg);
      }
      interesContainer.querySelectorAll('.interes-btn').forEach(function (b) {
        b.classList.add('interes-error');
      });
      valido = false;
    } else {
      if (errorInteresExistente) errorInteresExistente.remove();
      interesContainer.querySelectorAll('.interes-btn').forEach(function (b) {
        b.classList.remove('interes-error');
      });
    }

    return valido;
  }

  function setEstado(form, estado) {
    const btn = form.querySelector('.btn-submit');
    const spinner = btn.querySelector('.spinner');
    const btnText = btn.querySelector('.btn-text');

    if (estado === 'loading') {
      form.classList.add('form-loading');
      btn.disabled = true;
      if (spinner) spinner.style.display = 'block';
      if (btnText) btnText.textContent = 'Enviando...';
    } else {
      form.classList.remove('form-loading');
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = 'Enviar solicitud';
    }
  }

  function init() {
    const form = document.getElementById('contacto-form');
    if (!form) return;

    let interesSeleccionado = null;

    // Botones de interés
    const interesButtons = form.querySelectorAll('.interes-btn');
    interesButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        interesButtons.forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        interesSeleccionado = btn.getAttribute('data-valor');

        // Limpiar error de interés
        const errorInteresExistente = btn.closest('.campo-grupo').querySelector('.error-msg');
        if (errorInteresExistente) errorInteresExistente.remove();
        interesButtons.forEach(function (b) {
          b.classList.remove('interes-error');
        });
      });
    });

    // Limpiar errores al escribir
    form.querySelectorAll('.campo-input').forEach(function (campo) {
      campo.addEventListener('input', function () {
        limpiarError(campo);
      });
    });

    // Contador de caracteres para mensaje
    const campoMensaje = form.querySelector('#mensaje');
    const contador = form.querySelector('#contador-mensaje');
    if (campoMensaje && contador) {
      campoMensaje.addEventListener('input', function () {
        contador.textContent = campoMensaje.value.length + ' / 300 caracteres';
      });
    }

    // Submit
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const datos = {
        nombre: form.querySelector('#nombre').value.trim(),
        email: form.querySelector('#email').value.trim(),
        telefono: form.querySelector('#telefono').value.trim(),
        ciudad: form.querySelector('#ciudad').value.trim(),
        interes: interesSeleccionado,
        mensaje: form.querySelector('#mensaje').value.trim()
      };

      if (!validar(datos, form)) return;

      setEstado(form, 'loading');

      // Ocultar error general previo
      const errorGeneral = document.getElementById('form-error-general');
      if (errorGeneral) {
        errorGeneral.classList.remove('visible');
      }

      try {
        const ok = await enviarFormulario(datos);

        if (ok) {
          // Mostrar éxito
          form.style.display = 'none';
          const success = document.getElementById('form-success');
          if (success) {
            success.classList.add('visible');
            const msgWA = encodeURIComponent(
              'Hola Carlos! Ya envié el formulario de contacto en i-Homotic. ' +
              'Mi nombre es ' + datos.nombre + ' y mi interés es: ' + datos.interes + '.'
            );
            const btnWA = success.querySelector('#success-btn-wa');
            if (btnWA) btnWA.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msgWA;
          }
        } else {
          throw new Error('Respuesta no OK');
        }
      } catch (err) {
        setEstado(form, 'idle');
        if (errorGeneral) {
          errorGeneral.classList.add('visible');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
