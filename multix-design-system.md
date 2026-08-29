# Multix — Guía de diseño v1.0

Sistema de diseño para entrevistas técnicas en vivo.
Base de rejilla: **4 px**. Tamaño raíz: **16 px**. Todos los valores están en píxeles absolutos para permitir implementación pixel perfect.

---

## 1. Tokens — CSS (copiar y pegar)

```css
/* ============================================================
   MULTIX DESIGN TOKENS v1.0
   ============================================================ */
:root {

  /* ---------- MARCA ---------- */
  --mx-iris-50:  #F0EFFC;
  --mx-iris-100: #E7E5FB;
  --mx-iris-200: #CDC8F7;
  --mx-iris-300: #A9A1F0;
  --mx-iris-400: #7D72E8;
  --mx-iris-500: #4F42E3;
  --mx-iris-600: #3B2FD8;  /* BASE DE MARCA */
  --mx-iris-700: #2E24AE;
  --mx-iris-800: #241C87;
  --mx-iris-900: #1A1463;
  --mx-iris-lift:#5A50EE;  /* hover sobre fondo oscuro */

  /* ---------- NEUTRALES (gris frío, sesgo azul) ---------- */
  --mx-n-0:   #FFFFFF;
  --mx-n-25:  #F7F8FA;
  --mx-n-50:  #EDEFF4;   /* Papel — fondo base */
  --mx-n-100: #E2E5EC;
  --mx-n-200: #D8DCE5;   /* Hairline — todos los bordes 1px */
  --mx-n-300: #C0C6D2;
  --mx-n-400: #9AA2B1;
  --mx-n-500: #5C6577;   /* Pizarra — texto secundario */
  --mx-n-600: #454D5E;
  --mx-n-700: #252C3B;   /* Borde de superficie oscura */
  --mx-n-800: #191E29;   /* Superficie oscura elevada */
  --mx-n-900: #0F1219;   /* Tinta — texto y panel */

  /* ---------- ESTADOS (solo producto, nunca marca) ---------- */
  --mx-advance:      #1D9A6C;
  --mx-advance-bg:   #E6F3EC;
  --mx-advance-text: #14704F;
  --mx-advance-dark: #4FD3A0;

  --mx-explore:      #2E86C8;
  --mx-explore-bg:   #E6F0F9;
  --mx-explore-text: #1F6296;
  --mx-explore-dark: #6FB6EC;

  --mx-stuck:        #C97A12;
  --mx-stuck-bg:     #FBF0DF;
  --mx-stuck-text:   #94590D;
  --mx-stuck-dark:   #F0AE55;

  --mx-fail:         #D6423F;
  --mx-fail-bg:      #FBEBEA;
  --mx-fail-text:    #A32F2D;
  --mx-fail-dark:    #FF8A87;

  --mx-done:         #14807E;
  --mx-done-bg:      #E3F1F1;
  --mx-done-text:    #0E5F5D;
  --mx-done-dark:    #43C4C1;

  /* ---------- SEMÁNTICOS ---------- */
  --mx-bg:            var(--mx-n-50);
  --mx-surface:       var(--mx-n-0);
  --mx-surface-sunk:  var(--mx-n-25);
  --mx-surface-dark:  var(--mx-n-900);
  --mx-surface-dark-2:var(--mx-n-800);
  --mx-border:        var(--mx-n-200);
  --mx-border-dark:   var(--mx-n-700);
  --mx-text:          var(--mx-n-900);
  --mx-text-muted:    var(--mx-n-500);
  --mx-text-invert:   var(--mx-n-0);
  --mx-accent:        var(--mx-iris-600);
  --mx-accent-hover:  var(--mx-iris-700);
  --mx-accent-wash:   var(--mx-iris-100);

  /* ---------- TIPOGRAFÍA ---------- */
  --mx-font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --mx-font-body:    "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --mx-font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* ---------- ESPACIADO (base 4 px) ---------- */
  --mx-space-0:  0px;
  --mx-space-1:  4px;
  --mx-space-2:  8px;
  --mx-space-3:  12px;
  --mx-space-4:  16px;
  --mx-space-5:  20px;
  --mx-space-6:  24px;
  --mx-space-8:  32px;
  --mx-space-10: 40px;
  --mx-space-12: 48px;
  --mx-space-16: 64px;
  --mx-space-20: 80px;
  --mx-space-24: 96px;
  --mx-space-32: 128px;

  /* ---------- RADIOS ---------- */
  --mx-r-xs:   4px;   /* tags mínimos, checkbox */
  --mx-r-sm:   6px;   /* botón pequeño */
  --mx-r-md:   8px;   /* botón, input */
  --mx-r-lg:   10px;  /* alerta, tile de candidato */
  --mx-r-xl:   12px;  /* swatch, evidencia */
  --mx-r-2xl:  14px;  /* card */
  --mx-r-3xl:  18px;  /* contenedor de mosaico */
  --mx-r-icon: 19px;  /* app icon 76px */
  --mx-r-full: 999px; /* chip de estado, avatar */

  /* ---------- BORDES ---------- */
  --mx-bw-hair:   1px;
  --mx-bw-strong: 1.5px;
  --mx-bw-accent: 3px;  /* borde izquierdo de alerta */

  /* ---------- SOMBRAS ---------- */
  --mx-shadow-sm:    0 1px 2px rgba(15,18,25,.06);
  --mx-shadow-md:    0 4px 12px -2px rgba(15,18,25,.10);
  --mx-shadow-lg:    0 12px 32px -8px rgba(15,18,25,.18);
  --mx-shadow-panel: 0 24px 60px -28px rgba(15,18,25,.55);
  --mx-focus-ring:   0 0 0 2px #FFFFFF, 0 0 0 4px var(--mx-iris-600);
  --mx-focus-ring-dark: 0 0 0 2px var(--mx-n-900), 0 0 0 4px var(--mx-iris-lift);

  /* ---------- MOVIMIENTO ---------- */
  --mx-dur-micro:  120ms;  /* hover, color */
  --mx-dur-ui:     200ms;  /* aparición, opacidad */
  --mx-dur-layout: 450ms;  /* enfoque del mosaico */
  --mx-ease-std:   cubic-bezier(.2,.7,.3,1);
  --mx-ease-inout: cubic-bezier(.4,0,.2,1);
  --mx-ease-out:   cubic-bezier(0,0,.2,1);

  /* ---------- CAPAS ---------- */
  --mx-z-base:     0;
  --mx-z-sticky:   100;
  --mx-z-dropdown: 200;
  --mx-z-overlay:  800;
  --mx-z-modal:    900;
  --mx-z-toast:    1000;

  /* ---------- LAYOUT ---------- */
  --mx-container:   1080px;
  --mx-gutter:      24px;   /* < 860px */
  --mx-gutter-lg:   32px;   /* >= 860px */
  --mx-header-h:    56px;
  --mx-sidebar-w:   280px;
}
```

