/**
 * casa3d.js — Visualizador 3D de Casa Inteligente
 * Three.js r128 + OrbitControls
 * i-Homotic — EAFIT 2026
 */

(function () {
  'use strict';

  const WA_NUMBER = '573XXXXXXXXXX';

  // =============================================
  // DATOS DE HABITACIONES
  // =============================================
  const HABITACIONES = [
    {
      id: 'sala',
      nombre: 'Sala Principal',
      icono: '🛋️',
      dispositivos: ['Iluminación inteligente', 'Audio multizona', 'Control por voz'],
      escena: 'Modo Cine',
      estado: 'Encendida',
      color: 0x2d3a2d,
      colorEncendido: 0xff9955,
      posicion: { x: -3, y: 0, z: 0 },
      dimensiones: { w: 4, h: 2.5, d: 4 },
    },
    {
      id: 'cocina',
      nombre: 'Cocina',
      icono: '🍳',
      dispositivos: ['Iluminación inteligente', 'Sensor de gas', 'Sensor de humo'],
      escena: 'Modo Cocina',
      estado: 'Apagada',
      color: 0x243024,
      colorEncendido: 0xfff3e0,
      posicion: { x: 2.5, y: 0, z: 0 },
      dimensiones: { w: 3, h: 2.5, d: 3 },
    },
    {
      id: 'habitacion1',
      nombre: 'Habitación Principal',
      icono: '🛏️',
      dispositivos: ['Iluminación inteligente', 'Climatización', 'Persiana automática'],
      escena: 'Modo Descanso',
      estado: 'Encendida',
      color: 0x1a2e1a,
      colorEncendido: 0xffe8a0,
      posicion: { x: -3, y: 0, z: -5 },
      dimensiones: { w: 4, h: 2.5, d: 4 },
    },
    {
      id: 'entrada',
      nombre: 'Entrada',
      icono: '🚪',
      dispositivos: ['Cerradura inteligente', 'Cámara IP', 'Sensor de movimiento'],
      escena: 'Modo Seguridad',
      estado: 'Activa',
      color: 0x344034,
      colorEncendido: 0x88cc88,
      posicion: { x: 2.5, y: 0, z: -5 },
      dimensiones: { w: 2.5, h: 2.5, d: 2.5 },
    },
    {
      id: 'patio',
      nombre: 'Patio / Jardín',
      icono: '🌿',
      dispositivos: ['Iluminación exterior', 'Sensor de movimiento', 'Riego automático'],
      escena: 'Modo Exterior',
      estado: 'Encendida',
      color: 0x0d1a0d,
      colorEncendido: 0xc8e6c9,
      posicion: { x: 0, y: 0, z: 5 },
      dimensiones: { w: 7, h: 0.1, d: 3.5 },
    },
  ];

  // Variables globales de Three.js
  let renderer, scene, camera, controls;
  let container;
  let habitacionMeshes = [];
  let introActive = true;
  let introAngle = Math.PI * 0.25;
  let introFrame = 0;
  const INTRO_DURATION = 200;

  // =============================================
  // INICIALIZACIÓN
  // =============================================
  function init() {
    container = document.getElementById('canvas-container');
    if (!container) return;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1a0d);
    scene.fog = new THREE.FogExp2(0x0d1a0d, 0.025);

    // Cámara
    camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(8, 10, 14);
    camera.lookAt(0, 0, 0);

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 32;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.target.set(0, 1, 0);
    controls.enabled = false; // se activa tras la intro

    construirEscena();
    setupLighting();
    crearHotspots();

    // Eventos
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('touchend', onCanvasTouchEnd, { passive: true });
    document.getElementById('info-close').addEventListener('click', cerrarPanel);

    window.addEventListener('resize', onResize);

    checkOrientation();
    window.addEventListener('orientationchange', function () {
      setTimeout(checkOrientation, 350);
    });
    window.addEventListener('resize', checkOrientation);

    document.getElementById('btn-continuar').addEventListener('click', function () {
      sessionStorage.setItem('rotate-dismissed', '1');
      document.getElementById('rotate-overlay').classList.remove('visible');
    });

    animate();
  }

  // =============================================
  // CONSTRUCCIÓN DE LA ESCENA
  // =============================================
  function construirEscena() {
    // PISO PRINCIPAL
    const pisoGeo = new THREE.PlaneGeometry(22, 20);
    const pisoMat = new THREE.MeshLambertMaterial({ color: 0x1a2e1a });
    const piso = new THREE.Mesh(pisoGeo, pisoMat);
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.01;
    piso.receiveShadow = true;
    scene.add(piso);

    // GRID decorativo en el piso
    const grid = new THREE.GridHelper(22, 22, 0x243024, 0x1e2e1e);
    grid.position.y = 0.01;
    scene.add(grid);

    // PAREDES EXTERIORES
    construirParedes();

    // HABITACIONES
    HABITACIONES.forEach(function (hab) {
      construirHabitacion(hab);
    });
  }

  function construirParedes() {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x2d3a2d, side: THREE.FrontSide });
    const wallH = 3;
    const wallT = 0.15;

    // Pared norte
    addBox(-0.25, wallH / 2, -7.5, 9.5, wallH, wallT, wallMat);
    // Pared sur
    addBox(-0.25, wallH / 2, 7, 9.5, wallH, wallT, wallMat);
    // Pared este
    addBox(5, wallH / 2, -0.25, wallT, wallH, 14.5, wallMat);
    // Pared oeste
    addBox(-5.5, wallH / 2, -0.25, wallT, wallH, 14.5, wallMat);
  }

  function construirHabitacion(hab) {
    const { posicion: p, dimensiones: d, color } = hab;
    const mat = new THREE.MeshLambertMaterial({ color: color });

    // Suelo de la habitación (plano con color)
    const sueloGeo = new THREE.PlaneGeometry(d.w - 0.1, d.d - 0.1);
    const sueloMesh = new THREE.Mesh(sueloGeo, mat);
    sueloMesh.rotation.x = -Math.PI / 2;
    sueloMesh.position.set(p.x, 0.02, p.z);
    sueloMesh.receiveShadow = true;
    scene.add(sueloMesh);

    // Hitbox invisible para raycasting (toda la habitación)
    const hitGeo = new THREE.BoxGeometry(d.w, d.h, d.d);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.FrontSide });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(p.x, d.h / 2, p.z);
    hitMesh.userData.id = hab.id;
    scene.add(hitMesh);
    habitacionMeshes.push(hitMesh);

    // Paredes interiores semitransparentes
    const wallMatInt = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const wallH = d.h;
    const wallT = 0.08;

    // Solo paredes visibles desde fuera (norte y este de cada habitación)
    addBox(p.x - d.w / 2, wallH / 2, p.z, wallT, wallH, d.d, wallMatInt);
    addBox(p.x, wallH / 2, p.z - d.d / 2, d.w, wallH, wallT, wallMatInt);

    // Muebles simplificados
    construirMuebles(hab);
  }

  function construirMuebles(hab) {
    const { posicion: p } = hab;

    switch (hab.id) {
      case 'sala':
        // Sofá
        addBox(p.x - 0.5, 0.3, p.z + 1.2, 2.2, 0.55, 0.7, new THREE.MeshLambertMaterial({ color: 0x4a5a4a }));
        addBox(p.x - 0.5, 0.65, p.z + 1.5, 2.2, 0.5, 0.18, new THREE.MeshLambertMaterial({ color: 0x4a5a4a }));
        // TV (panel plano vertical)
        addBox(p.x - 0.5, 1.1, p.z - 1.6, 1.6, 0.9, 0.06, new THREE.MeshLambertMaterial({ color: 0x111811 }));
        // Mesa de centro
        addBox(p.x - 0.4, 0.2, p.z + 0.2, 1.0, 0.12, 0.6, new THREE.MeshLambertMaterial({ color: 0x3a4a3a }));
        break;

      case 'cocina':
        // Mesón
        addBox(p.x + 0.8, 0.5, p.z - 0.9, 0.6, 0.9, 2.0, new THREE.MeshLambertMaterial({ color: 0x3d503d }));
        // Tope del mesón
        addBox(p.x + 0.8, 0.95, p.z - 0.9, 0.65, 0.06, 2.1, new THREE.MeshLambertMaterial({ color: 0x556655 }));
        // Estufa (cilindros)
        addCylinder(p.x + 0.7, 1.0, p.z - 0.4, 0.12, 0.08, new THREE.MeshLambertMaterial({ color: 0x222e22 }));
        addCylinder(p.x + 0.9, 1.0, p.z - 0.4, 0.12, 0.08, new THREE.MeshLambertMaterial({ color: 0x222e22 }));
        addCylinder(p.x + 0.7, 1.0, p.z - 0.65, 0.12, 0.08, new THREE.MeshLambertMaterial({ color: 0x222e22 }));
        addCylinder(p.x + 0.9, 1.0, p.z - 0.65, 0.12, 0.08, new THREE.MeshLambertMaterial({ color: 0x222e22 }));
        break;

      case 'habitacion1':
        // Cama (base + colchón + cabecero)
        addBox(p.x, 0.18, p.z + 0.5, 1.8, 0.35, 2.8, new THREE.MeshLambertMaterial({ color: 0x3a4a3a }));
        addBox(p.x, 0.4, p.z + 0.5, 1.75, 0.22, 2.75, new THREE.MeshLambertMaterial({ color: 0xd4b896 }));
        addBox(p.x, 0.65, p.z - 0.8, 1.8, 0.9, 0.14, new THREE.MeshLambertMaterial({ color: 0x4a3a2a }));
        // Mesa de noche
        addBox(p.x + 1.2, 0.3, p.z - 0.3, 0.45, 0.6, 0.45, new THREE.MeshLambertMaterial({ color: 0x3a4a3a }));
        break;

      case 'entrada':
        // Puerta
        addBox(p.x, 1.05, p.z + 1.1, 0.9, 2.1, 0.08, new THREE.MeshLambertMaterial({ color: 0x4a5a3a }));
        // Pomo (esfera pequeña)
        addSphere(p.x + 0.35, 1.0, p.z + 1.1, 0.06, new THREE.MeshLambertMaterial({ color: 0xE8721A }));
        // Cámara (cilindro pequeño en pared)
        addCylinder(p.x + 0.9, 2.0, p.z - 1.0, 0.08, 0.12, new THREE.MeshLambertMaterial({ color: 0x111811 }));
        break;

      case 'patio':
        // Arbusto 1
        addSphere(p.x - 2.5, 0.5, p.z, 0.5, new THREE.MeshLambertMaterial({ color: 0x2d6a2e }));
        // Arbusto 2
        addSphere(p.x + 2, 0.4, p.z + 0.8, 0.4, new THREE.MeshLambertMaterial({ color: 0x3a7a3a }));
        // Farol exterior
        addBox(p.x, 0.8, p.z, 0.08, 1.6, 0.08, new THREE.MeshLambertMaterial({ color: 0x556644 }));
        addSphere(p.x, 1.65, p.z, 0.14, new THREE.MeshLambertMaterial({ color: 0xfff3e0 }));
        break;
    }
  }

  // Helpers para crear geometrías
  function addBox(x, y, z, w, h, d, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function addCylinder(x, y, z, r, h, mat) {
    const geo = new THREE.CylinderGeometry(r, r, h, 8);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  function addSphere(x, y, z, r, mat) {
    const geo = new THREE.SphereGeometry(r, 10, 10);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  // =============================================
  // ILUMINACIÓN
  // =============================================
  function setupLighting() {
    // Luz ambiental suave
    const ambient = new THREE.AmbientLight(0xf4faf5, 0.38);
    scene.add(ambient);

    // Luz direccional (simula luna/sol suave)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // PointLight por habitación encendida
    HABITACIONES.forEach(function (hab) {
      if (hab.estado !== 'Apagada') {
        const light = new THREE.PointLight(hab.colorEncendido, 1.3, 7);
        light.position.set(hab.posicion.x, 2.3, hab.posicion.z);
        scene.add(light);
        hab._light = light;
      }
    });
  }

  // =============================================
  // HOTSPOTS HTML SOBRE EL CANVAS
  // =============================================
  function crearHotspots() {
    const wrapper = document.getElementById('canvas-container');
    HABITACIONES.forEach(function (hab) {
      const div = document.createElement('div');
      div.className = 'hotspot';
      div.id = 'hotspot-' + hab.id;

      const bubble = document.createElement('div');
      bubble.className = 'hotspot__bubble';
      bubble.textContent = hab.icono + ' ' + hab.nombre;
      div.appendChild(bubble);

      div.addEventListener('click', function (e) {
        e.stopPropagation();
        mostrarPanel(hab);
      });

      wrapper.appendChild(div);
    });
  }

  function actualizarHotspots() {
    HABITACIONES.forEach(function (hab) {
      const el = document.getElementById('hotspot-' + hab.id);
      if (!el) return;

      const pos3D = new THREE.Vector3(
        hab.posicion.x,
        hab.dimensiones.h + 0.8,
        hab.posicion.z
      );
      pos3D.project(camera);

      const x = (pos3D.x * 0.5 + 0.5) * container.clientWidth;
      const y = (-pos3D.y * 0.5 + 0.5) * container.clientHeight;

      const visible = pos3D.z > -1 && pos3D.z < 1 && x > 0 && x < container.clientWidth && y > 0 && y < container.clientHeight;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.display = visible ? 'block' : 'none';
    });
  }

  // =============================================
  // LOOP DE ANIMACIÓN
  // =============================================
  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Intro: órbita automática los primeros ~3 segundos
    if (introActive) {
      introFrame++;
      introAngle += 0.007;
      const radius = 16;
      camera.position.x = Math.sin(introAngle) * radius;
      camera.position.z = Math.cos(introAngle) * radius;
      camera.position.y = 10 + Math.sin(introFrame * 0.02) * 1.5;
      camera.lookAt(0, 1, 0);
      if (introFrame >= INTRO_DURATION) {
        introActive = false;
        controls.enabled = true;
        // Ocultar hint de controles después de un rato
        setTimeout(function () {
          const hint = document.getElementById('controls-hint');
          if (hint) {
            hint.style.transition = 'opacity 1s';
            hint.style.opacity = '0';
          }
        }, 5000);
      }
    }

    // Parpadeo suave de luces encendidas
    HABITACIONES.forEach(function (hab) {
      if (hab._light) {
        hab._light.intensity = 1.1 + 0.2 * Math.sin(time * 1.4 + hab.posicion.x * 0.7);
      }
    });

    actualizarHotspots();
    controls.update();
    renderer.render(scene, camera);
  }

  // =============================================
  // INTERACCIÓN — CLICK / TAP
  // =============================================
  function onCanvasClick(event) {
    const hab = getHabitacionFromEvent(event.clientX, event.clientY);
    if (hab) mostrarPanel(hab);
  }

  function onCanvasTouchEnd(event) {
    if (event.changedTouches.length > 0) {
      const t = event.changedTouches[0];
      const hab = getHabitacionFromEvent(t.clientX, t.clientY);
      if (hab) mostrarPanel(hab);
    }
  }

  function getHabitacionFromEvent(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(habitacionMeshes);
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      return HABITACIONES.find(function (h) { return h.id === mesh.userData.id; }) || null;
    }
    return null;
  }

  // =============================================
  // PANEL LATERAL
  // =============================================
  function mostrarPanel(hab) {
    document.getElementById('info-nombre').textContent = hab.nombre;
    document.getElementById('info-icono').textContent = hab.icono;
    document.getElementById('info-estado-val').textContent = hab.estado;
    document.getElementById('info-escena-val').textContent = hab.escena;

    const lista = document.getElementById('info-dispositivos');
    lista.innerHTML = '';
    hab.dispositivos.forEach(function (d) {
      const li = document.createElement('li');
      li.textContent = d;
      lista.appendChild(li);
    });

    const msg = encodeURIComponent(
      'Hola Carlos! Vi el visualizador 3D de i-Homotic y me interesa la solución para ' +
      hab.nombre + '. Tiene: ' + hab.dispositivos.join(', ') + '. ¿Podemos hablar?'
    );
    document.getElementById('info-cta').href = 'https://wa.me/' + WA_NUMBER + '?text=' + msg;

    const panel = document.getElementById('info-panel');
    panel.classList.remove('info-panel--hidden');
  }

  function cerrarPanel() {
    document.getElementById('info-panel').classList.add('info-panel--hidden');
  }

  // =============================================
  // OVERLAY ROTACIÓN MOBILE
  // =============================================
  function checkOrientation() {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    const overlay = document.getElementById('rotate-overlay');
    const dismissed = sessionStorage.getItem('rotate-dismissed');

    if (isMobile && isPortrait && !dismissed) {
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
    }
  }

  // =============================================
  // RESIZE
  // =============================================
  function onResize() {
    if (!camera || !renderer || !container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // =============================================
  // ARRANQUE
  // =============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
