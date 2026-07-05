import rawProjects from '../data/proyectos_inversion_publica.json';
import rawRegistries from '../data/registros_inversion_publica.json';

// Standard department normalizer
const normalizeDepto = (depto) => {
  if (!depto) return '';
  const d = depto.trim().toUpperCase();
  if (d === 'POTOSI') return 'POTOSÍ';
  return d;
};

// Processed arrays
export const allInversionProjects = rawProjects.map((p, idx) => ({
  ...p,
  _id: `ip-proj-${idx}`,
  departamento_macro: normalizeDepto(p.departamento_macro),
}));

export const allInversionRegistries = rawRegistries.map((r, idx) => ({
  ...r,
  _id: `ip-reg-${idx}`,
  departamento: normalizeDepto(r.departamento),
}));

// Dropdown unique listings
export const getInversionSectors = () => {
  const sectors = new Set(allInversionProjects.map(p => p.sector_economico).filter(Boolean));
  return [...sectors].sort();
};

export const getRegistrySectors = () => {
  const sectors = new Set(allInversionRegistries.map(r => r.sector_especifico).filter(Boolean));
  return [...sectors].sort();
};

export const getAdministrationTypes = () => {
  const types = new Set(allInversionProjects.map(p => p.tipo_administracion).filter(Boolean));
  return [...types].sort();
};

export const getRegistryEjecutores = () => {
  const executores = new Set(allInversionRegistries.map(r => r.ejecutor_dashboard).filter(Boolean));
  return [...executores].sort();
};

// Filter Projects
export const filterInversionProjects = ({ searchTerm = '', selectedDepto = null, selectedSector = '', selectedAdmin = '' }) => {
  let filtered = allInversionProjects;

  if (selectedDepto && selectedDepto !== 'NACIONAL') {
    filtered = filtered.filter(p => p.departamento_macro === selectedDepto);
  }

  if (selectedSector) {
    filtered = filtered.filter(p => p.sector_economico === selectedSector);
  }

  if (selectedAdmin) {
    filtered = filtered.filter(p => p.tipo_administracion === selectedAdmin);
  }

  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(p => 
      (p.nombre_proyecto || '').toLowerCase().includes(term) ||
      (p.sisin || '').toLowerCase().includes(term) ||
      (p.estado || '').toLowerCase().includes(term)
    );
  }

  return filtered;
};

// Filter Registries
export const filterInversionRegistries = ({ searchTerm = '', selectedDepto = null, selectedSector = '', selectedEjecutor = '', selectedMunicipio = '' }) => {
  let filtered = allInversionRegistries;

  if (selectedDepto && selectedDepto !== 'NACIONAL') {
    filtered = filtered.filter(r => r.departamento === selectedDepto);
  }

  if (selectedSector) {
    filtered = filtered.filter(r => r.sector_especifico === selectedSector);
  }

  if (selectedEjecutor) {
    filtered = filtered.filter(r => r.ejecutor_dashboard === selectedEjecutor);
  }

  if (selectedMunicipio) {
    filtered = filtered.filter(r => r.municipio === selectedMunicipio);
  }

  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(r => 
      (r.nombre_obra || '').toLowerCase().includes(term) ||
      (r.sisin || '').toLowerCase().includes(term) ||
      (r.municipio || '').toLowerCase().includes(term) ||
      (r.ejecutor_institucion || '').toLowerCase().includes(term)
    );
  }

  return filtered;
};

// Calculate Project KPIs
export const calculateProjectKPIs = (projects) => {
  const count = projects.length;
  let totalPresupuesto = 0;
  let totalAcumulado = 0;
  let totalEjecucion2026 = 0;
  let sumFisico = 0;
  let sumFinanciero = 0;
  let countFisico = 0;
  let countFinanciero = 0;

  for (let i = 0; i < count; i++) {
    const p = projects[i];
    totalPresupuesto += p.presupuesto_vigente_2026_bs || 0;
    totalAcumulado += p.ejecucion_acumulada_2025_bs || 0;
    totalEjecucion2026 += p.ejecucion_2026_bs || 0;

    const fis = parseFloat(p.avance_fisico);
    if (!isNaN(fis)) {
      sumFisico += fis <= 1 ? fis * 100 : fis;
      countFisico++;
    }

    const fin = parseFloat(p.avance_financiero);
    if (!isNaN(fin)) {
      sumFinanciero += fin <= 1 ? fin * 100 : fin;
      countFinanciero++;
    }
  }

  return {
    cantidad: count,
    totalPresupuesto,
    totalAcumulado,
    totalEjecucion2026,
    avgAvanceFisico: countFisico > 0 ? sumFisico / countFisico : 0,
    avgAvanceFinanciero: countFinanciero > 0 ? sumFinanciero / countFinanciero : 0
  };
};