### Modo oscuro (panel del entrevistador)

```css
[data-theme="dark"] {
  --mx-bg:           var(--mx-n-900);
  --mx-surface:      var(--mx-n-800);
  --mx-surface-sunk: #14181F;
  --mx-border:       var(--mx-n-700);
  --mx-text:         #E6E9EF;
  --mx-text-muted:   #8C96A8;
  --mx-accent:       var(--mx-iris-lift);
  --mx-accent-wash:  rgba(90,80,238,.16);
}
```

---

## 2. Tokens — Tailwind (copiar y pegar)

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        iris: {
          50:'#F0EFFC',100:'#E7E5FB',200:'#CDC8F7',300:'#A9A1F0',400:'#7D72E8',
          500:'#4F42E3',600:'#3B2FD8',700:'#2E24AE',800:'#241C87',900:'#1A1463',
          lift:'#5A50EE',
        },
        ink: {
          0:'#FFFFFF',25:'#F7F8FA',50:'#EDEFF4',100:'#E2E5EC',200:'#D8DCE5',
          300:'#C0C6D2',400:'#9AA2B1',500:'#5C6577',600:'#454D5E',700:'#252C3B',
          800:'#191E29',900:'#0F1219',
        },
        state: {
          advance:'#1D9A6C', 'advance-bg':'#E6F3EC', 'advance-text':'#14704F',
          explore:'#2E86C8', 'explore-bg':'#E6F0F9', 'explore-text':'#1F6296',
          stuck:'#C97A12',   'stuck-bg':'#FBF0DF',   'stuck-text':'#94590D',
          fail:'#D6423F',    'fail-bg':'#FBEBEA',    'fail-text':'#A32F2D',
          done:'#14807E',    'done-bg':'#E3F1F1',    'done-text':'#0E5F5D',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"','ui-sans-serif','system-ui','sans-serif'],
        sans:    ['Inter','ui-sans-serif','system-ui','sans-serif'],
        mono:    ['"JetBrains Mono"','ui-monospace','Menlo','monospace'],
      },
      fontSize: {
        'display-xl':['104px',{lineHeight:'104px',letterSpacing:'-0.042em',fontWeight:'800'}],
        'display-lg':['72px', {lineHeight:'72px', letterSpacing:'-0.040em',fontWeight:'800'}],
        'display-md':['46px', {lineHeight:'48px', letterSpacing:'-0.035em',fontWeight:'800'}],
        'display-sm':['32px', {lineHeight:'36px', letterSpacing:'-0.030em',fontWeight:'800'}],
        'title':     ['24px', {lineHeight:'30px', letterSpacing:'-0.025em',fontWeight:'700'}],
        'subtitle':  ['20px', {lineHeight:'26px', letterSpacing:'-0.020em',fontWeight:'700'}],
        'body-lg':   ['18px', {lineHeight:'28px', letterSpacing:'-0.005em'}],
        'body':      ['16px', {lineHeight:'24px', letterSpacing:'0'}],
        'body-sm':   ['14px', {lineHeight:'20px', letterSpacing:'0'}],
        'caption':   ['13px', {lineHeight:'18px', letterSpacing:'0'}],
        'code':      ['13px', {lineHeight:'22px', letterSpacing:'0'}],
        'meta':      ['12px', {lineHeight:'18px', letterSpacing:'0.02em'}],
        'label':     ['11px', {lineHeight:'12px', letterSpacing:'0.14em',fontWeight:'700'}],
        'chip':      ['10px', {lineHeight:'10px', letterSpacing:'0.10em',fontWeight:'700'}],
      },
      spacing: {
        1:'4px',2:'8px',3:'12px',4:'16px',5:'20px',6:'24px',8:'32px',
        10:'40px',12:'48px',16:'64px',20:'80px',24:'96px',32:'128px',
      },
      borderRadius: {
        xs:'4px',sm:'6px',md:'8px',lg:'10px',xl:'12px','2xl':'14px','3xl':'18px',icon:'19px',
      },
      boxShadow: {
        sm:'0 1px 2px rgba(15,18,25,.06)',
        md:'0 4px 12px -2px rgba(15,18,25,.10)',
        lg:'0 12px 32px -8px rgba(15,18,25,.18)',
        panel:'0 24px 60px -28px rgba(15,18,25,.55)',
      },
      maxWidth: { container:'1080px' },
      screens: { xs:'480px', sm:'640px', md:'860px', lg:'1024px', xl:'1280px' },
      transitionTimingFunction: {
        std:'cubic-bezier(.2,.7,.3,1)',
        inout:'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
}
```

---

## 3. Tipografía

### Importación

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Las tres familias y su trabajo

| Familia | Rol | Pesos | Regla |
|---|---|---|---|
| **Bricolage Grotesque** | Display: titulares, taglines, números grandes | 700, 800 | Máximo 2 usos por pantalla. Nunca para párrafos ni etiquetas |
| **Inter** | Cuerpo: interfaz, reportes, formularios | 400, 500, 600 | Todo lo que se lee en frases |
| **JetBrains Mono** | Utilidad: datos auditables, código, estados | 400, 500, 700 | Si va en mono, el usuario debe poder verificarlo: hora, ID, test, evento |

### Escala completa (pixel perfect)

| Token | Familia | Tamaño | Interlínea | Tracking | Peso | Uso |
|---|---|---|---|---|---|---|
| `display-xl` | Bricolage | 104 px | 104 px | −4.2 % | 800 | Hero de marketing, solo ≥1024 px |
| `display-lg` | Bricolage | 72 px | 72 px | −4.0 % | 800 | Hero secundario / hero móvil de `xl` |
| `display-md` | Bricolage | 46 px | 48 px | −3.5 % | 800 | Título de sección |
| `display-sm` | Bricolage | 32 px | 36 px | −3.0 % | 800 | Título de tarjeta grande, mensaje vacío |
| `title` | Bricolage | 24 px | 30 px | −2.5 % | 700 | Cabecera de módulo, nombre de reto |
| `subtitle` | Bricolage | 20 px | 26 px | −2.0 % | 700 | Subsección, hallazgo del reporte |
| `body-lg` | Inter | 18 px | 28 px | −0.5 % | 400 | Bajada, enunciado del reto |
| `body` | Inter | 16 px | 24 px | 0 | 400 | Texto por defecto |
| `body-sm` | Inter | 14 px | 20 px | 0 | 400 / 600 | UI densa, botones, tabla |
| `caption` | Inter | 13 px | 18 px | 0 | 400 | Nota al pie, ayuda de campo |
| `code` | JetBrains | 13 px | 22 px | 0 | 400 | Editor, bloque de evidencia |
| `meta` | JetBrains | 12 px | 18 px | +2 % | 400 | Hora, ID de sesión, contador |
| `label` | JetBrains | 11 px | 12 px | +14 % | 700 | Eyebrow, encabezado de columna. **MAYÚSCULAS** |
| `chip` | JetBrains | 10 px | 10 px | +10 % | 700 | Chip de estado. **MAYÚSCULAS** |

### Escala responsiva del display

| Token | ≥1024 px | 860–1023 | 640–859 | <640 px |
|---|---|---|---|---|
| `display-xl` | 104 px | 80 px | 64 px | 52 px |
| `display-lg` | 72 px | 60 px | 50 px | 42 px |
| `display-md` | 46 px | 40 px | 34 px | 30 px |
| `display-sm` | 32 px | 30 px | 28 px | 26 px |

```css
/* fluido equivalente, sin media queries */
.mx-display-xl { font-size: clamp(52px, 9vw, 104px); line-height: 1.00; letter-spacing: -.042em; }
.mx-display-lg { font-size: clamp(42px, 6.6vw, 72px); line-height: 1.00; letter-spacing: -.040em; }
.mx-display-md { font-size: clamp(30px, 4.4vw, 46px); line-height: 1.05; letter-spacing: -.035em; }
.mx-display-sm { font-size: clamp(26px, 3.2vw, 32px); line-height: 1.12; letter-spacing: -.030em; }
```

### Clases listas

```css
.mx-display-xl,.mx-display-lg,.mx-display-md,.mx-display-sm,.mx-title,.mx-subtitle{
  font-family:var(--mx-font-display); font-weight:800; margin:0;
}
.mx-title    { font-size:24px; line-height:30px; letter-spacing:-.025em; font-weight:700; }
.mx-subtitle { font-size:20px; line-height:26px; letter-spacing:-.020em; font-weight:700; }

