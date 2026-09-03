# SITIO_CONTEXT.md — Contexto técnico del sitio institucional INCLUSIA

> Documento vivo. Se actualiza en cada fase si algo relevante cambia.
> Repo: `Inclusia` (HTML/CSS/JS puro) — separado del monorepo `inclusia-platform` (app React de reportes, carpeta `apps/public`).
> Última actualización: 2026-08-31, fase "QA final / cierre del plan" (ver §6.12).
> Inventario base levantado tras `git pull` (fast-forward `e1402a9..428cadc`, 7 commits, rama `main`).
> Nota: existe una rama remota `agent/inclusia-accessibility-content-security` no fusionada — no se tocó en esta pasada.

---

## 1. Inventario de archivos

### 1.1 Páginas HTML **en producción** (enlazadas desde el nav y/o el sitemap)

| Página | Ruta | Notas |
|---|---|---|
| Home | `index.html` | Página única con secciones ancla: `#hero`, `#quienes-somos`, `#proposito`, `#donaciones`, `#contacto` |
| ¿Por qué existe INCLUSIA? | `Quienes-somos/por-que-existe.html` | Submenú "Quiénes somos" |
| Personas apoyando INCLUSIA | `Quienes-somos/personas-apoyando.html` | Submenú "Quiénes somos" |
| Nosotros (fundadores) | `Quienes-somos/nosotros.html` | Submenú "Quiénes somos" |
| Lo que queremos cambiar | `Quienes-somos/lo-que-queremos.html` | Submenú "Quiénes somos" |
| Hoy y futuro | `Quienes-somos/futuro.html` | Submenú "Quiénes somos" |
| Política de tratamiento de datos | `politica-tratamiento-datos.html` | Enlazada desde el checkbox de consentimiento del formulario de contacto |
| **Reporta una barrera** | `reporta-una-barrera/index.html` | **Añadida en la fase "Reporta una barrera"**. Vive en carpeta propia para URL limpia `/reporta-una-barrera/`. Ítem de primer nivel en el nav, entre Propósito y Donaciones |

Estas 8 páginas están listadas en `sitemap.xml`, apuntando todas a `https://inclusia-theta.vercel.app/...`.

**Convención de rutas — dos patrones conviven**: las páginas de `Quienes-somos/` son archivos `.html` nombrados dentro de una carpeta compartida (`Quienes-somos/nosotros.html`), mientras que `reporta-una-barrera/` usa el patrón carpeta + `index.html` para obtener una URL sin extensión. Si se agregan páginas nuevas, preferir el patrón de carpeta + `index.html` (URL más limpia y estable); no hace falta migrar las existentes.

### 1.2 Archivos HTML **sin usar / legacy** (no referenciados desde ninguna página real)

- `pages/about.htm`, `pages/accessibility.htm`, `pages/contact.html`, `pages/services.html`
- `forms/contact-form.html`, `forms/donation-form.html`, `forms/feedback.html`
- `components/header.html` — **vacío** (0 bytes)
- `components/navbar.html` — **vacío** (0 bytes)
- `components/footer.html` — tiene contenido pero **no se incluye desde ningún sitio**; el footer real vive duplicado dentro de `index.html` y de cada página de `Quienes-somos/`.

`vercel.json` marca `/pages/*`, `/forms/*` y `/components/*` con `X-Robots-Tag: noindex, nofollow, nosnippet`, confirmando que son residuos intencionalmente ocultos de buscadores, no rutas activas. **No se tocaron ni se borraron** — quedan documentados por si se quiere limpiar en una fase futura.

### 1.3 Estructura de `/assets`

```
assets/
├── css/            (17 archivos, ver §1.4)
├── JS/             (19 archivos, ver §1.4)
└── img/
    ├── *.png / *.jpg / *.jpeg   — logo, hero, fotos de equipo (andrea-ortiz, camilo-botero,
    │                              cristian-mallarino, david-betancurt, fundadorC), fotos de barreras
    │                              de accesibilidad (Andenes-sin-continuidad, Banos-accesibles,
    │                              Rampas-que-no-existen, Transporte-inaccesible, etc.)
    ├── *.svg                    — íconos de redes sociales (facebook, instagram, tiktok, x)
    └── carousel/                — imágenes/SVG usados en el carrusel del home
```

No hay una carpeta `/icons` separada; los íconos de redes sociales están sueltos en `assets/img/` junto con las fotos.

### 1.4 Organización de CSS y JS — **no hay sistema de includes/plantillas**

Cada HTML repite manualmente su propio `<nav>` y `<footer>` completos (confirmado comparando `index.html` y `Quienes-somos/nosotros.html`: mismo bloque de nav copiado, con rutas relativas ajustadas `../assets/...` en las subpáginas). `components/*.html` existe pero **no se usa como sistema de plantillas real** — no hay `fetch()`, SSI, ni build step que lo inyecte.

**CSS**: no es un archivo global único; es una combinación de CSS **global compartido** + **CSS por página/sección**, todos cargados como `<link>` independientes en el `<head>` de cada HTML (sin bundler):

- Global/compartido (cargado en casi todas las páginas): `variables.css`, `base.css`, `accessibility.css`, `animations.css`, `reduce-motion.css`
- Por página/sección: `layout.css` + `home-hero.css` + `home-storytelling.css` (home), `forms.css` (formularios), `privacy-policy.css` (política de datos), `quienes-nosotros.css`, `quienes-futuro.css`, `quienes-lo-que-queremos.css`, `quienes-por-que-existe.css` (cada subpágina de Quienes-somos tiene su propio CSS dedicado), `reporta-una-barrera.css` (página "Reporta una barrera"), `carousel.css`, `conponents.css` *(sic, typo en el nombre de archivo real)*, `main.css` (legacy, revisar si sigue en uso)

**Convención confirmada**: el CSS de cada página vive siempre en `assets/css/`, sin importar en qué carpeta esté su HTML. `reporta-una-barrera/index.html` carga `../assets/css/reporta-una-barrera.css` — el CSS **no** se mete dentro de la carpeta de la página.

**JS**: tampoco es un solo archivo — `main.js` es el **entry point tipo orquestador** (`<script type="module" src="assets/JS/main.js">`) que hace `import` de módulos ES independientes en este orden:

```js
reduce-motion.js → page-transitions.js → smooth-scroll-global.js → navbar.js →
scroll-animations.js → form.js → donate.js → accessibility.js →
floating-accessibility.js → interface-zoom.js → text-to-speech.js →
keyboard-navigation.js → back-to-top.js
```

El home además carga un segundo módulo aparte: `home-storytelling.js`, y `reporta-una-barrera/index.html` carga `reporta-una-barrera.js` con el mismo patrón (ver §6.1.1). Las páginas de `Quienes-somos/futuro.html` cargan `quienes-futuro.js` y usan datos de `project-timeline-data.js`. `accessibility-menu.js` y `accessibility-mobile.js` existen pero no aparecen importados desde `main.js` (revisar si son legacy o se cargan aparte en alguna página específica no auditada línea por línea).

No hay generador estático, ni npm build, ni bundler: cada `<script>`/`<link>` es un archivo servido tal cual.

---

## 2. Sistema visual real (extraído de `assets/css/variables.css` y `base.css`)

### 2.1 Paleta de colores

`variables.css` es el archivo de variables globales del sitio, cargado por todas las páginas. Definía originalmente **solo 5 variables de color**; en la fase "Reporta una barrera" se **extendió de forma aditiva** (sin tocar ni renombrar las originales, sin refactorizar ningún CSS existente):

```css
:root {
  /* --- Originales, intactas --- */
  --blue: #4A90E2;
  --purple: #7B61FF;
  --background: #F5F7FF;
  --text: #1F2933;
  --white: #FFFFFF;

  /* --- Añadidas (valores REALES ya en uso, no una paleta nueva) --- */
  --theme-color: #6366F1;        /* = <meta name="theme-color"> y site.webmanifest */
  --purple-alt: #6B6BFF;         /* el rgba(107,107,255,...) repetido en base.css */
  --purple-alt-rgb: 107, 107, 255;
  --blue-rgb: 74, 144, 226;      /* tripletes para componer rgba(var(--x-rgb), alpha) */
  --purple-rgb: 123, 97, 255;
  --text-rgb: 31, 41, 51;
  --error: #DC2626;              /* el rojo de validación de formularios */

  /* Añadidas en la fase "Rediseño del nav", por contraste WCAG (ver abajo) */
  --theme-color-strong: #4338CA;
  --theme-color-strong-soft: #5B54E8;
}
```

**Sobre `--theme-color-strong`**: es lo único cuyo valor **no** venía ya del sitio, y existe por una razón medible, no estética. El gradiente `--blue → --theme-color` que usa `.btn-primary` da, con texto blanco, entre **3.3:1 y 4.47:1** — por debajo del mínimo WCAG AA de 4.5:1 para texto normal. El CTA del nav usa la variante oscura y llega a **7.9:1 / 5.4:1**. Es el mismo índigo de marca, más profundo.

⚠️ **Deuda conocida**: `.btn-primary` (todos los botones primarios del sitio: hero, donaciones, formulario, CTA final de "Reporta una barrera") **sigue con el gradiente de bajo contraste**. No se tocó para no alterar la apariencia de páginas en producción sin una decisión explícita. Vale la pena resolverlo en una fase dedicada — es justo el tipo de detalle que una corporación de accesibilidad no debería dejar pasar.

**Por qué `--theme-color` y `--purple` son variables distintas**: `#6366F1` (theme-color de las meta tags) y `#7B61FF` (`--purple`) son tonos parecidos pero **no idénticos**, y ya convivían en el sitio antes de esta fase. Se nombraron por separado en vez de forzarlos a ser el mismo color, para no alterar la apariencia de ninguna página existente. Si en el futuro se quiere unificar, es una decisión de diseño consciente, no un arreglo automático.

**Pendiente de limpieza (no urgente)**: el CSS de las páginas existentes sigue usando los `rgba(...)` hardcodeados directamente (`base.css` tiene docenas). Las variables nuevas están disponibles para usarlas, pero **no se hizo un refactor masivo** para no arriesgar regresiones visuales en páginas ya en producción.

**Ojo con los temas de accesibilidad**: `accessibility.css` redefine `--blue` y `--purple` dentro de `body.theme-dark`, `body.theme-soft` y `body.theme-colorblind`. Los tripletes RGB nuevos (`--blue-rgb`, etc.) **no** se redefinen por tema, así que dentro de bloques `body.theme-dark` hay que seguir escribiendo los `rgba()` literales del tema oscuro (p. ej. `rgba(155, 140, 255, ...)` = `#9B8CFF`, el `--purple` oscuro). Es exactamente lo que hace `reporta-una-barrera.css`.

Ejemplos de colores hardcodeados repetidos en `base.css` (no centralizados en variables):
- `rgba(107, 107, 255, ...)` — variante de púrpura, usada en foco, sombras, bordes (docenas de apariciones)
- `rgba(74, 144, 226, ...)` — variante de azul, usada en botones/CTAs
- `rgba(220, 38, 38, ...)` — rojo de error/validación de formularios
- `rgba(0, 0, 0, ...)` — sombras neutras

**Recomendación para trabajo futuro**: si se va a construir la página nueva, conviene extender `variables.css` agregando `--theme-color: #6366f1` (o alinear con `--purple`) y variables para los rgba repetidos, en vez de seguir hardcodeando. No se hizo en esta fase de inventario para no alterar el sitio sin permiso explícito.

### 2.2 Tipografía

- **Familia**: `Poppins`, cargada desde **Google Fonts** (no hay archivos de fuente locales):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ```
- Variable CSS: `--font-primary: 'Poppins', system-ui, sans-serif;`
- Pesos disponibles como variables: `--font-weight-normal: 400`, `--font-weight-medium: 500`, `--font-weight-semibold: 600`, `--font-weight-bold: 700` (coinciden con los pesos cargados de Google Fonts: 400;500;600;700).

### 2.3 Espaciado

No existe un sistema formal de variables de espaciado (`--space-*`) en `variables.css`. El espaciado se maneja con valores fijos en cada regla CSS (px/rem sueltos), no tokenizado.

### 2.4 Breakpoints responsive ya definidos

El breakpoint dominante y consistente en todo el sitio es **`768px`** (aparece en prácticamente todos los archivos CSS: `base.css`, `layout.css`, `home-hero.css`, `home-storytelling.css`, `quienes-nosotros.css`, `carousel.css`, `forms.css`, `quienes-por-que-existe.css`, `quienes-lo-que-queremos.css`, `accessibility.css`). Patrón típico: `@media (min-width: 769px)` para desktop y `@media (max-width: 768px)` para móvil.

Breakpoints secundarios usados puntualmente:
- `max-width: 1024px` (tablet/desktop intermedio — `base.css`, `quienes-nosotros.css`)
- `max-width: 920px` y `max-width: 900px` (ajustes específicos de `quienes-lo-que-queremos.css` y `carousel.css`)
- `max-width: 480px` (móvil pequeño — `base.css`, `layout.css`, `carousel.css`)
- `max-width: 42rem` / `max-width: 40rem` (equivalentes a ~672px/640px, usados en `quienes-futuro.css` y `privacy-policy.css` en unidades rem en vez de px — inconsistencia menor a tener en cuenta)

No hay variables CSS para breakpoints (no se pueden usar en `@media` de todos modos sin PostCSS), pero si se documenta un estándar de facto: **768px es el corte móvil/desktop del sitio**.

### 2.5 Radios de borde y sombras ya usados

No están tokenizados como variables; son valores repetidos directamente:

- **Border-radius** más comunes: `4px` (elementos pequeños/inputs), `6px`, `8px`, `10px`, `12px` (cards, botones), `16px` (contenedores grandes), `50%` (círculos/avatares), `999px` (píldoras/toggle).
- **Box-shadow** más comunes:
  - Botones primarios: `0 4px 15px rgba(74, 144, 226, 0.3)` (reposo) → `0 8px 25px rgba(107, 107, 255, 0.4)` (hover)
  - Cards: `0 4px 30px rgba(0, 0, 0, 0.05)` / `0 10px 30px rgba(0, 0, 0, 0.15)`
  - Foco accesible: `0 0 0 2px rgba(107, 107, 255, 0.3)` (outline morado tipo "ring", 2-4px)
  - Error de formulario: `0 0 0 2px rgba(220, 38, 38, 0.1)` / `...0.2)`

---

## 3. Accesibilidad ya construida — patrón a replicar

### 3.1 Skip links

Implementados de forma **idéntica** en `index.html` y `politica-tratamiento-datos.html` (las páginas de `Quienes-somos/` también los usan según el grep, pero solo con el de contenido principal — revisar si conviene homogeneizar). Markup exacto (van justo después de `<body>`, antes del nav):

```html
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>
<a href="#nav-menu" class="skip-link">Saltar a la navegación</a>
<a href="#contacto" class="skip-link">Saltar al formulario de contacto</a>
```

- Destinos por `id`: `#main-content` (en el `<main id="main-content" role="main">`), `#nav-menu` (en el `<ul class="nav-links" id="nav-menu" role="menubar">`), `#contacto` (sección de formulario de contacto).
- **CSS exacto** (`assets/css/base.css:2-18`):
  ```css
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--purple);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: var(--font-weight-semibold);
    z-index: 10000;
    transition: top 0.3s ease;
  }
  .skip-link:focus {
    top: 6px;
  }
  ```
  Patrón: oculto fuera de viewport (`top: -40px`) y se revela (`top: 6px`) solo con `:focus` (teclado), transición suave. Para replicar en una página nueva basta reutilizar la misma clase `.skip-link` de `base.css` (ya es global) y apuntar los `href` a los ids reales de esa página.

