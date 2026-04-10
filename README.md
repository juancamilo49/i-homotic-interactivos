# i-Homotic Interactivos

Herramientas web interactivas para **i-Homotic**, empresa colombiana de domótica fabricada y programada desde Medellín. Proyecto académico EAFIT 2026.

## Contexto

i-Homotic vende soluciones de domótica de bajo voltaje (12–24V), sin cuotas mensuales, compatibles con Alexa, Google Assistant y Siri. Su usuario objetivo son propietarios colombianos (estrato 4–5, 30–55 años) que validan proveedores digitalmente antes de contratar.

Este sitio fue diseñado para reducir la fricción del primer contacto, convirtiendo el interés en intención a través de herramientas pedagógicas y calculadoras de valor.

---

## Las 4 herramientas

### 🧭 Quiz — "¿Por dónde empiezo?"
**Insight de investigación #4: Pedagogía como diferencial**
> "Nadie le explica por dónde empezar."

4 preguntas (tipo de vivienda, prioridad, presupuesto, dispositivos actuales) con resultado personalizado y CTA directo a WhatsApp. Reemplaza al asesor en el primer contacto digital.

---

### 💰 Calculadora de Ahorro
**Insight de investigación #5: Ver para creer**
> "Sin datos concretos estoy comprando una promesa."

3 sliders (habitaciones, consumo kWh/mes, horas de iluminación) con cálculo reactivo en tiempo real. Genera tabla comparativa y gráfica de barras SVG. Convierte promesas en números concretos.

---

### 🧩 Configurador Modular — "Arma tu Solución"
**Insight de investigación #3: Expansión gradual**
> El usuario quiere probar módulo a módulo.

6 módulos toggle (seguridad, iluminación, climatización, audio, solar, voz). Total dinámico con descuento automático del 8% al seleccionar 3 o más. Externaliza el proceso de decisión incremental.

---

### 📬 Formulario de Contacto
**Insights #1 y #2: La confianza se googlea / Parálisis por falta de evidencia**

Formulario con validación completa en cliente + POST a webhook de n8n. Estados: idle → loading → success / error. Fallback WhatsApp siempre visible.

---

## Estructura del proyecto

```
i-homotic-interactivos/
├── index.html            ← Landing con hero + 4 tarjetas
├── quiz.html             ← Quiz ¿Por dónde empiezo?
├── calculadora.html      ← Calculadora de Ahorro
├── configurador.html     ← Configurador Modular
├── contacto.html         ← Formulario de Contacto
├── css/
│   ├── variables.css     ← Tokens de color y tipografía
│   ├── global.css        ← Reset, base, navbar
│   ├── quiz.css
│   ├── calculadora.css
│   ├── configurador.css
│   └── contacto.css
├── js/
│   ├── navbar.js         ← Hamburger + active link
│   ├── quiz.js
│   ├── calculadora.js
│   ├── configurador.js
│   └── contacto.js
└── README.md
```

---

## Stack técnico

- **HTML5** semántico
- **CSS3** con variables custom (sin frameworks)
- **JavaScript vanilla** ES6+ (sin librerías externas)
- **Fuente**: Sora (Google Fonts)
- **Gráficas**: SVG generado dinámicamente por JS (sin canvas ni librería)

---

## Cómo usar

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/i-homotic-interactivos.git
   ```

2. Abrir `index.html` en cualquier navegador moderno. No se requiere servidor.

3. Para el formulario de contacto, el webhook está configurado en `js/contacto.js`:
   ```javascript
   const WEBHOOK_URL = 'https://auto.lubrifrenosnacional.com/webhook/0238ce80-7f1b-47da-aec0-17370f3e3429';
   ```
   Cambiar esta URL por el endpoint propio si se despliega en otro entorno.

---

## Reemplazar el número de WhatsApp

El número de WhatsApp está definido como constante `WA_NUMBER` al inicio de cada archivo JS:

```javascript
const WA_NUMBER = '573XXXXXXXXXX';  // ← Reemplazar con el número real
```

Archivos a actualizar:
- `js/quiz.js`
- `js/calculadora.js`
- `js/configurador.js`
- `js/contacto.js`

Y los enlaces directos en los archivos HTML (búsqueda: `573XXXXXXXXXX`).

---

## Tokens de color (css/variables.css)

| Variable | Color |
|---|---|
| `--naranja` | `#E8721A` — CTA principal |
| `--verde` | `#2D6A2E` — Acento primario |
| `--verdeclaro` | `#4c7b45` — Secundario |
| `--colorletraverde` | `#2d3a2d` — Texto principal |
| `--colorfondoverde` | `#eef3dd` — Fondos suaves |
| `--whatsapp` | `#25D366` — CTAs WhatsApp |

---

*Proyecto EAFIT 2026 — i-Homotic, domótica colombiana sin cuotas mensuales.*