.mx-body-lg  { font:400 18px/28px var(--mx-font-body); letter-spacing:-.005em; }
.mx-body     { font:400 16px/24px var(--mx-font-body); }
.mx-body-sm  { font:400 14px/20px var(--mx-font-body); }
.mx-caption  { font:400 13px/18px var(--mx-font-body); color:var(--mx-text-muted); }

.mx-code     { font:400 13px/22px var(--mx-font-mono); }
.mx-meta     { font:400 12px/18px var(--mx-font-mono); letter-spacing:.02em; color:var(--mx-text-muted); }
.mx-label    { font:700 11px/12px var(--mx-font-mono); letter-spacing:.14em; text-transform:uppercase; }
.mx-chip-text{ font:700 10px/10px var(--mx-font-mono); letter-spacing:.10em; text-transform:uppercase; }
```

### Reglas duras

- Medida de lectura: **62 caracteres** máximo (`max-width: 62ch`) para `body` y `body-lg`.
- El display **nunca** se compone en mayúsculas ni se centra en bloques de más de dos líneas.
- El tracking negativo solo aplica a Bricolage. Inter va en 0; forzarlo negativo rompe la legibilidad a 14 px.
- Números tabulares obligatorios en cronómetro, contadores y tablas: `font-variant-numeric: tabular-nums;`
- Un solo `display-xl` por página.

---

## 4. Paleta de colores

### Marca

| Nombre | Hex | RGB | Uso |
|---|---|---|---|
| **Iris 600** | `#3B2FD8` | 59 47 216 | Color de marca. Acciones primarias, enlaces, nodo del logo, línea de evidencia |
| Iris 700 | `#2E24AE` | 46 36 174 | Hover / pressed sobre fondo claro |
| Iris Lift | `#5A50EE` | 90 80 238 | Acento sobre fondo oscuro |
| Iris 100 | `#E7E5FB` | 231 229 251 | Fondo de chip de marca, resaltado suave |
| **Tinta 900** | `#0F1219` | 15 18 25 | Texto principal, panel del entrevistador, superficie de editor |
| Tinta 800 | `#191E29` | 25 30 41 | Tile de candidato sobre panel |
| Tinta 700 | `#252C3B` | 37 44 59 | Borde sobre superficie oscura |
| **Pizarra 500** | `#5C6577` | 92 101 119 | Texto secundario, metadatos |
| Hairline 200 | `#D8DCE5` | 216 220 229 | Todos los bordes de 1 px |
| **Papel 50** | `#EDEFF4` | 237 239 244 | Fondo base de la aplicación |
| Blanco | `#FFFFFF` | 255 255 255 | Superficie de tarjeta y reporte |