// Calculate Registry KPIs
export const calculateRegistryKPIs = (registries) => {
  const count = registries.length;
  let totalPresupuesto = 0;
  let totalAvanceMonto = 0;
  let sumPorcentaje = 0;
  let countPorcentaje = 0;

  for (let i = 0; i < count; i++) {
    const r = registries[i];
    totalPresupuesto += r.presupuesto_vigente_2026_bs || 0;
    totalAvanceMonto += r.avance_ejecucion_monto_bs || 0;

    const pct = parseFloat(r.avance_ejecucion_porcentaje);
    if (!isNaN(pct)) {
      sumPorcentaje += pct <= 1 ? pct * 100 : pct;
      countPorcentaje++;
    }
  }

  return {
    cantidad: count,
    totalPresupuesto,
    totalAvanceMonto,
    avgAvancePorcentaje: countPorcentaje > 0 ? sumPorcentaje / countPorcentaje : 0
  };
};

// Get Department Distribution (Map Data) for Projects
export const getInversionProjectsDeptoDist = (projects) => {
  const dist = {};
  const len = projects.length;
  for (let i = 0; i < len; i++) {
    const p = projects[i];
    const depto = p.departamento_macro;
    if (depto && depto !== 'NACIONAL') {
      if (!dist[depto]) dist[depto] = { count: 0, total: 0 };
      dist[depto].count++;
      dist[depto].total += p.presupuesto_vigente_2026_bs || 0;
    }
  }
  return dist;
};

// Get Department Distribution (Map Data) for Registries
export const getInversionRegistriesDeptoDist = (registries) => {
  const dist = {};
  const len = registries.length;
  for (let i = 0; i < len; i++) {
    const r = registries[i];
    const depto = r.departamento;
    if (depto && depto !== 'NACIONAL') {
      if (!dist[depto]) dist[depto] = { count: 0, total: 0 };
      dist[depto].count++;
      dist[depto].total += r.presupuesto_vigente_2026_bs || 0;
    }
  }
  return dist;
};

// Get Municipalities ranked by budget in a department
export const getTopMunicipalities = (registries, selectedDepto = null) => {
  let list = registries;
  if (selectedDepto && selectedDepto !== 'NACIONAL') {
    list = list.filter(r => r.departamento === selectedDepto);
  }

  const munis = {};
  const len = list.length;
  for (let i = 0; i < len; i++) {
    const r = list[i];
    const m = r.municipio;
    if (m) {
      if (!munis[m]) munis[m] = { count: 0, total: 0 };
      munis[m].count++;
      munis[m].total += r.presupuesto_vigente_2026_bs || 0;
    }
  }

  return Object.entries(munis)
    .map(([municipio, data]) => ({ municipio, ...data }))
    .sort((a, b) => b.total - a.total);
};

// Get Sector distribution for Projects
export const getInversionProjectsSectorDist = (projects) => {
  const dist = {};
  const len = projects.length;
  for (let i = 0; i < len; i++) {
    const p = projects[i];
    const s = p.sector_economico || 'OTRO';
    if (!dist[s]) dist[s] = { count: 0, total: 0 };
    dist[s].count++;
    dist[s].total += p.presupuesto_vigente_2026_bs || 0;
  }

  return Object.entries(dist)
    .map(([sector, data]) => ({ sector, ...data }))
    .sort((a, b) => b.total - a.total);
};

// Get Sector distribution for Registries
export const getInversionRegistriesSectorDist = (registries) => {
  const dist = {};
  const len = registries.length;
  for (let i = 0; i < len; i++) {
    const r = registries[i];
    const s = r.sector_especifico || 'OTRO';
    if (!dist[s]) dist[s] = { count: 0, total: 0 };
    dist[s].count++;
    dist[s].total += r.presupuesto_vigente_2026_bs || 0;
  }

  return Object.entries(dist)
    .map(([sector, data]) => ({ sector, ...data }))
    .sort((a, b) => b.total - a.total);
};