### 3.2 Utilidad `.sr-only`

También en `base.css:21-31`, patrón estándar de "visualmente oculto pero accesible a lectores de pantalla" (clip-rect + 1px + overflow hidden). Se usa para textos de ayuda de formulario (`#tipo-help`, `#privacy-consent-details` complementos, etc.).

### 3.3 Otros patrones de accesibilidad ya presentes (documentados en `ACCESIBILIDAD-AVANZADA.md`, verificar que sigan vigentes tras refactors recientes)

- Landmarks ARIA (`role="navigation"`, `role="main"`, `role="contentinfo"`, `role="region"`)
- Menú flotante de accesibilidad (`floating-accessibility.js` + `#floating-accessibility-btn`) con temas: predeterminado, colores suaves, modo oscuro, daltonismo, y botón de texto a voz (`text-to-speech.js`)
- `interface-zoom.js` y `reduce-motion.js` (respetan `prefers-reduced-motion`, ver `reduce-motion.css`)
- Formulario con `aria-invalid`, `aria-describedby`, `aria-live="polite"` por campo, gestionado por `assets/JS/form.js` (recientemente endurecido, ver `SECURITY_NOTES.md`)

---

## 4. Nav actual — estructura exacta

**Vigente: la fase "Nav de escritorio + mega-menú" (§4.4) por encima de 1024px; todo lo de esta sección (originalmente fase "Hamburguesa permanente") sigue vigente sin cambios por debajo de 1024px.** No son fases alternativas — conviven, cada una en su rango de ancho. Si vas a tocar el nav, lee las dos secciones completas antes de empezar.

Definido inline en cada página (no hay componente reutilizable real, ver §1.4). **El nav está en las 8 páginas, idéntico y verificado**, incluida `politica-tratamiento-datos.html`.

Rediseño completo: la barra visible se redujo a **3 elementos, iguales en todos los anchos de pantalla** — ya no hay una versión "de escritorio" con links horizontales separada de una versión móvil con hamburguesa. La hamburguesa es el patrón permanente del sitio.

```
Barra:  [Logo]                                    [Reporta una barrera →] [☰/✕]
Panel (off-canvas, sale desde la derecha, abre con ☰):
  Inicio (#hero)
  Quiénes somos ▾ (acordeón, ya no dropdown flotante)
    ├── ¿Por qué existe INCLUSIA?      → Quienes-somos/por-que-existe.html
    ├── Personas apoyando INCLUSIA      → Quienes-somos/personas-apoyando.html
    ├── Nosotros                        → Quienes-somos/nosotros.html
    ├── Lo que queremos cambiar         → Quienes-somos/lo-que-queremos.html
    └── Hoy y futuro                    → Quienes-somos/futuro.html
  Propósito (#proposito)
  Donaciones (#donaciones)
  Contáctanos (#contacto)
```

**"Reporta una barrera" ya no vive dentro del panel** (no es un `<li>` de `.nav-links`) — es su propio elemento a nivel de barra, `<a class="nav-cta-btn">`, para que sea, junto al logo, lo único visible sin interactuar con nada.

### 4.0 Markup — bloque a replicar en páginas nuevas

```html
<nav class="navbar" role="navigation" aria-label="Navegación principal">
  <div class="nav-container">
    <div class="brand">...</div>

    <div class="nav-actions">
      <a href="reporta-una-barrera/" class="nav-cta-btn">
        Reporta una barrera
        <svg class="nav-cta-arrow" ...>...</svg>
      </a>
      <button class="hamburger-btn" id="hamburger-menu"
              aria-label="Abrir menú de navegación"
              aria-expanded="false" aria-controls="nav-right">
        <span class="hamburger-line" aria-hidden="true"></span>
        <span class="hamburger-line" aria-hidden="true"></span>
        <span class="hamburger-line" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</nav>

<!-- Overlay + panel: FUERA de <nav>, hermanos suyos -->
<div class="nav-overlay" id="nav-overlay" aria-hidden="true"></div>
<div class="nav-right" id="nav-right">
  <ul class="nav-links" id="nav-menu" role="menubar">...</ul>
  <div class="menu-content">...</div>
</div>
```

**Por qué el overlay y el panel están fuera de `<nav>`** (la parte no obvia, va a volver a morder si se olvida): `.navbar` tiene `backdrop-filter: blur(...)`, y eso crea un ["containing block"](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block) para cualquier descendiente `position:fixed`. Con `#nav-overlay`/`#nav-right` anidados dentro de `.navbar` (como estaban originalmente, heredado del patrón "solo móvil" de la Fase 4 anterior):
1. `#nav-overlay { inset:0 }` quedaba limitado a la altura de la barra (~56-62px) en vez de cubrir la pantalla completa — el "clic afuera cierra el panel" nunca funcionaba en desktop/tablet, solo el link/Escape/overlay-que-no-se-veía.
2. `#nav-right` (400px, `transform:translateX(100%)` cuando está cerrado) inflaba el ancho scrolleable del documento en ~400px — una barra de scroll horizontal enorme, visible incluso con el panel cerrado.

Sacarlos como hermanos de `<nav>` (hijos directos de `<body>`) resuelve ambos. Costo: todo selector que antes era `.navbar .nav-right ...` tuvo que pasar a `.nav-right ...` en `layout.css` (35+ reglas).

### 4.0.1 Orden de z-index (la otra trampa)

Con el panel fuera de `.navbar`, su `z-index` ya no se compara solo "entre hermanos dentro de `.navbar`" sino **contra `.navbar` completa**, globalmente:

| Elemento | z-index | Por qué |
|---|---|---|
| `.nav-overlay` | 999 | Debajo de la barra — si empata o gana, el `backdrop-filter` de `.navbar` mezcla el negro del overlay detrás y tiñe toda la barra de gris (bug real, visto y corregido). |
| `.navbar` | 1002 | Encima del panel (1001) — si no, el panel (que ahora es hermano, no hijo) tapa la hamburguesa/X, que necesita seguir clickeable para cerrar. |
| `#nav-right` (el panel) | 1001 | Encima del overlay, debajo de la barra. |
| `.hamburger-btn` | 1002 (local) | Redundante con lo anterior pero inofensivo — ya no es lo que decide el orden, `.navbar` como unidad sí. |

Además, `.nav-overlay` usa `top: [alto de la barra]` (62/56/52px según breakpoint) en vez de `inset:0`, para no empezar **detrás** de la barra semitransparente (mismo problema del punto anterior, causa distinta).

### 4.0.2 CTA oculto mientras el panel está abierto

`body.menu-open .nav-cta-btn { opacity:0; pointer-events:none; }`. Sin esto, en pantallas ≤480px (panel a 100vw) la X — fijada a la esquina real del viewport, ver abajo — quedaba literalmente encima del texto "Reporta una barrera". En pantallas anchas también evita que el CTA compita visualmente con el panel abierto.

### 4.0.3 La X, al abrir, se fija a la esquina real del panel

`.hamburger-btn.active { position: fixed; top: 11px; right: 16px; }`. Sin esto, en viewports >1248px (donde `.nav-container` deja de crecer por su `max-width:1200px` y queda centrado) la X quedaba "flotando" a mitad de camino entre el contenido centrado y el borde real del panel (que sí llega hasta `right:0`), sin verse anclada a nada.

### 4.1 Comportamiento (igual en todos los anchos, ya no hay rama "desktop" vs "móvil")

Controlado por `assets/JS/navbar.js` (sin cambios de lógica en esta fase, solo se quitó el auto-cierre al hacer `resize` a >768px — ya no aplica, el panel se comporta igual en cualquier ancho):

- Click en hamburguesa → toggle `openMenu()`/`closeMenu()`, que agrega/quita `.active` en `#nav-right`, `#nav-overlay` y `body.menu-open`.
- `aria-expanded` del botón hamburguesa se sincroniza (`true`/`false`); `aria-controls` apunta a `nav-right` (el panel completo, antes apuntaba a `nav-menu`, solo el `<ul>`).
- Overlay de fondo cierra el menú al hacer click fuera (ver §4.0 — ahora sí funciona en todos los anchos).
- `Escape` cierra el menú y devuelve el foco al botón hamburguesa.
- Al abrir, el foco se mueve automáticamente al primer link del menú (`setTimeout` 350ms, alineado con la transición CSS).
- **Focus trap** implementado a mano dentro de `#nav-right` mientras está `.active` (Tab/Shift+Tab ciclan solo entre los elementos focusables visibles del menú).
- Todos los links normales cierran el menú al hacer click.

### 4.2 Patrón de accesibilidad del submenú "Quiénes somos"

Ya **no es un flyout de escritorio + acordeón móvil** — es siempre acordeón vertical dentro del panel, en cualquier ancho (`max-height` animado, sin `position:absolute`). El HTML y el manejo de teclado en `navbar.js` no cambiaron:

- El toggle es un `<button class="dropdown-toggle" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="submenu-quienes-somos">`.
- El submenú es `<ul role="menu" aria-label="Submenú de Quiénes somos">` con items `role="menuitem" tabindex="-1"`.
- `Enter`/`Espacio`/`ArrowDown` en el toggle abren; `ArrowDown`/`ArrowUp` navegan entre items del submenú (wrap-around); `Escape` cierra y devuelve el foco al toggle; click fuera del `.dropdown` cierra todos los dropdowns activos.

Si se agregan más submenús o páginas al nav, **replicar esta misma estructura HTML + el mismo bloque de `navbar.js`**.

### 4.3 Historial — nav móvil previo a esta fase

Antes de "Hamburguesa permanente" el sitio tuvo dos fases de nav: el patrón hamburguesa-solo-móvil original, y un rediseño del drawer móvil (drawer real en tablet 481-768px vs. pantalla completa ≤480px, panel saliendo desde la **izquierda**, fondo `var(--background)`, franja de marca de 4px). Esta fase reutilizó esas piezas (franja de marca, breakpoint de pantalla completa a 480px) pero **invirtió el lado** (el panel ahora sale desde la **derecha**, no la izquierda) y las hizo universales en vez de exclusivas de `@media (max-width: 768px)`.

### 4.4 Fase "Nav de escritorio + mega-menú" — vigente, reemplaza el patrón "hamburguesa permanente" de arriba en ≥1024px

"Hamburguesa permanente" dejó de ser universal: por debajo de 1024px sigue exactamente igual (todo lo de arriba — barra de 3 elementos, panel off-canvas, acordeón). Desde 1024px aparece un nav de escritorio horizontal estilo Apple, con "Quiénes somos" como mega-menú.

**HTML — dos bloques de marcado, no uno reubicado.** Dentro de `.nav-container`, entre `.brand` y `.nav-actions`, se agregó un `<ul class="nav-links-desktop">` con los mismos 5 ítems (Inicio, Quiénes somos, Propósito, Donaciones, Contáctanos) + un `.megamenu-item` (trigger + panel) para Quiénes somos. Dentro de `#nav-right` (el panel off-canvas), entre `</ul>` y `.menu-content`, se agregó un `.nav-panel-cta` con una segunda instancia del CTA. Decisión deliberada: sin sistema de includes, mover un único `<ul>` por JS entre la barra y el panel dejaría el nav de escritorio dependiente de reubicar nodos del DOM — más frágil que la duplicación de marcado que el sitio ya practica entre sus 8 páginas.

- `.nav-links-desktop` y `.nav-actions .nav-cta-btn` (la instancia de la barra) están `display:none` por defecto y solo se activan en `@media (min-width:1024px)`.
- En ese mismo breakpoint, `.hamburger-btn`, `.nav-overlay` y `#nav-right` pasan a `display:none` — no basta con que el panel quede fuera de pantalla por `transform`, porque eso lo deja igual alcanzable con Tab.
- El CTA de la barra (`.nav-actions .nav-cta-btn`) es una instancia compacta (36px, 13px) del mismo `.nav-cta-btn` de siempre — mismos estilos base, mismos overrides de tema, solo escalado por ancestro.

**Mega-menú "Quiénes somos" — patrón disclosure, no menu/menuitem.** A diferencia del acordeón móvil (roving tabindex tipo menú, con `role="menu"`/`role="menuitem"` y flechas), el brief pidió explícitamente que el mega-menú sea alcanzable con **Tab** en orden de documento. Por eso el trigger es un botón simple con `aria-haspopup="true"`/`aria-expanded` (sin `role="menuitem"`) y los links del panel son `<a>` normales sin `tabindex="-1"`. `aria-expanded` en el trigger es el único origen de verdad de "abierto" — lo pone/quita `navbar.js` (hover, foco, click, Escape) y el CSS solo lee ese atributo (`.megamenu-trigger[aria-expanded="true"] + .megamenu-panel`), nunca `:hover`/`:focus-within` por su cuenta, para que hover/foco/Escape no queden desincronizados entre sí.