### Estados operativos — **solo producto, nunca marca**

Verde, ámbar y rojo pertenecen a la señal. Si un botón usara esos colores se leería como alerta. Por eso el color de marca es iris: no aparece en ningún estado.

| Estado | Base | Fondo | Texto sobre claro | Sobre oscuro | Señal que lo dispara |
|---|---|---|---|---|---|
| **Avanza** | `#1D9A6C` | `#E6F3EC` | `#14704F` | `#4FD3A0` | Test nuevo aprobado, aspecto crítico cubierto |
| **Explorando** | `#2E86C8` | `#E6F0F9` | `#1F6296` | `#6FB6EC` | Ediciones frecuentes sin ejecutar |
| **Atascado** | `#C97A12` | `#FBF0DF` | `#94590D` | `#F0AE55` | Inactividad > umbral, mismo error repetido |
| **Fallo de entorno** | `#D6423F` | `#FBEBEA` | `#A32F2D` | `#FF8A87` | Error de runtime o red ajeno a la solución |
| **Finalizado** | `#14807E` | `#E3F1F1` | `#0E5F5D` | `#43C4C1` | Tests requeridos superados o envío explícito |

### Contraste verificado (WCAG AA)

| Combinación | Ratio | Resultado |
|---|---|---|
| Tinta 900 sobre Papel 50 | 15.9:1 | AAA |
| Pizarra 500 sobre Blanco | 5.9:1 | AA |
| Blanco sobre Iris 600 | 8.4:1 | AAA |
| Iris 600 sobre Blanco | 8.4:1 | AAA |
| `advance-text` sobre `advance-bg` | 5.6:1 | AA |
| `stuck-text` sobre `stuck-bg` | 5.9:1 | AA |
| `fail-text` sobre `fail-bg` | 6.1:1 | AA |
| Pizarra 400 sobre Blanco | 2.7:1 | **Solo decorativo, nunca texto** |

