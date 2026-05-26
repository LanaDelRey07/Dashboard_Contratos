import rawData from '../data/PROYECTOS_SECTOR.json';

const flattenProjects = () => {
  const projects = [];
  Object.entries(rawData).forEach(([sector, list]) => {
    list.forEach((p, originalIndex) => {
      projects.push({
        ...p,
        _sector: sector,
        _originalIndex: originalIndex,
        _id: `${sector}-${originalIndex}`,
      });
    });
  });
  return projects;
};

export const allProjects = flattenProjects();

export const getAllSectors = () => {
  return Object.keys(rawData).sort();
};

export const getAllOrganisms = () => {
  const orgs = new Set(allProjects.map(p => p['Organismo Financiador']).filter(Boolean));
  return [...orgs].sort();
};

export const getUniqueEstados = () => {
  const estados = new Set(allProjects.map(p => p['Estado del Crédito']).filter(Boolean));
  return [...estados];
};

export const filterProjects = ({ searchTerm = '', selectedDepto = null, selectedSector = '', selectedEstados = [] }) => {
  let filtered = allProjects;

  if (searchTerm && searchTerm.trim().length > 0) {
    const raw = searchTerm.trim().slice(0, 100);
    const terms = raw.toLowerCase().split(/\s+/).filter(t => t.length > 0);

    if (terms.length > 0) {
      filtered = filtered.filter(p => {
        const fields = [
          String(p['Nombre del Proyecto'] || ''),
          String(p['SISFIN'] || ''),
          String(p['Código SISIN'] || ''),
          String(p['Organismo Financiador'] || ''),
          String(p['Entidad Ejecutora'] || ''),
          String(p['Departamento'] || ''),
          String(p['Estado del Crédito'] || ''),
          String(p._sector || ''),
          String(p['Nacional'] || ''),
        ].join(' ').toLowerCase();
        return terms.every(t => fields.includes(t));
      });
    }
  }

  if (selectedDepto) {
    if (selectedDepto === 'NACIONAL') {
      filtered = filtered.filter(p => p['Departamento'] === 'NACIONAL');
    } else {
      filtered = filtered.filter(p =>
        p['Departamento'] === selectedDepto ||
        (p['Departamento'] === 'NACIONAL' && p['Nacional'] && p['Nacional'].includes(selectedDepto))
      );
    }
  }

  if (selectedSector) {
    filtered = filtered.filter(p => p._sector === selectedSector);
  }

  if (selectedEstados.length > 0) {
    filtered = filtered.filter(p => selectedEstados.includes(p['Estado del Crédito']));
  }

  return filtered;
};