Dos bugs reales que salieron al probar con Playwright y valen para cualquier patrón disclosure similar:
1. **Click no puede ser un toggle simple**: `mouseenter` ya abre el panel antes de que el evento `click` llegue a dispararse, así que un `click` que alterna sobre `aria-expanded` actual lo cierra de inmediato en cuanto un usuario con mouse hace clic. Arreglo: `click` siempre abre (idempotente), nunca cierra.
2. **`trigger.focus()` dentro del handler de Escape reabre el panel**: al devolver el foco al trigger tras cerrar, se dispara `focusin` (que abre por diseño, para el caso normal de llegar por Tab), deshaciendo el `close()` que Escape acababa de hacer. Arreglo: bandera `suppressReopen` que se activa antes de `trigger.focus()` y se libera en un `setTimeout(...,0)`.

**Contraste**: el subrayado/estado activo/hover de `.nav-links-desktop` y el mega-menú usan `--theme-color-strong` (7.9:1 sobre blanco), no `--purple` (4.2:1, por debajo del mínimo AA 4.5:1 para texto normal — `--purple` sigue en uso en el resto del sitio para texto más grande, no se tocó ahí).

El botón `.megamenu-trigger` es un `<button>`: sin resetear `box-shadow`/`border-radius`/`margin` explícitamente hereda esas propiedades de la regla genérica `button{...}` de `base.css` — el mismo bug ya documentado y corregido ahí mismo para `.dropdown-toggle` (ver "FIX: sombra heredada en el toggle del submenú").

Ver `assets/css/layout.css` (sección "NAV DE ESCRITORIO — ≥1024px") y `assets/JS/navbar.js` (sección "MEGA-MENÚ DE ESCRITORIO") para el código completo, incluidos los overrides por tema (dark/high-contrast/soft/colorblind) y `prefers-reduced-motion`.

---

## 5. Deployment

- **Plataforma**: Vercel, confirmado por `vercel.json` en la raíz.
- **Sin build step**: `vercel.json` declara explícitamente `"framework": null`, `"buildCommand": ""`, `"installCommand": ""`, `"outputDirectory": "."` — Vercel sirve el repo **tal cual**, como sitio estático puro. No hay generador estático (no Jekyll/Eleventy/Astro/etc.), no hay `package.json` con scripts de build.
- **Redirects configurados**: `/index.html` → `/` (permanent).
- **Headers configurados**: `noindex, nofollow, nosnippet` para `/components/*`, `/forms/*`, `/pages/*` y algunos archivos `.md`/`.txt` sueltos (para que Google no indexe el contenido legacy/interno).
- **URL de producción de este sitio**: `https://inclusia-theta.vercel.app/` (confirmado por `canonical`, Open Graph, JSON-LD y `sitemap.xml` en múltiples archivos).
- Existía un `server.js` que fue **eliminado** en el último pull (7 commits atrás) — coherente con que no hay backend propio; todo el envío de formulario va directo a Formspree (`https://formspree.io/f/xzbywokn`) desde el cliente.

**Conclusión práctica**: agregar una página nueva a este sitio es tan simple como crear un archivo `.html` nuevo (siguiendo el patrón de nav/footer duplicado manual + los `<link>`/`<script>` de CSS/JS que correspondan) y opcionalmente sumarlo a `sitemap.xml`. No hay que integrarlo a ningún proceso de build ni tocar `vercel.json` salvo que se quiera un header o redirect especial.

---

## 6. URL de producción de la app de reportes (React, monorepo `inclusia-platform`, carpeta `apps/public`)

**Corregida en la fase "CTA final"**: `https://reportes-inclusia-public.vercel.app/`

⚠️ **La entrada anterior de esta sección estaba mal.** Decía `https://inclusia-theta.vercel.app/` — la misma URL que usa este sitio institucional como su propio `canonical`/Open Graph/JSON-LD/`sitemap.xml` (ver §5) — bajo la teoría de que ambos proyectos compartían dominio. Esa URL **no era la real**; la app de reportes vive en su propio dominio de Vercel, separado del sitio institucional. El botón final de `reporta-una-barrera/index.html` (`#reportar`, ver §6.2) ya apunta a la URL correcta. Si aparece la URL vieja en algún otro lugar del repo, es un residuo de esa confusión inicial, no una fuente de verdad alternativa.

---

## 6.1 Página "Reporta una barrera" — decisiones de diseño

La página no depende de animación para comunicar: es una organización de accesibilidad, y un scroll cinematográfico con parallax habría sido un autogol. La fuerza viene de la estructura, no del movimiento.

- **Motivo estructural: la ruta que se interrumpe.** Hoy lo lleva solo `.rb-rule` en el hero: una regla corta con un corte en medio, guiño a *andenes sin continuidad*, una de las propias categorías de barrera de la página. La versión larga de ese gesto (una línea vertical punteada uniendo los pasos, `.rb-step::after`) **se eliminó** en la fase "Sección explicativa" al adoptar la tarjeta del sitio (ver §6.1.2).
- **La numeración se ganó su lugar.** No es decoración: los cuatro pasos son una secuencia causal real (escuchamos → se vuelve evidencia → entra al análisis → ayuda a priorizar), así que el orden informa. Por eso el número ocupa la casilla del ícono en las tarjetas.
- **El mapa es la firma.** `.rb-atlas` es un SVG con **diez ciudades colombianas ubicadas por sus coordenadas reales** (lat/long normalizadas a un `viewBox` de 330×542). Cada una es un anillo punteado vacío: *ninguna cifra inventada*. El contrato para la Fase 8 ya existe en el markup:
  - `data-city="bogota"` y `data-count="0"` en cada `<g class="rb-city">`
  - el CSS `.rb-city[data-count]:not([data-count="0"])` ya define el estado "con reportes" (anillo sólido)
  - `data-map-field="total" | "cities" | "status"` en el panel de lectura
  - `data-map-role="counter" | "canvas" | "ticker"` con `aria-live="polite"`
- **Única superficie oscura del sitio.** Es el riesgo asumido: hace que la sección se lea como la capa de evidencia y que los anillos resalten. Requiere una regla propia en tema oscuro, porque `body.theme-dark .section` de `accessibility.css` la aplanaría a `#1a1a1a`.
- **Tipografía**: solo Poppins, heredada. La personalidad sale de escala, peso y tracking.
- `.rb-btn-strong` aplica el contraste corregido a los CTA **solo de esta página**, sin tocar `.btn-primary` global (ver la deuda conocida en §2.1).

### 6.1.1 Hero — fase "Hero de Reporta una barrera"

Construido con la misma anatomía que el hero del home (imagen a sangre completa + overlay + dos acciones), pero con dos decisiones propias.

- **Par día/noche de la misma ilustración, con cambio en vivo.** Es la misma ciudad accesible isométrica con los pines de reporte encendidos: los pines riman con los anillos vacíos del atlas de `#mapa-impacto`, así que el hero enseña en el primer segundo lo que la página promete. Es además el puente visual con la app React de reportes.
  - Claro: `assets/img/hero-reporta-barrera-dia.jpg` (483 KB), desde `Heroreportesdia.png` (3.2 MB).
  - Oscuro: `assets/img/hero-reporta-barrera-oscuro.jpg` (448 KB), desde `Heroreportesoscuro.png` (3.1 MB).
  - Los PNG originales se conservan como fuente. **Si se reemplaza alguno hay que volver a generar el JPEG** (conversión con `System.Drawing` desde PowerShell, calidad 86); un PNG de 3 MB como imagen LCP era inviable.
  - El cambio es puro CSS sobre `body.theme-dark`: inmediato al usar el menú de accesibilidad, sin JS.
- **El telón invierte el par tinta/fondo, no oscurece la imagen.** En claro el telón es casi blanco con tinta oscura (la ilustración conserva su luz); en oscuro es un telón oscuro con tinta clara. En los dos casos cubre solo la columna izquierda y se disuelve hacia el 82%, para que la ciudad y sus pines se lean a la derecha. Los cortes del degradado están calculados sobre el ancho real del texto — por eso el subtítulo está limitado a `44ch`.
  - Consecuencia asumida: en tema claro este hero **no** es una superficie oscura como el del home. La superficie oscura única del sitio sigue siendo `.rb-map` (§6.1).
- **Se descartó la foto.** `assets/img/faltadeinfraestructura.png` llegó a usarse como hero recortado antes de que existiera el par de ilustraciones; hoy vuelve a estar **sin usar**. Tiene cartelería con texto generado ilegible en los 200 px superiores y marca de agua del generador abajo a la derecha: si alguna vez se retoma, hay que recortarla.
- **El h1 replica exactamente la jerarquía del home**: Poppins 700, `clamp(2rem, 4.6vw, 2.4rem)` — tope idéntico a los 2.4rem de `#hero h1`, y por debajo de 768px manda el `1.8rem !important` de base.css, que es el tamaño móvil del home. Verificado en navegador: 38.4px en escritorio.
- **Entrada orquestada**: eyebrow (0.1s) → regla (0.2s, se dibuja de izquierda a derecha) → h1 (0.28s) → subtítulo (0.4s) → acciones (0.52s). La sección **no** se desplaza al revelarse (`--reveal-distance: 0px`): la imagen se queda quieta y llegan las palabras. Neutralizada tanto por `prefers-reduced-motion` como por `:root.reduce-motion` (el interruptor del propio sitio).
- **Botones**: `assets/JS/reporta-una-barrera.js` (módulo nuevo, cargado aparte de `main.js`) usa `scrollIntoView({behavior:'smooth'})` hacia `#mapa-impacto` y `#reportar`, con salto instantáneo si hay movimiento reducido, y mueve el foco al destino. El listener va en **fase de captura sobre el documento** para adelantarse al handler de `smooth-scroll-global.js` (registrado sobre cada `a[href^="#"]`) y evitar que las dos animaciones compitan; los `href` reales se conservan para que funcione sin JS.

**⚠️ Trampa de especificidad documentada aquí porque volverá a morder**: `base.css` define `#hero.section` (1,1,0) y `accessibility.css` define `body.theme-dark #hero.section` (1,2,0) con el atajo `background`. Cualquier regla `.rb-hero` a secas (0,1,0) **es código muerto**. Todo el hero se escribe con `#hero.rb-hero` / `body.theme-dark #hero.rb-hero`, y el tema oscuro tiene que repetir las cuatro propiedades de fondo porque el atajo las resetea. El punto de encuadre vive en `--rb-hero-focus` / `--rb-hero-focus-dark` para que el ajuste móvil sobreviva a esa repetición.

**Corregido de paso** (todo local a esta página, sin tocar estilos globales):
- En tema oscuro, `body.theme-dark .btn-primary` de `accessibility.css` pinta el CTA en lavanda claro con texto blanco (~2.5:1). `.rb-btn-strong` ahora invierte la lectura en oscuro (fondo lavanda, tinta `#10122B`, ~10:1).
- `.btn-secondary` global usa `--purple` (~3.8:1 sobre el telón claro). En el hero usa `--theme-color-strong` (8.6:1) en claro y blanco en oscuro.

### 6.1.2 Sección "Qué hacemos con lo que reportas" — fase "Sección explicativa"

Reemplaza a la antigua "El recorrido de un reporte" (`.rb-steps` / `.rb-step`), que decía los mismos cuatro pasos con un patrón propio. No se agregó una sección nueva: **se reescribió `#recorrido`**, porque un segundo bloque de cuatro pasos en la misma página habría sido un duplicado. Nada enlazaba a `#recorrido`, así que el id se conservó sin romper nada.

- **Reutiliza la tarjeta real del sitio, no una parecida.** `.change-grid` > `.change-card` > `.card-icon`, con el mismo markup (`role="list"` / `role="listitem"`) que las *Líneas de acción* de `Quienes-somos/lo-que-queremos.html` — que son, además, la versión en tarjetas de los "cuatro frentes" de `index.html`. Las reglas están **copiadas literalmente** de `quienes-lo-que-queremos.css`; el sitio no tiene componentes compartidos (§1.4), así que **si esas tarjetas cambian allá hay que replicar el cambio aquí**.
- **Conservar el nombre de clase importa.** `.change-grid` está en `STAGGER_GROUP_SELECTOR` de `scroll-animations.js`: al reutilizar el nombre, las tarjetas heredan gratis el mismo revelado escalonado del resto del sitio. Verificado (`reveal-stagger stagger-visible` aplicado solo).
- **Sin reglas propias de tinta en tema oscuro.** La tarjeta hereda las globales de `accessibility.css` (`h3` → `--purple` = `#9B8CFF`, ~6.4:1 sobre el fondo de tarjeta; `p` → `#e6e6e6`), igual que en lo-que-queremos. Lo único añadido es `.rb-card-number`, que sí necesita color propio.
- **Único añadido: `.rb-card-number`.** El número ocupa la casilla del ícono en vez de un SVG. Usa `--theme-color-strong` (8.6:1) y no `--purple` (~4:1) sobre el fondo claro de la casilla — mismo criterio de contraste que `.rb-btn-strong`.

**Honestidad del copy — contrastado contra la app real.** Se revisó `InclusiaMapp/inclusiamapp` (11 archivos JS): hoy es un **mapa de lugares y zonas accesibles con reseñas** ("Buscar lugares accesibles…", "Agregar lugar o zona", "Crear zona"), **no** un asistente de reporte de barreras, y **no contiene ningún texto legal ni de expectativas sobre qué pasa con un reporte** (cero coincidencias de `reporte|barrera|evidencia|priorizar|aliado|entidad`). Es decir: no había copy con el cual alinearse. Por eso los pasos 3 y 4 se redactaron como lo que la evidencia *permite*, no como un servicio ya en marcha, y la sección cierra con una nota explícita: *"el mapa está en cero y este recorrido empieza a existir con el primer reporte. No publicamos cifras que no tengamos."* Coherente con el principio de §6.1 (*ninguna cifra inventada*). **Si la app incorpora un flujo real de reportes con textos legales propios, este copy debe volver a contrastarse.**