### Reglas de color

1. **Ningún estado se comunica solo por color.** Siempre chip con etiqueta de texto + razón legible.
2. El color de estado va en **borde izquierdo de 3 px** o en **chip con fondo suave**. Nunca como fondo completo de una fila o tarjeta: el panel no debe encenderse entero.
3. El nodo del logo es siempre iris. Pintarlo con un color de estado está prohibido.
4. Sin degradados en interfaz. El único degradado permitido es la sombra `panel`.
5. Máximo **tres** colores de estado visibles simultáneamente en el mosaico (hay tres candidatos).

---

## 5. Pixel perfect — geometría

### Rejilla y layout

| Propiedad | Valor |
|---|---|
| Unidad base | 4 px |
| Ancho de contenedor | 1080 px |
| Gutter lateral | 24 px (<860 px) · 32 px (≥860 px) |
| Columnas | 12 · gap 24 px |
| Altura de cabecera | 56 px |
| Ancho de barra lateral | 280 px |
| Separación entre secciones | 96 px desktop · 64 px móvil |
| Separación título → contenido | 40 px |
| Separación entre tarjetas | 16 px |

### Breakpoints

| Nombre | Ancho | Comportamiento |
|---|---|---|
| `xs` | 480 px | Una columna, mosaico apilado |
| `sm` | 640 px | Dos columnas en tarjetas |
| `md` | 860 px | Mosaico horizontal de 3, gutter sube a 32 px |
| `lg` | 1024 px | Panel + detalle lado a lado |
| `xl` | 1280 px | Display XL habilitado |

