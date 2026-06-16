export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'USD 0';
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return 'USD 0';
  if (num >= 1_000_000_000) return `USD ${(num / 1_000_000_000).toFixed(2)} Mil millones`;
  if (num >= 1_000_000) return `USD ${(num / 1_000_000).toFixed(1)} M`;
  if (num >= 1_000) return `USD ${(num / 1_000).toFixed(1)} Mil`;
  return `USD ${num.toFixed(2)}`;
};

export const formatCurrencyFull = (value) => {
  if (value === null || value === undefined || value === '') return 'USD 0,00';
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return 'USD 0,00';
  return `USD ${num.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyTable = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return '-';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  return `$${num.toLocaleString('es-BO')}`;
};

export const parsePercentage = (value) => {
  if (!value || value === '' || value === 'n.a.') return null;
  const num = parseFloat(String(value).replace(',', '.'));
  if (isNaN(num)) return null;
  if (num <= 1) return num * 100;
  return num;
};

export const formatPercentage = (value) => {
  const pct = parsePercentage(value);
  if (pct === null) return '-';
  return `${pct.toFixed(1)}%`;
};

export const getEstadoColor = (estado) => {
  const colors = {
    'VIGENTE': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-300', dot: '#22c55e', bar: '#22c55e' },
    'EN ALP': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300', dot: '#f59e0b', bar: '#f59e0b' },
    'EN GESTIÓN': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-300', dot: '#f97316', bar: '#f97316' },
  };
  return colors[estado] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-300', dot: '#6b7280', bar: '#6b7280' };
};

export const getSectorColor = (sector) => {
  const colors = {
    'URBANISMO': '#3B82F6',
    'AGUA Y SANEAMIENTO': '#06B6D4',
    'AGROPECUARIO': '#22C55E',
    'MULTISECTORIAL': '#8B5CF6',
    'RIEGO': '#14B8A6',
    'ENERGÍA': '#F59E0B',
    'INFRAESTRUCTURA': '#EF4444',
    'GESTIÓN PÚBLICA': '#6366F1',
    'SALUD': '#EC4899',
    'TURISMO': '#F97316',
    'PROTECCIÓN SOCIAL': '#A855F7',
    'EDUCACIÓN': '#64748B',
    'RIESGOS': '#DC2626',
    'MINERIA': '#78716C',
  };
  return colors[sector] || '#6B7280';
};

export const DEPARTMENTS = [
  'LA PAZ', 'SANTA CRUZ', 'COCHABAMBA', 'ORURO',
  'POTOSÍ', 'CHUQUISACA', 'TARIJA', 'BENI', 'PANDO'
];

export const ESTADOS_CREDITO = ['VIGENTE', 'EN ALP', 'EN GESTIÓN'];

export const DPTO_DISPLAY_NAMES = {
  'LA PAZ': 'La Paz',
  'SANTA CRUZ': 'Santa Cruz',
  'COCHABAMBA': 'Cochabamba',
  'ORURO': 'Oruro',
  'POTOSÍ': 'Potosí',
  'CHUQUISACA': 'Chuquisaca',
  'TARIJA': 'Tarija',
  'BENI': 'Beni',
  'PANDO': 'Pando',
  'NACIONAL': 'Nacional',
};

export const formatCurrencyBs = (value) => {
  if (value === null || value === undefined || value === '') return 'Bs. 0,00';
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(num)) return 'Bs. 0,00';
  return `Bs. ${num.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatSubprojectPercent = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
  if (isNaN(num)) return '-';
  return `${(num * 100).toFixed(1)}%`;
};