### 6.1.3 Mapa de impacto — fase "Fase 8" (reemplaza el SVG placeholder de §6.1.2)

El atlas SVG estático (10 ciudades fijas en `data-count="0"`) se reemplazó por un mapa **Leaflet real**, cargado con los conteos agregados reales de la plataforma de reportes. Es la primera integración de este repo con una librería de terceros y con un backend externo.

- **Fuente de datos**: `POST {SUPABASE_URL}/rest/v1/rpc/get_public_report_counts` (proyecto `rgirpoaqzsasbmurfaem`, clave pública `sb_publishable_...`). Devuelve `[{city, department, latitude, longitude, report_count}]` — **sí trae coordenadas reales**, no solo nombres de ciudad (verificado contra el proyecto real antes de diseñar: 7 ciudades con reportes, 17 reportes en total al momento de esta fase). **CORS ya está abierto** (`Access-Control-Allow-Origin: *`) — no hizo falta tocar nada en la configuración de Supabase.
- **Librería**: Leaflet 1.9.4, descargada local a `assets/lib/leaflet/` (`leaflet.js`, `leaflet.css`, `images/`), cargada solo en `reporta-una-barrera/index.html`, sin CDN en producción. Tiles CARTO Positron (mismo estilo que la app React, para consistencia visual entre ambas propiedades).
- **Reemplazo, no adición**: al reemplazar el SVG desaparece el marco de "10 ciudades en seguimiento" — el contador `data-map-field="cities"` ahora es el conteo real de ciudades con al menos un reporte. Coherente con el principio ya declarado en la página: *"ninguna cifra inventada"*.
- **Módulo nuevo**: `assets/JS/mapa-impacto.js` (independiente, no pasa por `main.js`, mismo patrón que `reporta-una-barrera.js`/`nav-enhance.js`). Responsable de: fetch, animación de conteo ascendente (~1.5s, respeta `prefers-reduced-motion` y `:root.reduce-motion`), marcadores `L.divIcon` con `--theme-color-strong` y radio en escala raíz cuadrada del `report_count` (evita que Bogotá con 8 opaque al resto), `fitBounds` sobre las ciudades reales, aparición escalonada de marcadores (~90ms entre uno y otro, instantánea si hay movimiento reducido), y la tabla accesible.
- **Carga diferida**: un `IntersectionObserver` sobre `#mapa-impacto` dispara el fetch + `L.map()` solo cuando la sección entra en viewport (`rootMargin: 200px`) — evita pagar el costo de Leaflet/tiles en quien nunca hace scroll hasta ahí. El contenedor tiene dimensiones reales incluso mientras `.section.hidden` (opacity:0, no `display:none`), así que no hay problema de inicializar Leaflet con contenedor de tamaño cero.
- **Accesibilidad**: `#rb-leaflet-map` tiene `role="region"` + `aria-label` descriptivo. Debajo, un `<details><summary>Ver datos en formato de tabla</summary>` con una `<table>` real (ciudad, departamento, reportes) generada con los mismos datos del fetch — nunca vacía sin explicación. El zoom por rueda del mouse está desactivado (`scrollWheelZoom: false`) para no secuestrar el scroll de la página; zoom por teclado/botones/touch sigue disponible (Leaflet trae `keyboard: true` por defecto).
- **Estado de error**: si el fetch falla, `data-map-status="error"` oculta el contenedor del mapa (no deja un rectángulo roto) y muestra un mensaje discreto en el hint y en el ticker (`#mapa-ticker`), más una fila de error en la tabla — nunca un contenedor en blanco sin explicación.
- **CSS**: las reglas del SVG (`.rb-atlas-svg`, `.rb-grid`, `.rb-spine`, `.rb-city`) se borraron de `reporta-una-barrera.css` y se reemplazaron por `.rb-leaflet-map` (con skeleton de carga animado), `.rb-marker` (el divIcon), `.rb-map-table-toggle`/`.rb-map-table`. El bloque `body.theme-high-contrast` se actualizó para apuntar a `.rb-marker` en vez de `.rb-city circle`/`text`.
- **Verificado contra el proyecto real de Supabase** (no mockeado): conteos, coordenadas, tabla accesible y manejo de error probados en navegador (Playwright) sirviendo el sitio con `npx serve`, incluyendo viewport móvil (390px) y una simulación de fallo de red.

**Rediseño "panel de evidencia en vivo"** (mismo día, a pedido explícito: el mapa se veía genérico y debía ser de solo lectura):
- **Interacción bloqueada a propósito**: `dragging`, `touchZoom`, `scrollWheelZoom`, `doubleClickZoom`, `boxZoom`, `keyboard` y `zoomControl` van en `false` al crear `L.map()`, y cada marcador se crea con `interactive: false` (sin popup, sin cursor de mano). Es una visualización de solo lectura — la interacción real vive en la tabla de abajo (`<details>`) y en el resto del sitio.
- **Tiles CARTO Dark Matter** (`dark_all`) en vez de Positron — se desvía a propósito de la nota original de "mismo estilo que la app React" (§ nota histórica más abajo) porque el basemap claro se veía como un rectángulo genérico flotando en la única sección oscura del sitio. El oscuro integra el mapa al panel en vez de contrastar con él.
- **`.rb-map-frame`**: bisel nuevo alrededor de `#rb-leaflet-map` (no existía antes) con marcas de esquina tipo mira/escáner (técnica CSS de 8 gradientes lineales sobre un único `::before`, sin SVG ni imágenes) — refuerza la lectura de "panel de instrumento" que ya tenía la sección.
- **Marcador rediseñado**: `.rb-marker` ahora es un contenedor con dos hijos — `.rb-marker-count` (el número) y `.rb-marker-ring` (anillo que pulsa tipo radar, `@keyframes rb-marker-ping`). Antes era un círculo plano sin animación propia.
- **Punto de estado**: el mismo nodo `[data-map-field="status"]` que ya existía gana un `::before` con punto de color, controlado por `data-state` (`pending` / `live` con pulso / `empty` / `error`) — sin agregar markup nuevo.
- **Atribución de Leaflet retintada**: `.leaflet-control-attribution` trae por defecto una caja clara que desentonaba con los tiles oscuros; se sobreescribió con fondo oscuro translúcido.
- **Tabla → ranking**: se agregó una cuarta columna `#` (rango 01, 02…) porque ahora la tabla se ordena de mayor a menor y el orden sí es información real (no es numeración decorativa). Cada celda de reportes lleva una barra proporcional (`--bar-scale` vía JS inline). El `<details><summary>` perdió el triángulo nativo del navegador y usa un chevron propio en CSS.
- Todas las animaciones nuevas (pulso del anillo, pulso del punto de estado) quedan neutralizadas automáticamente por la regla global de `reduce-motion.css` (`:root.reduce-motion * { animation-duration: 0.01ms !important; }`) — no hizo falta código de reduced-motion adicional para ellas.