### Iconografía

| Contexto | Tamaño | Trazo |
|---|---|---|
| Inline en texto 13–14 px | 14 × 14 | 1.5 px |
| Botón, chip | 16 × 16 | 1.5 px |
| Cabecera, navegación | 20 × 20 | 1.75 px |
| Estado vacío | 24 × 24 | 2 px |

Trazos con `stroke-linecap: round` y `stroke-linejoin: round`, alineados a la rejilla de píxeles enteros.

### Logo — medidas exactas

| Propiedad | Valor |
|---|---|
| viewBox | `0 0 40 40` |
| Grosor de trazo | 3 (3.4 en app icon) |
| Radio del nodo | 4.5 |
| Recorridos | y = 10, 20, 30 |
| Altura mínima del símbolo | 20 px |
| Aire libre alrededor | 2 × diámetro del nodo = 45 % de la altura del símbolo por lado |
| Separación símbolo ↔ palabra | 0.29 × altura del símbolo (12 px cuando el símbolo mide 42 px) |
| App icon | 76 × 76 px, radio 19 px, símbolo al 60 % del lienzo |

```html
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label="Multix">
  <path d="M5 10H17C23.5 10 24 20 30 20" stroke="#0F1219" stroke-width="3" stroke-linecap="round"/>
  <path d="M5 20H30" stroke="#0F1219" stroke-width="3" stroke-linecap="round"/>
  <path d="M5 30H17C23.5 30 24 20 30 20" stroke="#0F1219" stroke-width="3" stroke-linecap="round"/>
  <circle cx="31.5" cy="20" r="4.5" fill="#3B2FD8"/>
</svg>
```

---

## 6. Pixel perfect — componentes

### Botón

| Talla | Alto | Padding H | Radio | Tipografía | Icono |
|---|---|---|---|---|---|
| `sm` | 30 px | 12 px | 6 px | Inter 600 · 12/14 | 14 px |
| `md` (default) | 36 px | 14 px | 8 px | Inter 600 · 13/16 | 16 px |
| `lg` | 44 px | 20 px | 10 px | Inter 600 · 15/18 | 16 px |

Gap icono↔texto: 8 px. Área táctil mínima: 44 × 44 px (usar padding invisible en `sm`).