export const calculateKPIs = (projects) => {
  if (!projects || projects.length === 0) {
    return { totalContratado: 0, cantidadProyectos: 0, avgDesembolso: 0, avgAvanceFisico: null };
  }

  const totalContratado = projects.reduce((acc, p) => {
    const val = parseFloat(String(p['Monto Contratado (USD)'] || '0').replace(',', '.'));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const avgDesembolso = projects.length > 0
    ? projects.reduce((acc, p) => {
        const raw = p['Porcentaje de Desembolso'];
        const pct = parseFloat(String(raw == null ? '0' : raw).replace(',', '.') || '0');
        return acc + (isNaN(pct) ? 0 : pct > 1 ? pct / 100 : pct);
      }, 0) / projects.length * 100
    : 0;

  const avgAvanceFisico = (() => {
    const withAvance = projects.filter(p => {
      const v = p['Porcentaje (%) de Avance Físico'];
      return v !== null && v !== undefined && v !== '' && v !== 'n.a.';
    });
    if (withAvance.length === 0) return null;
    return withAvance.reduce((acc, p) => {
      const pct = parseFloat(String(p['Porcentaje (%) de Avance Físico']).replace(',', '.') || '0');
      return acc + (isNaN(pct) ? 0 : pct > 1 ? pct * 100 : pct);
    }, 0) / withAvance.length;
  })();

  return {
    totalContratado: isNaN(totalContratado) ? 0 : totalContratado,
    cantidadProyectos: projects.length,
    avgDesembolso: isNaN(avgDesembolso) ? 0 : avgDesembolso,
    avgAvanceFisico: avgAvanceFisico !== null && isNaN(avgAvanceFisico) ? null : avgAvanceFisico,
  };
};

export const getSectorDistribution = (projects) => {
  const dist = {};
  projects.forEach(p => {
    const sector = p._sector;
    if (!dist[sector]) dist[sector] = { count: 0, total: 0 };
    dist[sector].count++;
    const val = parseFloat(String(p['Monto Contratado (USD)']).replace(',', '.') || '0');
    dist[sector].total += isNaN(val) ? 0 : val;
  });
  return Object.entries(dist).map(([sector, data]) => ({
    sector,
    ...data,
  })).sort((a, b) => b.total - a.total);
};

export const getEstadoDistribution = (projects) => {
  const dist = {};
  projects.forEach(p => {
    const estado = p['Estado del Crédito'] || 'Sin estado';
    if (!dist[estado]) dist[estado] = 0;
    dist[estado]++;
  });
  return Object.entries(dist).map(([estado, count]) => ({ estado, count })).sort((a, b) => b.count - a.count);
};

export const getDeptoDistribution = () => {
  const dist = {};
  allProjects.forEach(p => {
    const depto = p['Departamento'];
    if (depto && depto !== 'NACIONAL') {
      if (!dist[depto]) dist[depto] = { count: 0, total: 0 };
      dist[depto].count++;
      const val = parseFloat(String(p['Monto Contratado (USD)']).replace(',', '.') || '0');
      dist[depto].total += isNaN(val) ? 0 : val;
    }
  });
  Object.entries(dist).forEach(([depto, data]) => {
    const nationalForDepto = allProjects.filter(p =>
      p['Departamento'] === 'NACIONAL' && p['Nacional'] && p['Nacional'].includes(depto)
    );
    nationalForDepto.forEach(p => {
      dist[depto].count++;
      const val = parseFloat(String(p['Monto Contratado (USD)']).replace(',', '.') || '0');
      dist[depto].total += isNaN(val) ? 0 : val;
    });
  });
  return dist;
};

export const getProjectsWithAlerts = (projects) => {
  return projects.filter(p => {
    const situacion = p['Estado de situación (descripción)'] || '';
    const lower = situacion.toLowerCase();
    return lower.includes('paralizada') || lower.includes('paralizado') ||
           lower.includes('desierta') || lower.includes('retraso') ||
           lower.includes('problema') || lower.includes('observación');
  });
};

export const getPipelineStatus = (project) => {
  const etapas = [
    { label: 'Etapa Inicial', pct: 20, key: 'Etapa inicial (20%)' },
    { label: 'Coordinación', pct: 40, key: 'Coordinación con el Organismo Financiador (40%)' },
    { label: 'DS y Contrato', pct: 60, key: 'Proceso de Decreto Supremo y Suscripción de contrato (60%)' },
    { label: 'Aprobación ALP', pct: 80, key: 'Aprobación en la Asamblea Legislativa Plurinacional (80%)' },
    { label: 'Puesta en marcha', pct: 100, key: 'Puesta en marcha (100%)' },
  ];

  let currentStep = 0;
  etapas.forEach((e, i) => {
    if (project[e.key] === 'X') currentStep = i;
  });

  const avanceRef = parseFloat(String(project['Avance referencial de la Gestión del Crédito (%)']).replace(',', '.') || '0');
  if (!isNaN(avanceRef) && avanceRef > 0) {
    currentStep = Math.max(currentStep, Math.floor(avanceRef * 5) - 1);
  }

  return etapas.map((e, i) => ({
    ...e,
    completed: i <= currentStep,
    current: i === currentStep,
  }));
};