**Segundo pase — "todo el conjunto", no solo el mapa** (mismo día, a pedido explícito: la sección se sentía genérica y la tabla se rompía en responsive al desplegarse):
- **Bug real corregido, no parcheado**: la tabla anterior tenía 4 columnas fijas (#, ciudad, departamento, reportes) y en móvil la columna de reportes —con su barra— quedaba sin espacio y se cortaba. La solución no fue un `overflow-x: auto` de parche: se rediseñó a **2 columnas** — la ciudad+departamento pasaron a vivir como `<th scope="row">` (con el departamento como `<span>` en su propia línea dentro de la misma celda), dejando una sola celda de datos (`<td>`) donde la barra usa `flex: 1 1 auto` y por lo tanto siempre tiene todo el ancho disponible, en cualquier viewport. No puede volver a cortarse porque no compite con columnas fijas.
- **El indicador "en vivo" se subió al nivel de la sección**: junto al eyebrow "Mapa de impacto" ahora hay una píldora `.rb-live-indicator` con el mismo punto pulsante que ya existía en el renglón "Estado" del `.rb-readout` (reutiliza el mismo `data-state` vía el helper `setLiveState()` en `mapa-impacto.js`, que ahora actualiza los dos nodos a la vez). Es puramente decorativa (`aria-hidden="true"`) — el texto accesible sigue siendo el de `.rb-readout`.
- **Marco de instrumento a nivel de sección**: `.rb-map::before` repite la misma técnica de 8 gradientes lineales que ya tenía `.rb-map-frame` (el bisel del mapa), pero a escala de toda la tarjeta (`inset: 18px`, brazos de 26px, más tenue). La idea es que la sección entera se lea como un solo panel, no como "un mapa con marco bonito flotando en una caja genérica" — el mapa ya no es el único elemento con personalidad propia.
- **El ticker (`#mapa-ticker`) ganó un prefijo `›`** (pseudo-elemento, decorativo) para leerse como una línea de log de sistema en vez de una cita con barra lateral.
- La numeración de la tabla (01, 02…) se justifica porque la tabla **sí está ordenada** de mayor a menor por `report_count` — no es decoración, es la razón por la que el rango existe.

**Tercer pase — rediseño estructural de todo `.rb-atlas`** (mismo día; dos problemas reales, no solo estéticos):
1. En desktop, al desplegar la tabla, la columna del mapa crecía mucho más que la columna de texto y dejaba un vacío grande al fondo de la sección.
2. Se probó una versión intermedia con las cifras (`.rb-readout`) flotando como panel de cristal ENCIMA del mapa (esquina inferior izquierda) — se veía bien, pero **tapaba marcadores reales** (Bogotá/Cali quedaban parcial u ocultos detrás del panel). Como las coordenadas son datos reales y dinámicos, ninguna esquina del mapa puede darse por vacía de forma confiable — cualquier overlay fijo sobre el mapa es frágil por diseño.

Solución final, `.rb-atlas` como un solo flujo vertical (`display:flex; flex-direction:column`), sin grid de 2 columnas y sin overlay sobre el mapa:
1. `.rb-readout` — franja de 3 celdas (`display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr))`) con divisores de 1px vía el truco `gap:1px` + `background` del contenedor. Vive **arriba** del mapa, nunca sobre él — imposible que tape un marcador porque no comparte espacio con el mapa en ningún momento.
2. `.rb-map-stage` — ahora es solo un wrapper `max-width:640px; margin:0 auto` para `.rb-map-frame`; ya no tiene `position:relative` ni lógica de overlay (se eliminó junto con el `@media` que ponía `.rb-readout` en `position:absolute` y su override para el estado de error, que ya no hace falta).
3. Ticker, pista y tabla comparten el mismo `max-width:640px; margin:auto` que el mapa, para que toda la sección se lea como una sola columna centrada y alineada, en vez de piezas de anchos distintos.
4. El mapa creció a `height:460px` desde 760px de viewport (antes 380px fijo) — con la franja de cifras ya no compitiendo por ancho a su lado, el mapa puede ser más grande y ser el verdadero elemento hero de la sección.

### 6.2 CTA final ("El mapa empieza con un reporte") — fase "CTA final"

Completa el `<section id="reportar" class="rb-cta">` que existía como placeholder desde la fase "Reporta una barrera" (tenía un TODO y una URL provisional). Es el último momento de la página antes de que la persona actúe.

- **Decisión "misma pestaña vs. nueva pestaña"**: el usuario mencionó una decisión previa de "Fase 2" al respecto, pero **no existe documentada en este repo** (ni en `SITIO_CONTEXT.md` ni en el historial de git) — probablemente se tomó en una conversación sobre el monorepo `inclusia-platform`, no persistida aquí. Se le preguntó de nuevo y confirmó **misma pestaña**: el link es un `<a href="https://reportes-inclusia-public.vercel.app/">` estándar, sin `target`. El único patrón de "nueva pestaña + texto accesible oculto" que existe realmente en el sitio es el del link a la Política de Tratamiento de Datos en el formulario de contacto (`index.html:432-436`) — no se usó aquí porque no aplica a esta decisión.
- **Encabezado reescrito** para igualar el nivel de convicción del CTA de donaciones (`"Ayúdanos a convertir barreras invisibles en cambios visibles."`, `index.html:296`): `"Ayúdanos a convertir lo que te detuvo en evidencia que exige un cambio."` — mismo verbo de apertura ("Ayúdanos a convertir X en Y") a propósito, para que se sienta como la misma voz de marca en los dos cierres del sitio. "Evidencia" no es una palabra suelta: es el mismo término que ya usan `.rb-map` (§6.1, "capa de evidencia") y la sección explicativa (§6.1.2) — el CTA final cierra el mismo hilo narrativo, no abre uno nuevo.
- **El párrafo de apoyo perdió su claim de tiempo** ("Toma menos de dos minutos…") para no contradecir el nuevo texto pequeño bajo el botón, que trae la cifra real: *"Puedes enviar tu reporte en menos de 3 minutos, sin necesidad de crear una cuenta."* Antes había dos cifras de tiempo distintas conviviendo en la misma sección (2 min / 3 min) — se dejó una sola fuente de verdad.
- **El botón es, a propósito, el de mayor peso visual del sitio** — más grande que `#hero.rb-hero .btn-primary` (que ya era el más grande hasta ahora): `padding: 1.2rem 2.5rem`, `font-size: 1.08rem`, con el mismo lenguaje de hover que el hero (elevación + brillo + sombra doble), pero más contundente, en `.rb-cta .btn-primary`. La flecha (`.rb-cta-btn-arrow`, `aria-hidden="true"`) se desliza 5px en hover — el único detalle de movimiento propio de este CTA, deliberadamente pequeño.
- **Sección centrada**, no alineada a la izquierda como el resto de la página (`.rb-cta { text-align: center; padding-block: 5rem; }`). Es la única sección con esta composición: el "punto final" visual de la página, distinto del ritmo editorial de las secciones anteriores.
- **Bug de contraste heredado, corregido de paso**: `.rb-cta-note` fuerza su color con `!important` (para ganarle a la regla genérica `.rb-cta p`), pero no tenía override para `body.theme-dark` — en tema oscuro quedaba texto oscuro (`rgba(31,41,51,.6)`) sobre fondo oscuro (`#1a1a1a` de `body.theme-dark .section`), prácticamente ilegible. Ya existía antes de esta fase (mismo patrón, mismo texto pequeño con otro contenido); se corrigió aquí porque se estaba tocando esa misma regla. No se auditó el resto del sitio buscando el mismo patrón — si aparece en otra página, es el mismo bug.

### 6.3 Animaciones + hero directo + paleta del mapa — fase "Animaciones"

Repasa los 4 puntos de animación pedidos, contra lo que ya existía, más 3 correcciones puntuales.

**1. Scroll reveal** — ya existía sitewide (`assets/JS/scroll-animations.js` + `.section.hidden`/`.show` de `animations.css`, IntersectionObserver + clase toggleada + transición CSS), aplicado a las 4 secciones de esta página desde que se construyeron (hero visible al cargar, el resto revela al hacer scroll). **Verificado en navegador esta fase**, no se duplicó — un segundo sistema paralelo sobre las mismas secciones habría sido redundante y arriesgado (dos observers tocando las mismas clases). No hizo falta ningún cambio.

**2. Hover de botones (~200ms, sin rebote)** — se añadió `--transition-fast: 0.2s ease` en `variables.css` (aditivo, junto a los demás tokens) y se aplicó a los hovers de `#hero.rb-hero .btn-primary/.btn-secondary` y `.rb-cta .btn-primary`/`.rb-cta-btn-arrow` en `reporta-una-barrera.css`, reemplazando el `0.22s ease` que ya tenían por el token. El "pop" con rebote de los marcadores del mapa (`cubic-bezier(0.34, 1.56, 0.64, 1)`) **no se tocó** — es una animación de entrada, no un hover, y el rebote ahí es intencional.

**3. Conteo ascendente respeta reduced motion** — confirmado en navegador: con `.reduce-motion` activo antes de que el fetch resuelva, el número pinta el valor final directo, sin animar. Aprovechado para extraer la lógica a `assets/JS/animate-count.js` (ver más abajo).

**4. Nuevos archivos de animación** — en vez de crear archivos de relleno para una funcionalidad que ya existía (punto 1), se extrajo la animación real que SÍ vivía mezclada con lógica de datos dentro de `mapa-impacto.js`:
- **`assets/JS/animate-count.js`**: `animateCount(el, target, { duration })`, usa `isMotionReduced()` de `reduce-motion.js` como única fuente de verdad (antes `mapa-impacto.js` reimplementaba su propio chequeo de `prefers-reduced-motion`).
- **`assets/JS/stagger-reveal.js`**: `staggerReveal(elements, { className, delayStep })`, generaliza el revelado escalonado que antes solo servía para los marcadores del mapa — reutilizable para cualquier grupo futuro.
- `mapa-impacto.js` ahora importa ambos y quedó más corto: se ocupa de datos y del mapa, no de cómo se anima cada cosa.

**Corrección — botón del CTA final sobredimensionado en móvil**: `.rb-cta .btn-primary` (el más grande del sitio a propósito) se reduce en `@media (max-width: 600px)` a `padding: 0.95rem 1.5rem; font-size: 0.95rem;` y pasa a ocupar el ancho completo — antes el texto envolvía a 2 líneas y se sentía desproporcionado frente al resto de la página en pantallas chicas.

**Corrección — el hero manda directo al formulario real**: el botón secundario del hero (`Ir a reportar`) ya no hace `scrollIntoView` hacia `#reportar` (que a su vez tenía OTRO botón hacia la app externa) — ahora es un `<a href="https://reportes-inclusia-public.vercel.app/">` directo, sin `data-rb-scroll`, para que la persona no tenga que hacer scroll y clickear dos veces para llegar a reportar. El botón primario (`Ver el mapa de impacto`) se deja igual — sigue llevando a `#mapa-impacto` para quien quiere ver el impacto antes de decidirse. `#reportar` (la sección de cierre, §6.2) sigue existiendo igual para quien llega ahí leyendo la página completa.

**Corrección — paleta del mapa "genérica"**: el feedback inicial fue "los colores del mapa se ven genéricos". Se probó teñir los tiles de CARTO Dark Matter (gris neutro) de índigo/violeta con un pane propio de Leaflet (`map.createPane('rbTint')`, `mix-blend-mode: color`) — funcionaba visualmente, pero un mensaje de seguimiento **aclaró que el feedback real no era sobre el mapa en sí** ("no te pido que cambies los colores del mapa, estaba bastante bien") **sino sobre el resto de la sección alrededor del mapa**. El tinte de los tiles se **revirtió por completo** (se quitó `map.createPane`/`.rb-map-tint-pane` de `mapa-impacto.js` y su CSS/overrides de alto contraste) — el mapa volvió a los tiles grises originales de CARTO. Lo que sí se quedó rediseñado es todo el "alrededor":
- **Fondo de `.rb-map`**: pasó de navy + 2 manchas radiales suaves (azul/púrpura sobre `#141738→#0E1029`, el look "dashboard oscuro genérico" por defecto) a un degradado violeta-ciruela más rico (`#1B0E36 → #120A28 → #0A0616`, manchas radiales magenta/violeta), más un grano sutil (`::after`, SVG de ruido inline vía `feTurbulence`, `mix-blend-mode: overlay` al 5%) — la diferencia entre una superficie plana de plantilla y una con textura real. Mismo tratamiento replicado en el override `body.theme-dark .rb-map`.
- **Tokens nuevos en `.rb-map`**: `--rb-hairline`, `--rb-glass-bg`, `--rb-glass-border` pasaron de la receta genérica "blanco translúcido sobre navy" a la misma familia violeta que ya usa `--rb-lead-accent` — se aplican en la franja de cifras (`.rb-readout-item`), la insignia "en vivo" (`.rb-live-indicator`), el ticker (`.rb-atlas-caption`), el marco del mapa (`.rb-map-frame`) y la pista de las barras de la tabla (`.rb-map-table-bar`). Antes cada uno improvisaba su propio `rgba(255,255,255,X)`; ahora comparten una sola fuente.
- **La ciudad líder (más reportes) se sigue distinguiendo por color, no solo por tamaño** — esto no se revirtió, es un acento de marcador (`--rb-lead-accent: #9B2FB0`, clase `.rb-marker--lead`), no un tinte sobre el mapa entero; se mantiene coordinado con el nuevo acento de la fila #1 de la tabla.
- ⚠️ **Nota técnica real, por si el tinte de tiles se retoma en el futuro**: un `<div>` normal (`position:absolute`) por fuera del contenedor de Leaflet, con `z-index` de CSS normal, **no funciona** para pintarse entre los tiles y los marcadores — ni con `z-index: 350` ni con valores altos por debajo de 1000; con `z-index: 99999` sí pinta pero tapa también los marcadores. La causa: los panes internos de Leaflet (tile-pane z:200, marker-pane z:600) viven dentro de `.leaflet-map-pane`, que Leaflet posiciona con `transform` — arma su propio contexto de apilamiento que el `z-index` de CSS normal desde *fuera* del contenedor no logra atravesar. La solución real es `map.createPane()`, que sí vive dentro de ese contexto.
- **Bug real de resize encontrado mientras se probaba el tinte, corregido y conservado**: Leaflet **no** reacciona solo a cambios de tamaño del contenedor (p. ej. cargar en móvil y luego ensanchar la ventana sin recargar) — el mapa se quedaba con las dimensiones de la primera medición y dejaba franjas del contenedor sin tiles ni marcadores. `mapa-impacto.js` ahora llama `map.invalidateSize()` en el evento `resize` de `window`.
- **Bug real de alto contraste encontrado y corregido de paso** (no introducido hoy, pero descubierto mientras se verificaba el tema de alto contraste): `accessibility.css` fuerza sitewide `body.theme-high-contrast { h1..h6, p, li, span { color:#000; background:#fff } }` — un bloque opaco por elemento de texto. Varias reglas de `reporta-una-barrera.css` (de fases anteriores) sobreescribían `color:#fff` para elementos que son `<p>`/`<span>` (`.rb-map-intro`, `.rb-readout-label`, `.rb-atlas-hint`, `.rb-map-table-rank`, `.rb-map-table-value`) sin tocar el `background`, heredando el fondo blanco de la regla genérica → **texto blanco sobre fondo blanco, invisible** en alto contraste. Corregido dejando que esos tags usen el negro-sobre-blanco genérico (ya funciona, ya es legible) y solo sobreescribiendo color en los tags que la regla genérica NO cubre (`figcaption`, `details`, `th`/`td`). Este fix **sigue vigente** — es independiente del tinte revertido.

### 6.4 Auditoría responsive de "Reporta una barrera" — fase "Responsive + rediseño del nav móvil"

Probado en navegador (Playwright) en 375px, 768px y 1440px. El grueso real de esta fase fue el nav (§4.3); el contenido propio de la página ya estaba sólido de fases anteriores — se verificó explícitamente en vez de asumirlo:

- **Hero**: texto e imagen se reacomodan sin cortes en los tres anchos; botones apilados a ancho completo en móvil/tablet. Nada que corregir.
- **"Qué hacemos con lo que reportas"**: las 4 `.change-card` se apilan en una columna en móvil, sin texto cortado ni espaciados raros. Nada que corregir.
- **Mapa de impacto — decisión explícita de NO colapsarlo**: en 375px el mapa (`.rb-leaflet-map`, 380px de alto en ese ancho) se ve legible — los 7 marcadores (incluida la ciudad líder) se distinguen bien, sin amontonarse, y la franja de cifras arriba no compite por espacio con él (ver §6.1.3, tercer pase — ese rediseño de layout ya había resuelto el problema de fondo). Se evaluó la opción del enunciado (colapsar detrás de un botón "Ver mapa") y **se descartó a propósito**: el mapa ya se ve bien a 375px, así que esconderlo agregaría un toque extra sin resolver ningún problema real — sería una animación/interacción de más, no una mejora. Verificado también sin overflow horizontal (`document.body.scrollWidth` = ancho del viewport en los tres tamaños).
- **CTA final**: el botón (`.rb-cta .btn-primary`) mide 320×55px en 375px — bien por encima del mínimo táctil de 44×44px (ya se había ajustado su tamaño en la fase "Animaciones", ver §6.3). Nada que corregir.

---

## 6.5 Rendimiento — fase "Optimización de performance"

Auditoría dirigida a `reporta-una-barrera/index.html` ("la página nueva"), con Lighthouse corrido localmente (`npx lighthouse`, mobile, Chrome headless) contra `npx serve`.

**Imágenes**: las dos imágenes hero (`hero-reporta-barrera-dia.jpg` / `-oscuro.jpg`, ver §6.1.1) ganaron versión `.webp` (calidad 80, mismas dimensiones 1536×1024 — ya eran apropiadas, no hacía falta reescalar): `hero-reporta-barrera-dia.webp` (356 KB, -28% vs. el JPEG) y `hero-reporta-barrera-oscuro.webp` (323 KB, -30%). Como son `background-image` (no `<img>`), el fallback usa doble declaración CSS en `reporta-una-barrera.css`:
```css
background-image: url('...dia.jpg');                 /* fallback real */
background-image: image-set(                          /* navegadores modernos lo sobreescriben */
  url('...dia.webp') type('image/webp'),
  url('...dia.jpg') type('image/jpeg')
);
```
Los navegadores sin `image-set()` ignoran la segunda regla entera y se quedan con el JPEG — no hace falta feature-detection en JS. El `<link rel="preload">` del hero (`reporta-una-barrera/index.html`) se actualizó para apuntar al `.webp` con `type="image/webp"`: los navegadores que no puedan decodificar WebP **descartan el preload solos** (por spec), sin gastar ancho de banda en un archivo que no van a usar.

**Leaflet**: ya estaba scopeado correctamente (§6.1.3) — confirmado que `leaflet.js`/`leaflet.css` solo se cargan en `reporta-una-barrera/index.html`, ninguna otra página los referencia. `leaflet.js` (el único `<script src>` clásico del sitio junto al de SweetAlert2) ganó `defer` — antes bloqueaba el parseo en el punto donde aparece (poco impacto real porque ya estaba al final del `<body>`, pero es la práctica correcta y no rompe el orden de ejecución: los scripts `defer` y los módulos sin `async` se ejecutan en el mismo orden relativo de aparición en el documento, así que `mapa-impacto.js` sigue corriendo después y `L` sigue existiendo cuando lo necesita).

**`defer` en scripts que no bloquean el render inicial**: el único otro `<script src>` clásico del sitio, el CDN de SweetAlert2 en `index.html` (vivía en el `<head>`, bloqueaba el parseo del documento completo), ahora carga con `defer`. `form.js` (módulo, importado vía `main.js`) usa `Swal.fire(...)` solo dentro de manejadores de eventos disparados por el usuario (envío del formulario), nunca en su nivel superior — no hay riesgo de que `Swal` no exista todavía cuando se necesita.

**`loading="lazy"` debajo del fold**: los íconos sociales del footer (Facebook/Instagram/X/TikTok, 18×18, en las 8 páginas) no lo tenían — se agregó `loading="lazy" decoding="async"`. El resto de imágenes de contenido (fotos de fundadores/colaboradores, barreras de accesibilidad, slides del carrusel) ya lo tenía desde fases anteriores.

**Hallazgo real durante la auditoría — el ícono del botón flotante de accesibilidad NO está debajo del fold**: se le agregó `loading="lazy"` por el mismo criterio que los íconos del footer, pero Lighthouse lo señaló como el **elemento LCP** de la página después del cambio — es `position:fixed`, visible desde el primer instante en cualquier viewport, así que lazy-loadearlo retrasaba justo el elemento que Lighthouse mide. Se revirtió (`loading="lazy"` quitado en las 8 páginas). Lección: `loading="lazy"` nativo decide por posición de layout en el momento de carga, no por posición en el DOM — un elemento `position:fixed` casi nunca es candidato real a lazy-load aunque su `<img>` esté al final del HTML.

**Hallazgo real no relacionado con "nueva", pero descubierto por la misma auditoría**: `logo-accesibilidad-web-azul.png` (el ícono de ese mismo botón) era un PNG de **1024×1024 pesando 1.48 MB**, mostrado a 54×54 en las 8 páginas. Con ese peso, era la causa real del retraso de LCP detectado arriba (`resourceLoadDelay` de ~1.2s solo para ese archivo). Se redujo a 120×120 (cubre hasta ~2.2x de densidad de píxeles sobre 54px) y se recomprimió: **1.48 MB → ~6 KB**. Mismo nombre de archivo, no hizo falta tocar el HTML de nuevo. No estaba en el alcance original ("imágenes nuevas"), pero se corrigió porque el propio audit de Lighthouse lo señaló como bloqueante real.

**Resultado, aun con este fix, el ícono del botón flotante sigue siendo el elemento LCP reportado** (confirmado corriendo Lighthouse una segunda vez) — la causa raíz real es otra, y queda documentada mejor que oculta: `#hero.rb-hero` carga con `class="... hidden"` y se revela con una animación de entrada orquestada (§6.1.1, opacity 0→1 en varios pasos, "Entrada orquestada: eyebrow (0.1s) → regla (0.2s)... h1 (0.28s)..."). Como el fondo del hero técnicamente no termina de "pintarse" (opacity final) hasta que esa animación corre, el algoritmo de LCP del navegador atribuye el "mayor contenido pintado" al ícono del botón flotante (que sí es visible de inmediato), no al hero. **No se tocó** — es una decisión de diseño deliberada y ya afinada en una fase anterior (con su propio manejo de `prefers-reduced-motion`/`:root.reduce-motion`), fuera del alcance de esta fase de imágenes/scripts/lazy-load. Si se quiere bajar el LCP reportado de verdad, la palanca real es esa animación de entrada, no más optimización de assets.

**Resultados de Lighthouse (mobile, throttling simulado de Lighthouse — no representa banda ancha real)**, antes/después de los fixes de esta fase:

| Categoría | Antes | Después |
|---|---|---|
| Performance | 71 | 73 |
| Accessibility | 88 | 88 (sin cambios, ver abajo) |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 6.2 s | 5.4 s |
| TBT | 10 ms | 10 ms |
| CLS | 0 | 0 |

Los números absolutos de Performance/LCP están inflados por el throttling agresivo por defecto de Lighthouse (4x CPU, red simulada) contra un `npx serve` local sin CDN/compresión — en producción (Vercel, con su propia compresión/edge) el número real será mejor. Los puntajes relativos (Best Practices/SEO en 100, CLS en 0, TBT casi nulo) son los que reflejan mejor la salud real de la página.

**Accessibility en 88 — 3 hallazgos, ninguno introducido en esta fase, no corregidos aquí (fuera del alcance de una auditoría de performance)**:
1. `color-contrast` / `target-size` en `.skip-link`: el enlace vive en `top:-40px` (oculto hasta `:focus`, patrón documentado en §3.1) — Lighthouse lo evalúa en su posición de reposo igual. Puede ser un falso positivo del audit (el elemento nunca es visible sin foco) o un contraste real insuficiente de `var(--purple)` con texto blanco; no se verificó cuál de las dos a fondo.
2. `aria-required-children` en `.social-links-footer` (footer, las 8 páginas): un `role` que exige hijos con `role` específico no los tiene completos.

Documentado para una fase dedicada a accesibilidad si se quiere subir el puntaje — no se tocó CSS/markup global compartido por las 8 páginas sin ese objetivo explícito.

---

## 6.6 Sección "Nueva iniciativa" en el home — fase "Nueva iniciativa en el home"

`index.html` gana una sección nueva (`#iniciativa`) entre `#proposito` y `#donaciones` — decisión explícita del usuario tras probar la ubicación original (justo después del hero, antes de `#quienes-somos`), que se sentía "escondida" ahí. Es una versión liviana de la prueba social en vivo de `reporta-una-barrera/#mapa-impacto` (§6.1.3): mismo endpoint de Supabase (`get_public_report_counts`), misma animación de conteo (`animate-count.js`, reutilizado tal cual), pero **sin cargar Leaflet** — solo hacen falta los totales agregados (reportes recibidos, ciudades representadas), no las coordenadas.

- **Archivos nuevos**: `assets/css/iniciativa-destacada.css`, `assets/JS/iniciativa-impacto.js` (módulo independiente, cargado aparte de `main.js`, mismo patrón que `mapa-impacto.js`/`reporta-una-barrera.js`).
- **Única superficie oscura del home** (mismo riesgo asumido que `.rb-map`, ver §6.1): fondo sólido y plano en `--theme-color-strong` (`#4338CA`, ya usado sitewide para contraste WCAG — blanco da 7.9:1), full-bleed (rompe el contenedor centrado de 1000px que usa el resto de `.section`) — sin gradientes ni texturas, a propósito, para que el diferenciador venga de la composición (layout asimétrico ~55/45 en desktop, columna de texto + tarjeta de cifras) y no de un efecto de superficie.
- **Trampa de especificidad real, encontrada y corregida en esta fase**: el fondo de la sección se escribe con `#main-content #iniciativa.section` (2 ids) para ganarle a `#main-content .section:not(#hero)` de `home-storytelling.css` (que también suma 2 ids vía `:not(#hero)`). Pero en **tema oscuro** existe además `body.theme-dark #main-content .section:not(#hero)`, que suma la clase `.theme-dark` y **empata** en especificidad con la regla base (2 ids, 2 clases) — sin una regla `body.theme-dark #main-content #iniciativa.section` explícita, el fondo caía al gris oscuro genérico del sitio en vez de mantener el índigo de marca. Verificado en navegador (Playwright) antes y después del fix.
- **Alto contraste**: mismo criterio que `.rb-map` — se fuerza `background:#000` + borde blanco en vez de mantener el índigo, y cada elemento de texto sobre el fondo oscuro (badge, h2, párrafo, checklist) tiene su contraparte explícita `color:#000;background:#fff` en vez de confiar en que la regla genérica de `accessibility.css` gane sola (el prefijo `#iniciativa` de las reglas base ya le gana en especificidad a esa regla genérica, así que sin el override explícito el texto quedaría blanco-sobre-blanco). Verificado en navegador.
- **Copy**: contrastado contra los mismos hechos ya establecidos en `reporta-una-barrera/` (§6.1.2/§6.2) — "sin necesidad de crear una cuenta", "menos de 3 minutos", "no garantiza una solución inmediata pero construye evidencia". El CTA usa la ruta real `reporta-una-barrera/` (patrón carpeta + `index.html`, ver §1.1), no `reporta-una-barrera.html` como se nombró inicialmente en la solicitud.
- **Verificado en navegador (Playwright, sirviendo con `npx serve`)**: datos reales de Supabase cargando en vivo (17 reportes / 7 ciudades al momento de esta fase), `window.L` (Leaflet) ausente en el home, sin scroll horizontal en 375/768/1440px, conteo respeta `prefers-reduced-motion` (pinta el valor final sin animar), temas oscuro y alto contraste correctos tras el fix de especificidad.

## 6.7 Auditoría SEO e indexación — fase "Indexación en Google"

Partía de un brief con hipótesis de causa ("0 páginas indexadas → posible Vercel Authentication activa, robots.txt bloqueando, sitemap faltante"). Antes de tocar nada se verificó cada hipótesis contra el sitio real en producción (`curl` directo + Playwright contra `https://inclusia-theta.vercel.app/`), **no contra lo que el brief asumía**:

- **Vercel Authentication (Parte 0): descartada.** `curl` a la home de producción responde `HTTP 200` con el HTML real (título, contenido) sin redirección ni pantalla de login, y sin headers de `WWW-Authenticate`/`_vercel`. Si la protección estuviera activa, cualquier request sin sesión recibiría un 401 o una redirección a `vercel.com/login` — no ocurre. **No era la causa.**
- **`robots.txt` (Parte 1): ya existía y ya era correcto.** `https://.../robots.txt` responde 200 con `Allow: /` y referencia al sitemap real. No hay `Disallow: /` general.
- **Meta `noindex` (Parte 1.3): ninguna página lo tiene.** De hecho `index.html` trae explícito `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`.
- **`X-Robots-Tag` global (Parte 1.4): no existe.** `vercel.json` solo aplica ese header a `/components/*`, `/forms/*`, `/pages/*` y algunos `.md`/`.txt` legacy (intencional, ver §5) — nunca a las 8 páginas reales.
- **`sitemap.xml` (Parte 2): ya existía, completo y correcto.** Las 8 páginas de producción (§1.1) están listadas con `<loc>` reales sobre `inclusia-theta.vercel.app`.
- **Meta tags por página (Parte 3): ya completos en las 8 páginas.** `<title>` y `<meta name="description">` únicos por página, `<link rel="canonical">`, Open Graph completo (`og:title/description/type/url/locale/image`), `<html lang="es-CO">` — verificado con grep sobre las 8 páginas, incluida `reporta-una-barrera/index.html`.
- **Datos estructurados (Parte 4): ya existían, con un hueco real, ahora cerrado.** `index.html` ya trae un `@graph` JSON-LD (`WebSite` + `Organization` + `WebPage`) con nombre, URL, logo, dirección, área de servicio y punto de contacto — más completo que el `NGO` simple que pedía el brief. Lo que sí faltaba de verdad era el array `sameAs`: los links del footer eran placeholders genéricos (`https://facebook.com`, `https://instagram.com`, `https://x.com`, `https://tiktok.com`), no perfiles reales, y no estaban documentados en el repo. Se le preguntó al usuario: INCLUSIA solo tiene cuenta real en Instagram (`https://www.instagram.com/inclusiacorporacion/`) — se corrigió ese `href` en las 8 páginas + `components/footer.html` y se agregó `"sameAs": ["https://www.instagram.com/inclusiacorporacion/"]` al bloque `Organization`. Facebook/X/TikTok se dejaron intencionalmente como placeholders (decisión explícita del usuario) — ver nota en §7.
- **Rendimiento (Parte 5): un hallazgo real.** A diferencia de `reporta-una-barrera/` (optimizada en la fase de rendimiento, §6.5), `index.html` seguía precargando `assets/img/Hero-inclusia.png` sin comprimir — **2.3 MB**, servido como LCP con `fetchpriority="high"`. Se generó `Hero-inclusia.jpg` (calidad 86, 273 KB, -88%) y `Hero-inclusia.webp` (calidad 80, 156 KB, -93%), mismas dimensiones (1647×955, sin reescalar). `assets/css/home-hero.css` ahora usa el mismo patrón `image-set()` con fallback JPEG que ya usaba `reporta-una-barrera.css` (ambas reglas: `#hero.section` y `body.theme-dark #hero.section`, que comparten la misma imagen). El `<link rel="preload">` de `index.html` apunta al `.webp` con `type="image/webp"`. Verificado en navegador (Playwright, `npx serve` local): la petición de red real usa el `.webp`, el hero se ve igual, sin regresión visual. El PNG original se conserva en disco (no se borró) porque sigue siendo la fuente para `og:image`/`twitter:image`/JSON-LD, que no se tocaron — cambiar el formato de esas referencias es una decisión aparte, no estaba en el alcance de esta fase.

**Conclusión de causa real**: no se encontró ninguna de las causas técnicas típicas (bloqueo de crawler, sitemap faltante, meta tags rotos, protección de despliegue). Si el sitio efectivamente tiene 0 páginas indexadas, la causa más probable es simplemente **antigüedad/latencia de indexación** (dominio de Vercel sin Search Console verificado/sitemap enviado manualmente aún, o el sitio es reciente) — no un defecto técnico del repo. Recomendación no aplicada aquí (fuera del alcance de cambios en código): dar de alta la propiedad en Google Search Console y enviar `sitemap.xml` manualmente para acelerar el primer rastreo.

**Archivos tocados esta fase**: `assets/img/Hero-inclusia.jpg` (nuevo), `assets/img/Hero-inclusia.webp` (nuevo), `assets/css/home-hero.css` (preload/`image-set`), `index.html` (`<link rel="preload">` + `sameAs` en el JSON-LD + `href` de Instagram), y el `href` de Instagram en las 6 páginas de `Quienes-somos/`, `reporta-una-barrera/index.html` y `components/footer.html` (legacy). Ningún archivo de `robots.txt`/`sitemap.xml`/meta tags fue creado ni modificado porque ya estaban correctos.

## 6.8 Rediseño de "Mapa de impacto" a fondo claro + cambio de proveedor de tiles — fase "Reorganizar el mapa"

Dos cambios distintos en la misma fase: uno de dirección visual (pedido explícito del usuario) y uno técnico real descubierto verificando ese cambio en navegador — no asumido de un brief.

**Cambio visual — de "panel oscuro inmersivo" a tarjeta clara del sitio.** El usuario pidió explícitamente dejar de tener la sección `#mapa-impacto` dentro del fondo morado/violeta que traía desde la fase "Fase 8"/"Animaciones" (§6.1.3/§6.3) y reorganizarla siguiendo el estilo claro del resto del sitio. Se implementó:
- `.rb-map` pasa de degradado violeta+grano+marcas de esquina a fondo claro estándar, mismo encabezado que `.rb-kinds`.
- Las 3 cifras (reportes/ciudades/estado) pasan de una franja oscura con hairlines a 3 tarjetas claras independientes, mismo lenguaje que `.change-card`/`.rb-kind` (fondo blanco, borde sutil, sombra suave).
- El marco del mapa (`.rb-map-frame`) pierde el bisel oscuro con marcas tipo mira/escáner; pasa a tarjeta blanca simple.
- Ticker, tabla-ranking y toggle se recolorearon a texto oscuro sobre fondo claro (antes era al revés), sin tocar su estructura ni su lógica.
- Los tokens `--rb-onDark`/`--rb-onDark-soft` se renombraron a `--rb-ink`/`--rb-ink-soft` (ahora apuntan a texto oscuro por defecto) — mismo patrón de variables, significado invertido.
- Tema oscuro: `.rb-map` dejó de ser la única superficie "siempre índigo" del sitio (esa regla especial se eliminó) — ahora hereda el mismo tratamiento de tarjeta oscura que ya usan `.rb-kind`/`.change-card`, solo redefiniendo `--rb-ink-soft`/`--rb-hairline`/`--rb-card-bg` (que sí necesitan valores literales por tema, ver §2.1: los tripletes `--*-rgb` no se redefinen por tema).
- Alto contraste: se quitó el forzado a fondo negro de `.rb-map`/`.rb-map-frame` — ahora hereda blanco/negro como cualquier sección (igual que `.rb-kind`/`.change-card`, que tampoco fuerzan fondo). Los textos que antes eran blancos sobre el negro forzado (`rb-atlas-caption`, `rb-map-table-toggle`, `th`/`td`) pasan a negro sobre blanco.
- Verificado en navegador (Playwright, `npx serve` local) en claro, oscuro y alto contraste, y en 375px/1440px sin scroll horizontal. 0 errores de consola.

**Cambio técnico — CARTO tampoco es fiable sin key, verificado en vivo esta vez (no un brief).** El plan original de esta fase asumía seguir con CARTO (cambiando de `dark_all` a `light_all` para combinar con el nuevo fondo claro) y opcionalmente aplicar un filtro CSS sobre tiles de OpenStreetMap si algún día CARTO fallaba. Al implementar `light_all` y cargar la página real en navegador, **los tiles reales de Colombia se veían tapados por una marca de agua diagonal "API KEY REQUIRED — carto.com/basemaps/apikey"**, pese a que cada tile individual respondía `HTTP 200` (la marca de agua viene *dentro* de una imagen PNG válida, no como error HTTP — un `curl -o /dev/null -w '%{http_code}'` no la detecta, hace falta abrir el PNG o renderizar la página real). Una prueba puntual de `dark_all` sobre una coordenada arbitraria (no Colombia) mostró la misma marca de agua, así que el problema no es exclusivo de `light_all`. **Se abandonó CARTO por completo** y se cambió a tiles estándar de OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), que no piden key nunca — la opción que un brief anterior de esta misma conversación ya había recomendado como la más estable a largo plazo, y que en su momento se descartó como innecesaria porque `dark_all` sí cargaba bien en esa verificación puntual. Verificado de nuevo en navegador tras el cambio: tiles reales de Colombia, sin marca de agua, atribución de OSM visible y legible.