```css
.mx-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:36px; padding:0 14px; border-radius:8px; border:none; cursor:pointer;
  font:600 13px/16px var(--mx-font-body); white-space:nowrap;
  background:var(--mx-iris-600); color:#fff;
  transition:background var(--mx-dur-micro) var(--mx-ease-std);
}
.mx-btn:hover        { background:var(--mx-iris-700); }
.mx-btn:active       { background:var(--mx-iris-800); transform:translateY(1px); }
.mx-btn:focus-visible{ outline:none; box-shadow:var(--mx-focus-ring); }
.mx-btn:disabled     { background:var(--mx-n-200); color:var(--mx-n-400); cursor:not-allowed; }

.mx-btn--ghost { background:transparent; color:var(--mx-iris-600); border:1px solid var(--mx-border); }
.mx-btn--ghost:hover { background:var(--mx-iris-50); border-color:var(--mx-iris-200); }
.mx-btn--danger{ background:var(--mx-fail); }
.mx-btn--sm { height:30px; padding:0 12px; border-radius:6px; font-size:12px; }
.mx-btn--lg { height:44px; padding:0 20px; border-radius:10px; font-size:15px; }
```

### Campo de formulario

| Propiedad | Valor |
|---|---|
| Alto | 40 px |
| Padding | 0 12 px |
| Radio | 8 px |
| Borde | 1 px `#D8DCE5` → foco 1.5 px iris + anillo |
| Etiqueta → campo | 6 px |
| Campo → texto de ayuda | 6 px |
| Campo → campo | 16 px |
| Textarea | mínimo 96 px, padding 12 px |

```css
.mx-input{
  width:100%; height:40px; padding:0 12px; border-radius:8px;
  border:1px solid var(--mx-border); background:var(--mx-surface);
  font:400 14px/20px var(--mx-font-body); color:var(--mx-text);
  transition:border-color var(--mx-dur-micro) var(--mx-ease-std);
}
.mx-input::placeholder{ color:var(--mx-n-400); }
.mx-input:focus{ outline:none; border-color:var(--mx-iris-600); box-shadow:var(--mx-focus-ring); }
.mx-input[aria-invalid="true"]{ border-color:var(--mx-fail); }
```

### Chip de estado

| Propiedad | Valor |
|---|---|
| Alto | 22 px |
| Padding H | 8 px |
| Radio | 999 px |
| Tipografía | JetBrains Mono 700 · 10 px · +10 % · MAYÚSCULAS |
| Punto opcional | 6 px, gap 6 px |

```css
.mx-chip{
  display:inline-flex; align-items:center; gap:6px;
  height:22px; padding:0 8px; border-radius:999px;
  font:700 10px/10px var(--mx-font-mono); letter-spacing:.10em; text-transform:uppercase;
}
.mx-chip--advance{ background:var(--mx-advance-bg); color:var(--mx-advance-text); }
.mx-chip--explore{ background:var(--mx-explore-bg); color:var(--mx-explore-text); }
.mx-chip--stuck  { background:var(--mx-stuck-bg);   color:var(--mx-stuck-text); }
.mx-chip--fail   { background:var(--mx-fail-bg);    color:var(--mx-fail-text); }
.mx-chip--done   { background:var(--mx-done-bg);    color:var(--mx-done-text); }
```

### Tarjeta

| Propiedad | Valor |
|---|---|
| Padding | 24 px (20 px en <640 px) |
| Radio | 14 px |
| Borde | 1 px `#D8DCE5` |
| Sombra | ninguna en reposo · `sm` en hover si es interactiva |
| Título → cuerpo | 8 px |
| Eyebrow → título | 16 px |

### Alerta del panel

| Propiedad | Valor |
|---|---|
| Padding | 14 px 16 px |
| Radio | 10 px |
| Borde | 1 px hairline + **3 px izquierdo** del color de estado |
| Gap contenido ↔ acción | 14 px |
| Título | Inter 600 · 14.5/20 |
| Meta | JetBrains Mono 400 · 11/16 · Pizarra |
| Alerta ↔ alerta | 12 px |

Toda alerta lleva **causa, hora y una acción**. Sin excepción.

