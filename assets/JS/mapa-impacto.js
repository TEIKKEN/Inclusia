/**
 * Mapa de impacto — reporta-una-barrera (Fase 8).
 *
 * Reemplaza el atlas SVG estático por un mapa Leaflet real, cargado
 * con los conteos agregados reales que expone la plataforma de
 * reportes vía `get_public_report_counts()` (Supabase, solo lectura,
 * sin datos personales). El fetch + la inicialización del mapa se
 * difieren hasta que #mapa-impacto entra en viewport, para no pagar
 * el costo de Leaflet/tiles en quien nunca hace scroll hasta ahí.
 *
 * Este módulo no depende de main.js y se carga aparte, igual que
 * reporta-una-barrera.js y nav-enhance.js (ver SITIO_CONTEXT.md §1.4).
 *
 * La animación en sí (conteo ascendente, revelado escalonado) vive
 * en módulos propios — animate-count.js y stagger-reveal.js — para
 * que este archivo se ocupe de los datos y el mapa, no de cómo se
 * anima cada cosa.
 */

import { animateCount } from './animate-count.js';
import { staggerReveal } from './stagger-reveal.js';

const SUPABASE_URL = 'https://rgirpoaqzsasbmurfaem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ma4RbYkE7HaIZ4WlW_LKDQ_wy-XIrzx';
const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/get_public_report_counts`;

const COLOMBIA_CENTER = [4.5709, -74.2973];
const COLOMBIA_DEFAULT_ZOOM = 5;
const MARKER_STAGGER_MS = 90;
const MARKER_MIN_DIAMETER = 32;
const MARKER_MAX_DIAMETER = 60;

const section = document.getElementById('mapa-impacto');
const mapContainer = document.getElementById('mapa-en-vivo');
const mapEl = document.getElementById('rb-leaflet-map');
const counterEl = document.getElementById('mapa-contador');
const tickerEl = document.getElementById('mapa-ticker');
const tableBody = document.getElementById('rb-map-table-body');

if (section && mapContainer && mapEl && window.L) {
  const hintEl = mapContainer.querySelector('[data-map-role="hint"]');
  const totalEl = counterEl?.querySelector('[data-map-field="total"]');
  const citiesEl = counterEl?.querySelector('[data-map-field="cities"]');
  const statusEl = counterEl?.querySelector('[data-map-field="status"]');
  const liveIndicator = section.querySelector('.rb-live-indicator');

  function setLiveState(state) {
    if (statusEl) statusEl.dataset.state = state;
    if (liveIndicator) liveIndicator.dataset.state = state;
  }

  function setStatus(status) {
    mapContainer.dataset.mapStatus = status;
    if (counterEl) counterEl.dataset.mapStatus = status;
    if (tickerEl) tickerEl.dataset.mapStatus = status;
  }

  function markerDiameter(count, maxCount) {
    if (maxCount <= 0) return MARKER_MIN_DIAMETER;
    const scale = Math.sqrt(count) / Math.sqrt(maxCount);
    return Math.round(MARKER_MIN_DIAMETER + (MARKER_MAX_DIAMETER - MARKER_MIN_DIAMETER) * scale);
  }

  function reportLabel(count) {
    return `${count} reporte${count === 1 ? '' : 's'}`;
  }

  /**
   * La tabla es un ranking, no una hoja de cálculo: una sola columna
   * de datos (la barra + el número) que puede usar todo el ancho de
   * la fila en cualquier viewport, en vez de competir por espacio
   * con columnas fijas de ciudad/departamento (eso era lo que se
   * cortaba en móvil con el diseño anterior de 4 columnas).
   */
  function buildTable(rows) {
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 2;
      td.textContent = 'Todavía no hay reportes registrados.';
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    const ranked = rows.slice().sort((a, b) => b.report_count - a.report_count);
    const maxCount = ranked[0].report_count;

    ranked.forEach((row, index) => {
      const tr = document.createElement('tr');

      const rowHeader = document.createElement('th');
      rowHeader.scope = 'row';

      const rank = document.createElement('span');
      rank.className = 'rb-map-table-rank';
      rank.textContent = String(index + 1).padStart(2, '0');

      const city = document.createElement('span');
      city.className = 'rb-map-table-city';
      city.textContent = row.city;

      const dept = document.createElement('span');
      dept.className = 'rb-map-table-dept';
      dept.textContent = row.department;

      rowHeader.append(rank, city, dept);
      tr.appendChild(rowHeader);

      const countTd = document.createElement('td');
      countTd.className = 'rb-map-table-count';

      const bar = document.createElement('div');
      bar.className = 'rb-map-table-bar';
      bar.style.setProperty('--bar-scale', String(row.report_count / maxCount));

      const value = document.createElement('span');
      value.className = 'rb-map-table-value';
      value.textContent = String(row.report_count);

      countTd.append(bar, value);
      tr.appendChild(countTd);

      tableBody.appendChild(tr);
    });
  }

  function showTableError() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.textContent = 'No pudimos cargar los datos en este momento.';
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }

  function revealMarkers(markers) {
    const icons = markers
      .map(marker => marker.getElement()?.querySelector('.rb-marker'))
      .filter(Boolean);

    staggerReveal(icons, { delayStep: MARKER_STAGGER_MS });
  }

  /**
   * El mapa es un panel de solo lectura: cero pan, cero zoom, cero
   * popups. Cada afordancia interactiva de Leaflet se desactiva a
   * propósito para que se lea como un instrumento que muestra el
   * impacto, no como un mapa embebido genérico para explorar.
   */
  function renderMap(rows) {
    const map = L.map(mapEl, {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false
    }).setView(COLOMBIA_CENTER, COLOMBIA_DEFAULT_ZOOM);

    // Tiles estándar de OpenStreetMap: sin API key, nunca la piden.
    // CARTO (light_all/dark_all) se probó primero pero devuelve un
    // watermark "API KEY REQUIRED" sobre los tiles reales de Colombia
    // sin key — verificado en vivo en esta fase (ver SITIO_CONTEXT.md
    // §6.8). El tono neutro de OSM además combina mejor con la
    // tarjeta clara que el mapa ya usa.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Leaflet no reacciona solo a cambios de tamaño del contenedor
    // (p. ej. pasar de layout móvil a desktop sin recargar la
    // página) — sin esto, el mapa se queda con las dimensiones de
    // la primera medición y solo pinta tiles/marcadores para esa
    // franja, dejando el resto del contenedor vacío.
    window.addEventListener('resize', () => map.invalidateSize());

    if (!rows.length) return map;

    const maxCount = Math.max(...rows.map(row => row.report_count));

    const markers = rows.map(row => {
      const size = markerDiameter(row.report_count, maxCount);
      const fontSize = Math.max(11, Math.round(size * 0.34));
      const isLead = row.report_count === maxCount;
      const icon = L.divIcon({
        className: '',
        html:
          `<div class="rb-marker${isLead ? ' rb-marker--lead' : ''}" style="width:${size}px;height:${size}px;font-size:${fontSize}px;">` +
          `<span class="rb-marker-ring" aria-hidden="true"></span>` +
          `<span class="rb-marker-count">${row.report_count}</span>` +
          `</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([row.latitude, row.longitude], {
        icon,
        keyboard: false,
        interactive: false,
        title: `${row.city}: ${reportLabel(row.report_count)}`
      });

      marker.addTo(map);
      return marker;
    });

    const bounds = L.latLngBounds(rows.map(row => [row.latitude, row.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });

    // Doble rAF: fuerza al navegador a pintar el estado inicial
    // (opacity:0, scale:0.4) antes de activar la transición.
    requestAnimationFrame(() => requestAnimationFrame(() => revealMarkers(markers)));

    return map;
  }

  function showError() {
    setStatus('error');

    if (hintEl) {
      hintEl.textContent =
        'No pudimos cargar el mapa en vivo en este momento. Los datos siguen disponibles en la tabla debajo.';
      hintEl.classList.add('rb-atlas-hint--error');
    }

    if (tickerEl) {
      tickerEl.textContent =
        'No pudimos cargar el mapa en vivo. Los datos reales siguen disponibles en la tabla debajo.';
    }

    if (statusEl) statusEl.textContent = 'No disponible';
    setLiveState('error');

    showTableError();
  }

  async function loadImpactData() {
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('No se pudo cargar el mapa de impacto');

    return response.json();
  }

  async function init() {
    try {
      const rows = await loadImpactData();
      const totalReports = rows.reduce((sum, row) => sum + row.report_count, 0);
      const cityCount = rows.length;

      renderMap(rows);
      buildTable(rows);
      setStatus('loaded');

      animateCount(totalEl, totalReports);
      animateCount(citiesEl, cityCount);

      if (statusEl) statusEl.textContent = cityCount ? 'Mapa actualizado' : 'Esperando el primer reporte';
      setLiveState(cityCount ? 'live' : 'empty');

      if (hintEl) {
        hintEl.textContent = cityCount
          ? 'Cada punto es una ciudad real; el tamaño crece con el número de reportes.'
          : 'El mapa está en cero: todavía no se ha recibido ningún reporte.';
      }

      if (tickerEl) {
        tickerEl.textContent = cityCount
          ? `Mapa en vivo · ${reportLabel(totalReports)} en ${cityCount} ciudad${cityCount === 1 ? '' : 'es'}.`
          : 'El mapa está en cero y este recorrido empieza a existir con el primer reporte.';
      }
    } catch (error) {
      console.error('[mapa-impacto]', error);
      showError();
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.disconnect();
            init();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(section);
  } else {
    init();
  }
}