**Lección de proceso, para no repetirla**: verificar un proveedor de tiles con `curl -o /dev/null -w '%{http_code}'` sobre 1-2 coordenadas sueltas NO es suficiente — un `200` puede ser una marca de agua válida como PNG. La única verificación confiable es renderizar la página real en navegador (Playwright) y mirar el resultado, sobre las coordenadas reales que la página pide, no una URL de prueba aislada.

**Archivos tocados**: `assets/JS/mapa-impacto.js` (URL de tiles + atribución), `assets/css/reporta-una-barrera.css` (todo el bloque `.rb-map` y sus overrides de tema oscuro/alto contraste), `reporta-una-barrera/index.html` (se quitaron las clases modificadoras `rb-section-head--onDark`/`rb-eyebrow--onDark`, ya sin uso). Ninguna lógica de datos/fetch/animación/tabla accesible cambió.

## 6.9 Rediseño de "#iniciativa" (home) a sección clara — fase "Congruencia visual del home"

Mismo criterio aplicado a `.rb-map` en §6.8, ahora sobre `#iniciativa` (la sección "Nueva iniciativa" del home, §6.6). Pedido explícito del usuario: la sección se sentía "fuera de la página" y no se veía igual al resto en tema oscuro/daltonismo.

**Diagnóstico confirmado antes de tocar código**: `#iniciativa` tenía fondo sólido fijo en `--theme-color-strong` (`#4338CA`) — esa variable **no cambia por tema** (a diferencia de `--purple`/`--text`, que sí se redefinen en `body.theme-dark`/`body.theme-colorblind`) — y ocupaba el ancho completo de la pantalla (`max-width:none; width:100%`), rompiendo el contenedor centrado de 1000px que usan `#proposito`/`#donaciones`/`#contacto`. Efecto real: en modo daltonismo el resto del sitio recolorea (`--purple`→azul `#005fcc`, `--blue`→naranja `#ff9900`) pero esta sección se quedaba con el mismo morado de siempre, y el full-bleed la hacía leer como un banner ajeno al flujo editorial del resto de secciones.