```css
.mx-alert{
  display:flex; align-items:flex-start; gap:14px;
  padding:14px 16px; border-radius:10px;
  background:var(--mx-surface);
  border:1px solid var(--mx-border);
  border-left:3px solid var(--mx-stuck);
}
.mx-alert--fail{ border-left-color:var(--mx-fail); }
.mx-alert__title{ font:600 14.5px/20px var(--mx-font-body); margin-bottom:2px; }
.mx-alert__meta { font:400 11px/16px var(--mx-font-mono); color:var(--mx-text-muted); }
```

### Tile de candidato (mosaico)

| Propiedad | Valor |
|---|---|
| Contenedor del mosaico | padding 14 px · radio 18 px · fondo Tinta 900 |
| Gap entre tiles | 10 px |
| Tile: padding | 12 px |
| Tile: radio | 10 px |
| Tile: alto mínimo | 210 px |
| Tile: borde | 1 px Tinta 700 → hover/foco Iris Lift |
| Proporción en reposo | `1fr 1fr 1fr` |
| Proporción enfocada | `2.4fr 0.8fr 0.8fr` |
| Transición de enfoque | 450 ms `cubic-bezier(.4,0,.2,1)` |
| Cabecera del tile → contenido | 12 px |
| Líneas de código simuladas | alto 6 px · radio 3 px · gap 6 px |

**Requisito del PRD:** el cambio de foco debe completarse en **< 1 s**. La transición de 450 ms deja margen para el render de datos.

### Bloque de evidencia

| Propiedad | Valor |
|---|---|
| Borde izquierdo | 2 px iris |
| Padding izquierdo | 14 px |
| Margen vertical | 14 px |
| Tipografía | JetBrains Mono 400 · 12/20 |
| `white-space` | `pre-wrap` |

### Indicador de confianza

Tres barras de 14 × 5 px, radio 2 px, gap 3 px. Encendidas en iris, apagadas en hairline. Etiqueta `label` a la izquierda con gap 8 px.
Alta = 3 · Media = 2 · **Baja = 1 y obligatoriamente visible cuando el hallazgo no tiene evidencia.**

---

## 7. Movimiento

| Interacción | Duración | Curva |
|---|---|---|
| Hover, cambio de color | 120 ms | `cubic-bezier(.2,.7,.3,1)` |
| Aparición de alerta, toast | 200 ms | `cubic-bezier(0,0,.2,1)` |
| Enfoque del mosaico | 450 ms | `cubic-bezier(.4,0,.2,1)` |
| Entrada de página (escalonada) | 700 ms, retardo 100 ms entre elementos | `cubic-bezier(.2,.7,.3,1)` |
| Pulso «en vivo» | 2000 ms, infinito | `ease-in-out` |

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
  }
}
```

Nada parpadea más rápido de 3 Hz. El pulso del indicador «en vivo» es la única animación en bucle permitida en el panel: durante una entrevista, el movimiento compite con la atención del entrevistador.

---

## 8. Accesibilidad — mínimos no negociables

- Anillo de foco visible en **todo** elemento interactivo: 2 px de separación + 2 px iris. Nunca `outline: none` sin reemplazo.
- Área táctil mínima 44 × 44 px.
- Contraste 4.5:1 en texto, 3:1 en bordes de control e iconos con significado.
- Ningún estado se expresa solo por color: chip con texto + razón legible.
- Navegación completa por teclado en editor y panel. `Esc` sale del foco del mosaico.
- Los cambios de estado de un candidato se anuncian en una región `aria-live="polite"`.
- Zoom hasta 200 % sin pérdida de contenido ni scroll horizontal.

---

## 9. Checklist antes de entregar una pantalla

- [ ] Todo espaciado es múltiplo de 4 px
- [ ] Cero valores hex sueltos; todo viene de un token
- [ ] Un solo `display` grande por pantalla
- [ ] Texto de lectura ≤ 62 caracteres de ancho
- [ ] Los colores de estado no se usan para marca ni para acciones
- [ ] Cada alerta tiene causa, hora y acción
- [ ] Cada hallazgo de IA tiene evidencia o marca de confianza baja
- [ ] Foco de teclado visible en todos los controles
- [ ] Probado a 320 px de ancho y a 200 % de zoom
- [ ] `prefers-reduced-motion` respetado
