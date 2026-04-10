/**
 * configurador.js — Configurador Modular "Arma tu Solución"
 */

(function () {
  'use strict';

  const WA_NUMBER = '573XXXXXXXXXX';

  const modulos = [
    { id: 'seguridad', icono: '🔒', nombre: 'Seguridad', precio: 2800000 },
    { id: 'iluminacion', icono: '💡', nombre: 'Iluminación inteligente', precio: 1500000 },
    { id: 'climatizacion', icono: '🌡️', nombre: 'Climatización', precio: 2200000 },
    { id: 'audio', icono: '🎵', nombre: 'Audio multizona', precio: 1800000 },
    { id: 'solar', icono: '⚡', nombre: 'Energía solar', precio: 3500000 },
    { id: 'voz', icono: '📱', nombre: 'Control por voz', precio: 800000 }
  ];

  const seleccionados = new Set();

  function formatCOP(valor) {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });
  }

  function actualizarResumen() {
    const lista = document.getElementById('modulos-lista');
    const badge = document.getElementById('descuento-badge');
    const totalValor = document.getElementById('total-valor');
    const totalOriginal = document.getElementById('total-original');
    const totalSin = document.getElementById('total-sin-seleccion');
    const btnWA = document.getElementById('config-btn-wa');

    const items = modulos.filter(function (m) { return seleccionados.has(m.id); });
    const totalBruto = items.reduce(function (acc, m) { return acc + m.precio; }, 0);
    const tieneDescuento = items.length >= 3;
    const totalFinal = tieneDescuento ? Math.round(totalBruto * 0.92) : totalBruto;

    // Lista de módulos seleccionados
    lista.innerHTML = '';
    if (items.length === 0) {
      const vacio = document.createElement('p');
      vacio.className = 'item-vacio';
      vacio.textContent = 'Selecciona al menos un módulo para ver el resumen.';
      lista.appendChild(vacio);
    } else {
      items.forEach(function (m) {
        const item = document.createElement('div');
        item.className = 'modulo-seleccionado-item';
        item.innerHTML = '<span class="modulo-sel-nombre">' + m.icono + ' ' + m.nombre + '</span>' +
          '<span class="modulo-sel-precio">' + formatCOP(m.precio) + '</span>';
        lista.appendChild(item);
      });
    }

    // Badge de descuento
    if (badge) {
      if (tieneDescuento) {
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    }

    // Total
    if (items.length === 0) {
      if (totalValor) totalValor.textContent = '';
      if (totalSin) totalSin.style.display = 'block';
      if (totalOriginal) totalOriginal.style.display = 'none';
    } else {
      if (totalSin) totalSin.style.display = 'none';
      if (tieneDescuento) {
        if (totalOriginal) {
          totalOriginal.style.display = 'block';
          totalOriginal.textContent = formatCOP(totalBruto);
        }
      } else {
        if (totalOriginal) totalOriginal.style.display = 'none';
      }
      if (totalValor) totalValor.textContent = formatCOP(totalFinal);
    }

    // WhatsApp
    if (btnWA) {
      if (items.length === 0) {
        btnWA.style.opacity = '0.5';
        btnWA.style.pointerEvents = 'none';
        btnWA.href = '#';
      } else {
        btnWA.style.opacity = '1';
        btnWA.style.pointerEvents = '';
        const listaMsg = items.map(function (m) { return m.nombre; }).join(', ');
        const descMsg = tieneDescuento ? ' (con 8% descuento combo)' : '';
        const msg = encodeURIComponent(
          'Hola Carlos! En el configurador de i-Homotic seleccioné: ' + listaMsg +
          '. Total: ' + formatCOP(totalFinal) + descMsg + '. Quiero más información.'
        );
        btnWA.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msg;
      }
    }
  }

  function construirGrid() {
    const grid = document.getElementById('modulos-grid');
    if (!grid) return;

    modulos.forEach(function (modulo) {
      const btn = document.createElement('button');
      btn.className = 'modulo-card';
      btn.setAttribute('data-id', modulo.id);
      btn.setAttribute('data-precio', modulo.precio);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');

      btn.innerHTML =
        '<span class="modulo-check" aria-hidden="true">✓</span>' +
        '<span class="modulo-icono">' + modulo.icono + '</span>' +
        '<span class="modulo-nombre">' + modulo.nombre + '</span>' +
        '<span class="modulo-precio">' + formatCOP(modulo.precio) + '</span>';

      btn.addEventListener('click', function () {
        if (seleccionados.has(modulo.id)) {
          seleccionados.delete(modulo.id);
          btn.classList.remove('selected');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          seleccionados.add(modulo.id);
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');
        }
        actualizarResumen();
      });

      grid.appendChild(btn);
    });
  }

  function init() {
    construirGrid();
    actualizarResumen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
