/**
 * Cifras en vivo de la sección "Nueva iniciativa" del home — versión
 * liviana del panel de mapa-impacto.js (reporta-una-barrera/): mismo
 * endpoint de Supabase (get_public_report_counts) y la misma animación
 * de conteo ascendente, pero sin cargar Leaflet ni las coordenadas de
 * cada ciudad — aquí solo hacen falta los totales agregados.
 */

import { animateCount } from './animate-count.js';

const SUPABASE_URL = 'https://rgirpoaqzsasbmurfaem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ma4RbYkE7HaIZ4WlW_LKDQ_wy-XIrzx';
const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/get_public_report_counts`;

const card = document.getElementById('iniciativa-stats');
const totalEl = card?.querySelector('[data-stat-field="total"]');
const citiesEl = card?.querySelector('[data-stat-field="cities"]');
const hintEl = card?.querySelector('[data-stat-field="hint"]');

if (card && totalEl && citiesEl && hintEl) {
  function setStatus(status) {
    card.dataset.statsStatus = status;
  }

  async function loadCounts() {
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('No se pudo cargar el resumen de impacto');

    return response.json();
  }

  async function init() {
    try {
      const rows = await loadCounts();
      const totalReports = rows.reduce((sum, row) => sum + row.report_count, 0);
      const cityCount = rows.length;

      animateCount(totalEl, totalReports);
      animateCount(citiesEl, cityCount);
      setStatus('loaded');

      hintEl.textContent = cityCount
        ? 'Datos en tiempo real del mapa de impacto.'
        : 'El mapa está en cero: sé la primera persona en reportar.';
    } catch (error) {
      console.error('[iniciativa-impacto]', error);
      setStatus('error');
      hintEl.textContent =
        'No pudimos cargar las cifras en este momento. Puedes explorar el mapa completo en la herramienta.';
    }
  }

  init();
}