**Cambio**: se eliminó el override de fondo/ancho por completo — `#iniciativa` ahora es un `.section` estándar (mismo contenedor de 1000px, mismo fondo blanco con degradados radiales sutiles que ya define `home-storytelling.css` para las demás secciones, consciente de tema sin código adicional). Badge, `h2`, párrafo y checklist dejaron de forzar blanco (heredan `var(--text)`/color de heading estándar). El CTA (`.iniciativa-cta`, que ya traía la clase `.btn-primary`) perdió el override que lo pintaba blanco-sobre-índigo — ahora es el botón primario estándar del sitio, igual que en Donaciones. La tarjeta de cifras (blanca, con los 2 stats) se mantuvo casi igual — nunca fue el problema, siempre fue una tarjeta clara — solo se le bajó la intensidad de sombra a la misma que usa `.change-card`.

**2 bugs reales de especificidad encontrados verificando en navegador (no supuestos, confirmados con capturas antes/después)**:
1. `.iniciativa-stat-value` (el número grande "17"/"7") quedaba gris pálido (`#e6e6e6`) en tema oscuro: es un `<span>` sin prefijo `#iniciativa`, y `body.theme-dark span` (accessibility.css, especificidad 0-1-1) le ganaba a la clase sola (0-1-0). Fix: agregar el prefijo `#iniciativa` (1 id) para ganar la cascada.
2. `.iniciativa-stats-title`/`.iniciativa-stat-label`/`.iniciativa-stats-hint`/`.iniciativa-stat-value` en **alto contraste**: como sí tienen el prefijo `#iniciativa` (1 id), le ganaban a la regla genérica `body.theme-high-contrast p/span` (0 ids) y se quedaban en gris atenuado en vez de negro puro — el override explícito a `color:#000` que ya existía en el código original para estos 4 elementos **sí seguía siendo necesario**; se había quitado por error asumiendo que la regla genérica alcanzaría, y se restauró tras verlo en la captura de alto contraste.

**Lección reforzada** (ya documentada en §6.8 para el caso de CARTO, aplica aquí también): cualquier suposición de "esto ya debería heredar del genérico" se verificó de hecho renderizando cada tema en navegador, no asumida por lectura del CSS — así se encontraron los 2 bugs de especificidad de arriba.

**Verificado en navegador** (Playwright, `npx serve` local): claro, oscuro, daltonismo y alto contraste; 375px sin scroll horizontal; 0 errores de consola. `iniciativa-impacto.js` (fetch a Supabase, conteo animado) no se tocó.

**Archivos tocados**: `assets/css/iniciativa-destacada.css` (todo el bloque de color/fondo/temas). Sin cambios en `index.html` ni en JS.

## 6.10 "Qué puedes reportar" — 5 categorías reales + grid bento — fase "Categorías reales"

Reemplaza las 4 tarjetas antiguas (Rampas/Andenes/Transporte/Baños, con fotos reales ya existentes) por las 5 categorías reales del formulario de reportes (`reportes-inclusia-public.vercel.app`): Movilidad, Transporte, Infraestructura, Información, Comunicación.

**Verificado contra el wizard real antes de construir, no asumido**: se entró al formulario en vivo, se abrió el `combobox` de categoría y se extrajo el SVG exacto de cada ícono vía `outerHTML` (son de la librería Lucide, embebidos inline por el wizard). El brief original describía el ícono de Movilidad como una silla de ruedas — **el ícono real es "huellas/pasos" (`lucide-footprints`)**, no una silla de ruedas. Se le preguntó al usuario y confirmó usar el ícono verificado, no el descrito. Orden y nombres del brief sí coincidían 1:1 con el wizard real. Íconos usados (idénticos al selector real, en la esquina de cada tarjeta junto al `h3` y también centrados y semi-transparentes en el placeholder):
- Movilidad → `lucide-footprints`
- Transporte → `lucide-bus`
- Infraestructura → `lucide-building-2`
- Información → `lucide-info`
- Comunicación → `lucide-message-circle`

**Grid bento**: `.rb-kind-grid` pasó de `repeat(auto-fit, minmax(210px,1fr))` a `repeat(4, 1fr)` fijo, con `.rb-kind--featured` (Movilidad) en `grid-column: span 2; grid-row: span 2`. El auto-placement de CSS Grid ya resuelve solo la posición de las otras 4 (llenan columnas 3-4 en orden de aparición en el DOM) — no hizo falta `grid-template-areas`. Tablet (769-1024px): la protagonista baja a `grid-row: span 1`. Móvil (≤768px): una sola columna, todas las cards con `span 1`, pero el placeholder de Movilidad usa `aspect-ratio: 4/3` (más alto) contra `16/9` de las demás, para conservar algo de jerarquía apiladas.

**Bug real encontrado y corregido en esta fase (no en el brief, hallado verificando en navegador)**: con la protagonista ocupando 2 filas del grid, su alto terminaba definido por lo que miden las 4 tarjetas chicas apiladas al lado — casi siempre más que el contenido propio de Movilidad — dejando un hueco en blanco grande debajo del texto. Se resolvió con `.rb-kind--featured .rb-kind-placeholder { flex: 1 1 auto; }` (dentro de `.rb-kind--featured { display:flex; flex-direction:column; }`): el placeholder (y la futura foto) absorbe el sobrante de alto en vez de dejarlo vacío. El `aspect-ratio` sigue siendo el alto **mínimo** — nunca se encoge por debajo — pero puede crecer más. Verificado con Playwright: sustituir el SVG del placeholder por un `<img>` de prueba (tanto en una tarjeta chica como en la protagonista) no cambia las dimensiones del contenedor ni un píxel — cero salto de layout garantizado tanto en las tarjetas fijas por `aspect-ratio` como en la protagonista, cuyo alto lo decide el `flex-grow` del grid, no el contenido.

**Placeholders — pendiente real**: los 5 son `<div class="rb-kind-placeholder" data-placeholder-for="...">` con el ícono de la categoría centrado al 32% de opacidad sobre `rgba(--purple-rgb, 0.08)` (tinte claro derivado del morado de marca; en tema oscuro sube a `rgba(155,140,255,0.12)` con ícono en `#A9B0FF`; en alto contraste, fondo blanco + ícono negro sólido). Cada uno tiene un comentario HTML de una línea (`<!-- imagen real: ... -->`) describiendo qué foto va ahí. **Reemplazar los 5 placeholders de la sección "Qué puedes reportar" por fotografías reales cuando se entreguen** — basta sustituir el `<svg>` por un `<img style="width:100%;height:100%;object-fit:cover">` dentro de cada `.rb-kind-placeholder`; las proporciones (`aspect-ratio` + `flex-grow` en la protagonista) ya están resueltas y no van a saltar.

**Accesibilidad**: cada ícono (tanto el pequeño junto al `h3` como el grande del placeholder) lleva `aria-hidden="true"` — el nombre de la categoría en el `h3` sigue siendo el texto accesible real. `.rb-kind-grid` se agregó a `STAGGER_GROUP_SELECTOR` (`scroll-animations.js`) para que las 5 tarjetas entren con el mismo revelado escalonado que el resto del sitio (antes esta sección solo tenía el fade genérico de `.section.hidden`, sin stagger por tarjeta).

**Verificado en navegador** (Playwright, `npx serve` local): 375px/900px/1280px sin overflow horizontal, tema claro/oscuro/alto contraste, 0 errores de consola, simulación de reemplazo de imagen sin salto de layout.

**Archivos tocados**: `reporta-una-barrera/index.html` (sección `#que-reportar` reescrita completa), `assets/css/reporta-una-barrera.css` (grid bento + placeholders + temas), `assets/JS/scroll-animations.js` (una línea, `.rb-kind-grid` agregado a `STAGGER_GROUP_SELECTOR`).

## 6.11 "Cómo funciona" — guía de 6 pasos del wizard real — fase "Guía del formulario"

Nueva sección `#como-funciona` entre `#que-reportar` y `#reportar` (CTA final) en `reporta-una-barrera/index.html`. Es una guía conceptual del proceso (número + ícono + título + descripción por paso), **no** una réplica pixel-perfect de las pantallas del wizard — a propósito, para no desactualizarse si el formulario real cambia.

**Posición — discrepancia real con el brief, resuelta con el usuario**: el brief pedía ubicar la sección "después de Qué puedes reportar, antes del mapa de impacto", pero el orden real de la página es Hero → Recorrido → **Mapa de impacto → Qué puedes reportar** → CTA final — es decir, `#que-reportar` ya está *después* del mapa, no antes, así que esa posición no existe tal cual. Se le preguntó al usuario: se mantiene el orden de secciones existente sin reordenar nada, y `#como-funciona` va justo después de `#que-reportar`, antes del CTA final.

**Verificado contra el wizard real paso a paso** (Playwright, sin enviar el reporte de prueba — se completaron los pasos 1-5 con datos ficticios y se leyó cada pantalla, sin hacer clic en "Enviar reporte" para no crear un registro real):
- Paso 4 ("Tus datos"): confirmado que **solo pide nombre y correo, sin teléfono** — el brief pedía explícitamente revisar esto por si un campo ya eliminado (teléfono) se había colado, y no fue el caso.
- Paso 3 ("Evidencia"): el formulario real también incluye un selector de "Prioridad" (Normal/Alta) que el brief no mencionaba. Se dejó el copy del brief tal cual (fotos opcionales) sin agregarlo — es un campo secundario, no central al paso, y el brief pidió ajustar el texto dado "mínimamente".
- Paso 2 ("¿Dónde está?"): el campo real es Ciudad (selector) + Dirección (autocompletado) + mapa, no un único campo de dirección — el copy del brief ("Escribe la dirección o marca el punto en el mapa") sigue siendo una simplificación conceptual razonable, no se cambió.
- El resto (pasos 1 y 5) coincide con el copy del brief sin ajustes.

