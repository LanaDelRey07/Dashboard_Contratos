import rawPlurianual from '../data/inversion_publica_plurianual.json';

const normalizeDepto = (depto) => {
  if (!depto) return '';
  const d = depto.trim().toUpperCase();
  if (d === 'POTOSI') return 'POTOSÍ';
  return d;
};

export const allPlurianualInversions = rawPlurianual.map((p, idx) => ({
  ...p,
  _id: `ip-pluri-${idx}`,
  departamento: normalizeDepto(p.departamento),
}));

export const getPlurianualDataByDepto = (selectedDepto) => {
  let filtered = allPlurianualInversions;
  if (selectedDepto === 'NACIONAL') {
    filtered = filtered.filter(p => p.departamento === 'NACIONAL');
  } else if (selectedDepto) {
    filtered = filtered.filter(p => p.departamento === selectedDepto);
  }
  return filtered;
};

// Summarize projections for charts and KPIs
export const calculatePlurianualSummary = (data) => {
  let totalConsolidado = 0;
  let total2026 = 0;
  
  const years = ['2027', '2028', '2029', '2030', '2031', '2032', '2033', 'mayores_2034'];
  const projectionsSum = {
    '2026': 0,
    '2027': 0,
    '2028': 0,
    '2029': 0,
    '2030': 0,
    '2031': 0,
    '2032': 0,
    '2033': 0,
    'mayores_2034': 0,
  };

  const bySource = {};

  data.forEach(p => {
    totalConsolidado += p.total_consolidado_bs || 0;
    total2026 += p.vigente_2026_bs || 0;
    projectionsSum['2026'] += p.vigente_2026_bs || 0;

    const source = p.origen_recursos || 'Otros';
    if (!bySource[source]) {
      bySource[source] = { total: 0, '2026': 0 };
    }
    bySource[source].total += p.total_consolidado_bs || 0;
    bySource[source]['2026'] += p.vigente_2026_bs || 0;

    if (p.proyecciones) {
      years.forEach(yr => {
        projectionsSum[yr] += parseFloat(p.proyecciones[yr]) || 0;
      });
    }
  });

  return {
    totalConsolidado,
    total2026,
    projectionsSum,
    bySource,
  };
};

export const getPlurianualDeptoDist = () => {
  const dist = {};
  allPlurianualInversions.forEach(p => {
    const depto = p.departamento;
    if (depto && depto !== 'NACIONAL') {
      if (!dist[depto]) dist[depto] = { count: 0, total: 0 };
      dist[depto].count++;
      dist[depto].total += p.total_consolidado_bs || 0;
    }
  });
  return dist;
};
