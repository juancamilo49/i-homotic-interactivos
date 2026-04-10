/**
 * calculadora.js — Calculadora de Ahorro Energético
 */

(function () {
  'use strict';

  const WA_NUMBER = '573XXXXXXXXXX';

  function formatCOP(valor) {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });
  }

  function calcular(habitaciones, consumo, horas) {
    const ahorro_mensual = Math.round(consumo * 0.30 * 1200);
    const inversion = habitaciones * 850000;
    const meses_roi = Math.ceil(inversion / ahorro_mensual);
    return {
      ahorro_mensual,
      inversion,
      meses_roi,
      anio1: ahorro_mensual * 12,
      anio3: ahorro_mensual * 36,
      anio5: ahorro_mensual * 60
    };
  }

  function actualizarSliderTrack(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.background = 'linear-gradient(to right, var(--naranja) 0%, var(--naranja) ' +
      pct + '%, #dde8d5 ' + pct + '%, #dde8d5 100%)';
  }

  function actualizarUI(habitaciones, consumo, horas) {
    const r = calcular(habitaciones, consumo, horas);

    // Resultados destacados
    document.getElementById('res-ahorro-mensual').textContent = formatCOP(r.ahorro_mensual) + '/mes';
    document.getElementById('res-inversion').textContent = formatCOP(r.inversion);
    document.getElementById('res-roi').textContent = r.meses_roi + ' meses';

    // Costo de energía sin domótica
    const costoMensualSin = Math.round(consumo * 1200);
    document.getElementById('res-costo-sin').textContent = formatCOP(costoMensualSin) + '/mes';

    // Tabla comparativa
    document.getElementById('tabla-sin-1').textContent = formatCOP(costoMensualSin * 12);
    document.getElementById('tabla-con-1').textContent = formatCOP(r.anio1);
    document.getElementById('tabla-sin-3').textContent = formatCOP(costoMensualSin * 36);
    document.getElementById('tabla-con-3').textContent = formatCOP(r.anio3);
    document.getElementById('tabla-sin-5').textContent = formatCOP(costoMensualSin * 60);
    document.getElementById('tabla-con-5').textContent = formatCOP(r.anio5);

    // Gráfica SVG
    renderizarGrafica(costoMensualSin, r);

    // CTA WhatsApp
    const msg = encodeURIComponent(
      'Hola Carlos! Usé la calculadora de ahorro de i-Homotic con estos datos: ' +
      habitaciones + ' habitaciones, ' + consumo + ' kWh/mes, ' + horas + ' horas/día. ' +
      'Ahorro estimado: ' + formatCOP(r.ahorro_mensual) + '/mes. Inversion: ' + formatCOP(r.inversion) +
      '. Me gustaría más información.'
    );
    const btnWA = document.getElementById('calc-btn-wa');
    if (btnWA) btnWA.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msg;
  }

  function renderizarGrafica(costoMensualSin, r) {
    const svg = document.getElementById('chart-svg');
    if (!svg) return;

    const W = 560;
    const H = 280;
    const padLeft = 85;
    const padBottom = 50;
    const padTop = 20;
    const padRight = 20;
    const chartW = W - padLeft - padRight;
    const chartH = H - padBottom - padTop;

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');

    // Datos: [sin domótica, con domótica] para 1, 3, 5 años
    const datos = [
      { label: '1 año', sin: costoMensualSin * 12, con: r.anio1 },
      { label: '3 años', sin: costoMensualSin * 36, con: r.anio3 },
      { label: '5 años', sin: costoMensualSin * 60, con: r.anio5 }
    ];

    const maxVal = Math.max(...datos.map(function (d) { return Math.max(d.sin, d.con); }));
    const escala = chartH / (maxVal * 1.1);

    const grupoCant = datos.length;
    const grupoAncho = chartW / grupoCant;
    const barraAncho = grupoAncho * 0.3;
    const barraGap = grupoAncho * 0.05;

    // Limpiar SVG
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Fondo
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', W);
    bg.setAttribute('height', H);
    bg.setAttribute('fill', 'transparent');
    svg.appendChild(bg);

    // Líneas de guía horizontales
    const guias = 4;
    for (let i = 0; i <= guias; i++) {
      const y = padTop + (chartH / guias) * i;
      const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      linea.setAttribute('x1', padLeft);
      linea.setAttribute('x2', W - padRight);
      linea.setAttribute('y1', y);
      linea.setAttribute('y2', y);
      linea.setAttribute('stroke', '#eee');
      linea.setAttribute('stroke-width', '1');
      svg.appendChild(linea);

      // Etiqueta eje Y
      const valLabel = Math.round(maxVal * 1.1 * (1 - i / guias));
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', padLeft - 6);
      txt.setAttribute('y', y + 4);
      txt.setAttribute('text-anchor', 'end');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-family', 'Sora, sans-serif');
      txt.setAttribute('fill', '#999');
      txt.textContent = (valLabel / 1000000).toFixed(1) + 'M';
      svg.appendChild(txt);
    }

    // Barras
    datos.forEach(function (dato, gi) {
      const grupoX = padLeft + gi * grupoAncho + grupoAncho * 0.1;

      // Barra gris (sin domótica)
      const alturaSin = dato.sin * escala;
      const ySin = padTop + chartH - alturaSin;
      const barraSin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      barraSin.setAttribute('x', grupoX);
      barraSin.setAttribute('y', ySin);
      barraSin.setAttribute('width', barraAncho);
      barraSin.setAttribute('height', alturaSin);
      barraSin.setAttribute('fill', '#bbb');
      barraSin.setAttribute('rx', '3');
      svg.appendChild(barraSin);

      // Barra verde (con domótica)
      const alturaConVal = dato.con * escala;
      const yCon = padTop + chartH - alturaConVal;
      const barraCon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      barraCon.setAttribute('x', grupoX + barraAncho + barraGap);
      barraCon.setAttribute('y', yCon);
      barraCon.setAttribute('width', barraAncho);
      barraCon.setAttribute('height', alturaConVal);
      barraCon.setAttribute('fill', '#2D6A2E');
      barraCon.setAttribute('rx', '3');
      svg.appendChild(barraCon);

      // Etiqueta del grupo
      const txtLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txtLabel.setAttribute('x', grupoX + barraAncho + barraGap / 2);
      txtLabel.setAttribute('y', padTop + chartH + 18);
      txtLabel.setAttribute('text-anchor', 'middle');
      txtLabel.setAttribute('font-size', '10');
      txtLabel.setAttribute('font-family', 'Sora, sans-serif');
      txtLabel.setAttribute('font-weight', '600');
      txtLabel.setAttribute('fill', '#555');
      txtLabel.textContent = dato.label;
      svg.appendChild(txtLabel);
    });

    // Eje X
    const ejeX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ejeX.setAttribute('x1', padLeft);
    ejeX.setAttribute('x2', W - padRight);
    ejeX.setAttribute('y1', padTop + chartH);
    ejeX.setAttribute('y2', padTop + chartH);
    ejeX.setAttribute('stroke', '#ccc');
    ejeX.setAttribute('stroke-width', '1.5');
    svg.appendChild(ejeX);
  }

  function init() {
    const sliderHabitaciones = document.getElementById('slider-habitaciones');
    const sliderConsumo = document.getElementById('slider-consumo');
    const sliderHoras = document.getElementById('slider-horas');

    const valHabitaciones = document.getElementById('val-habitaciones');
    const valConsumo = document.getElementById('val-consumo');
    const valHoras = document.getElementById('val-horas');

    if (!sliderHabitaciones || !sliderConsumo || !sliderHoras) return;

    function actualizar() {
      const hab = parseInt(sliderHabitaciones.value);
      const con = parseInt(sliderConsumo.value);
      const hor = parseInt(sliderHoras.value);

      valHabitaciones.textContent = hab;
      valConsumo.textContent = con + ' kWh';
      valHoras.textContent = hor + ' h';

      actualizarSliderTrack(sliderHabitaciones);
      actualizarSliderTrack(sliderConsumo);
      actualizarSliderTrack(sliderHoras);

      actualizarUI(hab, con, hor);
    }

    sliderHabitaciones.addEventListener('input', actualizar);
    sliderConsumo.addEventListener('input', actualizar);
    sliderHoras.addEventListener('input', actualizar);

    // Estado inicial
    actualizarSliderTrack(sliderHabitaciones);
    actualizarSliderTrack(sliderConsumo);
    actualizarSliderTrack(sliderHoras);
    actualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