**Construcción del stepper**: `<ol class="rb-stepper">` (semántico, el orden importa), 6 `<li class="rb-stepper-item">` con círculo numerado (`.rb-stepper-marker`/`.rb-stepper-number`), ícono decorativo (`aria-hidden="true"`, SVG propio inspirado en el mismo lenguaje visual de Lucide ya usado en `#que-reportar`, sin necesidad de coincidir con ningún ícono externo esta vez — a diferencia de las categorías, aquí el brief solo pedía "ícono representativo", no fidelidad con el wizard), `h3` (texto accesible real) y `p`.

- **Línea conectora, desktop**: un solo `.rb-stepper::before` absoluto, `left: calc(100%/12); right: calc(100%/12);` — con 6 columnas iguales, el centro de la primera columna cae exactamente en 1/12 del ancho total y el de la sexta en 11/12, así que esta fracción conecta el centro del primer círculo con el centro del último sin necesidad de medir nada en JS.
- **Línea conectora, móvil (≤768px)**: un riel por tarjeta (`.rb-stepper-item::after`, `top:44px` a `bottom:0`, gap:0 entre `<li>`) en vez de una sola línea global — más robusto porque cada tramo se ajusta solo a la altura real de su propio texto (que varía por paso), sin depender de una medida total fija.
- **Dibujo progresivo**: `transform:scaleX(0)`/`scaleY(0)` → `scale(1)` al ganar `.stagger-visible` (la misma clase que ya gestiona `scroll-animations.js` para el resto de grupos con stagger). `.rb-stepper` se agregó a `STAGGER_GROUP_SELECTOR` — sin JS nuevo, reutiliza el sistema existente. El segmento vertical de móvil usa `transition-delay: calc(var(--stagger-index) * 90ms)` (la misma variable que ya fija el JS por tarjeta) para que cada tramo se dibuje en el momento en que aparece su propia tarjeta.
- **Alto contraste**: el círculo (`div`, no cubierto por las reglas genéricas de `accessibility.css` que solo tocan h1-h6/p/li/span) necesitó su propio override — sin él quedaba con el índigo fijo de fondo y un recuadro blanco de `body.theme-high-contrast span` encima del número, ilegible. Se invirtió a negro sólido con número blanco, mismo criterio que `.rb-marker-count` en `.rb-map`. Verificado en navegador antes/después.
- **Reduced motion**: verificado con `page.emulateMedia({ reducedMotion: 'reduce' })` (no solo asumido) — con la preferencia activa, `:root.reduce-motion` se aplica sola, los pasos aparecen con opacity:1/transform:none de inmediato y la línea queda dibujada (`scaleX(1)`) sin transición, por el override global ya existente en `reduce-motion.css` (`transition-duration:0.01ms`) — no hizo falta código nuevo de reduced-motion.

**Bloque de confianza** (`.rb-trust-row`, 3 datos con ícono): reloj / candado abierto / cámara, mismo lenguaje SVG. Deliberadamente casi repite "sin necesidad de crear una cuenta" y "menos de 3 minutos" que ya dice `.rb-cta-note` un scroll más abajo — es intencional (el brief lo pide así, como remoción de fricción justo antes del CTA), no un descuido.

**Verificado en navegador**: 375px/1280px sin overflow horizontal, tema claro/oscuro/alto contraste, colores computados confirmados vía `getComputedStyle` (no solo visual — una diferencia de color entre pasos en la captura de tema oscuro resultó ser un artefacto de la animación de entrada a mitad de transición, no un bug real: se verificó que los 6 `h3` tienen el mismo `rgb(155,140,255)` computado), 0 errores de consola.

**Archivos tocados**: `reporta-una-barrera/index.html` (sección nueva), `assets/css/reporta-una-barrera.css` (bloque `.rb-stepper`/`.rb-trust-row` + temas), `assets/JS/scroll-animations.js` (una línea, `.rb-stepper` agregado a `STAGGER_GROUP_SELECTOR`).

## 6.12 Auditoría y cierre — fase "QA final / cierre del plan"

Pasada de cierre sobre las ~24 fases anteriores: confirmar consistencia del nav (§4.4) y el mapa (§6.8) en todo el sitio, cohesión narrativa de `reporta-una-barrera/index.html`, cero gradientes/glassmorphism sin justificar, microinteracciones uniformes, código muerto, rendimiento (Lighthouse) y accesibilidad (axe-core + teclado). Metodología: dos sub-agentes en paralelo hicieron el barrido de solo-lectura (grep/read, sin editar) sobre código muerto/gradientes/microinteracciones y sobre mapa/narrativa; los arreglos reales se aplicaron después, uno por uno, verificados en navegador — para no arriesgar ediciones concurrentes sobre los mismos archivos.

**Hallazgos reales corregidos** (no solo confirmaciones — cada uno tenía una causa concreta, no una sospecha):

1. **Bug real de cascada, no de código muerto**: `accessibility.css` traía un bloque completo de tema oscuro/alto-contraste/suave del panel de nav (~180 líneas, con `!important`) de una generación **anterior** incluso a "Hamburguesa permanente" — nunca se borró al migrar el nav, y le ganaba la cascada en silencio a los valores correctos de `layout.css` en los tres temas. Ningún usuario en tema oscuro/alto-contraste/suave veía los colores del nav que el código de `layout.css` decía que debía ver. Se eliminó el bloque completo; verificado en navegador que los tres temas ahora muestran los valores documentados en §4.4.
2. **Gradientes reales, no la textura de fondo preexistente del sitio** (la regla "sin gradientes" de esta fase se aplicó a lo que se coló como accidente o deuda técnica, no a los washes radiales de fondo de hero que el sitio ya usaba en decenas de secciones desde antes de este plan — purgar esos habría sido un rediseño visual completo, fuera de alcance de un cierre/QA). Se aplanaron a color sólido: `.btn-primary` global y sus 4 variantes (`button` genérico, `.floating-accessibility-btn`, `.tts-button-container button.speaking`, `body.theme-dark .btn-primary`, `.rb-btn-strong` y su override oscuro) — resuelve a la vez la deuda de contraste ya documentada en §2.1 (el degradado daba 3.3-4.47:1 en claro y ~2.5:1 en oscuro; ahora `--theme-color-strong`/`--theme-color-strong-soft` dan 7.9:1/5.4:1 en todas partes. `--rb-lead-accent` del mapa (magenta `#9B2FB0`, fuera de la paleta documentada, usado en 2 gradientes) pasó a `var(--theme-color-strong-soft)` sólido. También: `.change-card`/`.principle-item`/`.card-icon` (fondo con wash sutil, duplicado en 2 archivos), `.rb-map-table-bar::after`, `.loader-name`/`.loader-bar-fill` del splash de carga.
3. **`.skip-link` y `.menu-phrase` fallaban AA real** (4.2:1 y ~1.8:1 respectivamente, confirmado con axe-core y Lighthouse) — pasaron a `--theme-color-strong`/`#5b6472`. **`.pqe-eyebrow` y `.fundadores-section .eyebrow`/`.eyebrow`** (mismo patrón: `var(--purple)` a tamaño pequeño, ~4.2:1 en tema "colores suaves") también corregidos a `--theme-color-strong`.
4. **`role="list"` sin hijos `role="listitem"`** en `.social-links-footer` (las 8 páginas, aria-required-children, crítico) — se quitó el `role="list"` en vez de envolver cada link en un hijo con rol; no eran listas semánticas reales.
5. **`#rb-leaflet-map` con `role="img"` pero con descendientes focusables reales** (los links de atribución de Leaflet/OSM, obligatorios por licencia) — nested-interactive. Se cambió a `role="region"` (si el contenedor va a tener controles reales dentro, `img` nunca es el rol correcto, sin importar cuánto se parezca visualmente a una imagen estática).
6. **`politica-tratamiento-datos.html` nunca cargó `main.js`** (cargaba `navbar.js`/`nav-enhance.js` sueltos, con un comentario que decía "no tiene formulario, carrusel ni storytelling" — cierto, pero irrelevante: main.js también trae el botón flotante de accesibilidad, `back-to-top`, `scroll-animations`, `keyboard-navigation`). Consecuencia real: esta página **nunca había tenido el botón de accesibilidad** ni forma de cambiar de tema, en las 7+ fases que este plan lleva construyendo esos temas. Se corrigió (un solo `<script>` en vez de dos, sin duplicar `navbar.js`) y se agregó el markup del botón flotante que faltaba + `animations.css`. Al abrir por primera vez el tema oscuro en esta página (nunca antes alcanzable), salió un bug real nuevo: `.policy-reference` tenía fondo claro fijo sin contraparte oscura — texto claro heredado sobre fondo que seguía claro. Corregido.
7. **Código muerto confirmado con grep antes de borrar cada bloque** (no a ciegas): `assets/css/main.css` y `conponents.css` (0 bytes, cero referencias — eliminados); `.page-section`/`.dropdown > a`/`hr`/`.stagger > *` en `animations.css` (selectores sin ningún elemento real en el DOM de las 8 páginas); ~16 `console.log` de depuración con emojis en `text-to-speech.js` (se conservaron los `console.warn`/`console.error` de estados de fallo real). Comentarios que referenciaban conceptos ya revertidos (`light_all` de CARTO, `.rb-map-tint`) se reescribieron para reflejar el estado real (OSM, sin tinte).
8. **Consistencia menor**: `.change-card`/`.principle-item` usaban `0.25s ease` en vez de `var(--transition-fast)` (0.2s) — alineado. Clase HTML muerta `.eyebrow` (sin regla en el CSS que carga esa página) quitada de las 4 secciones de `reporta-una-barrera/index.html` que la traían junto a `.rb-eyebrow`. Los 4 párrafos "intro" de sección en esa misma página tenían 3 tratamientos de opacidad distintos (0.62/0.72/0.82) sin razón documentada — unificados a uno.

**Verificado, no solo revisado — con evidencia, no por lectura del CSS**:
- **Falsos positivos reales encontrados y descartados explícitamente** (mismo principio que documentan §6.8/§6.9/§6.11 — verificar en navegador, no asumir): varias fallas de contraste de axe-core en tema oscuro/alto-contraste resultaron ser el loader de página (`.loader-name`) capturado a mitad de su transición de salida (0.75s), o el logo/wordmark del nav (`.brand span`, `color: var(--purple)`) — exento de AA por ser texto de logotipo (WCAG 1.4.3), decisión consciente de no tocarlo porque cambiaría la identidad de marca del wordmark sin ajustar el ícono. Un `localStorage` con tema oscuro persistido de una prueba anterior contaminó una ronda completa de resultados hasta que se limpió explícitamente — lección de proceso para cualquier auditoría futura con axe-core sobre este sitio.
- **axe-core (WCAG 2.0/2.1 A+AA) sobre las 8 páginas × 5 estados (claro + 4 temas)**: 0 violaciones reales al cierre, salvo la excepción de logotipo ya documentada.
- **Lighthouse (desktop) antes/después**: `index.html` Accessibility 92→96, Performance 93→94; `reporta-una-barrera/index.html` Accessibility 88→93, Performance 93. Best Practices/SEO en 100 en ambas, sin cambios (ya estaban en el máximo).
- **Teclado**: Tab completo desde `index.html` hasta el CTA final de `reporta-una-barrera/index.html`, incluido el mega-menú de escritorio — orden lógico confirmado.
- **Responsive**: 375/768/1024/1440px en las 8 páginas, sin overflow horizontal (incluido tras hacer scroll completo para disparar el mapa Leaflet y los reveals con stagger).

**Archivos tocados**: `assets/css/accessibility.css`, `assets/css/animations.css`, `assets/css/base.css`, `assets/css/layout.css`, `assets/css/privacy-policy.css`, `assets/css/quienes-lo-que-queremos.css`, `assets/css/quienes-nosotros.css`, `assets/css/quienes-por-que-existe.css`, `assets/css/reporta-una-barrera.css`, `assets/JS/text-to-speech.js`, `politica-tratamiento-datos.html`, `reporta-una-barrera/index.html`, `index.html` + las 7 páginas restantes (`role="list"`), `components/footer.html` (legacy, mismo fix por prolijidad). Eliminados: `assets/css/main.css`, `assets/css/conponents.css`.

## 7. Notas para fases futuras

- Los archivos `components/header.html` y `components/navbar.html` están vacíos y `components/footer.html` no se usa realmente — si en una fase futura se decide introducir un sistema real de includes (aunque sea con JS `fetch()` + `innerHTML` seguro, o un script de build mínimo), este sería el punto de partida lógico, pero implica tocar las 7 páginas existentes para dejar de duplicar nav/footer.
- Antes de dar por buena la paleta de colores para una página nueva, vale la pena decidir explícitamente si `#6366f1` (theme-color) se adopta como variable real o si se estandariza sobre `--purple` (`#7B61FF`) ya existente — hoy conviven ambos tonos sin definición formal.
- **Redes sociales — resuelto parcialmente en la fase "Indexación en Google" (§6.7)**: INCLUSIA solo tiene cuenta real en Instagram (`https://www.instagram.com/inclusiacorporacion/`), confirmado por el usuario. El `href` de Instagram se corrigió en las 8 páginas + `components/footer.html` (legacy) y se agregó a `sameAs` en el JSON-LD de `index.html`. Facebook/X/TikTok **siguen apuntando a placeholders genéricos a propósito** (`https://facebook.com`, `https://x.com`, `https://tiktok.com`) — decisión explícita del usuario de dejarlos así por ahora en vez de ocultarlos, hasta que existan cuentas reales. Si se crean esas cuentas, actualizar sus `href` y sumarlas a `sameAs`.
