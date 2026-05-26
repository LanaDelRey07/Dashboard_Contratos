import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MARGIN = 20;

const addHeader = (doc, title) => {
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setFillColor(184, 149, 44);
  doc.rect(0, 38, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Ministerio de Planificación del Desarrollo y Medio Ambiente', MARGIN, 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Viceministerio de Planificación y Coordinación', MARGIN, 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, 33);

  doc.setTextColor(0, 0, 0);
  return 46;
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(184, 149, 44);
    doc.rect(0, 287, 210, 3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${pageCount}`, 190, 293, { align: 'right' });
    doc.text('Tablero Gerencial - Financiamiento Externo | Documento de uso interno', MARGIN, 293);
  }
};

const fmt = (val) => {
  if (val === null || val === undefined || val === '' || val === 'n.a.') return '-';
  return String(val);
};

const fmtMoney = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
  if (isNaN(num)) return '-';
  return `USD ${num.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtPct = (val) => {
  if (!val || val === '' || val === 'n.a.') return '-';
  const num = parseFloat(String(val).replace(',', '.'));
  if (isNaN(num)) return '-';
  if (num <= 1) return `${(num * 100).toFixed(1)}%`;
  return `${num.toFixed(1)}%`;
};

export const exportResumenPDF = (depto, projects, kpis) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = addHeader(doc, `Resumen - ${depto || 'Todos los Contratos'}`);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Indicadores Clave', MARGIN, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Indicador', 'Valor']],
      body: [
        ['Inversión Total Contratada', fmtMoney(kpis.totalContratado)],
        ['Cantidad de Contratos', String(kpis.cantidadProyectos)],
        ['Desembolso Promedio', fmtPct(kpis.avgDesembolso / 100)],
        ...(kpis.avgAvanceFisico !== null ? [['Avance Físico Promedio', fmtPct(kpis.avgAvanceFisico / 100)]] : []),
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 }, 1: { cellWidth: 80 } },
    });
    y = doc.lastAutoTable.finalY + 10;

    const sectorDist = {};
    projects.forEach(p => {
      if (!sectorDist[p._sector]) sectorDist[p._sector] = { count: 0, total: 0 };
      sectorDist[p._sector].count++;
      const val = parseFloat(String(p['Monto Contratado (USD)']).replace(',', '.') || '0');
      sectorDist[p._sector].total += isNaN(val) ? 0 : val;
    });

    if (Object.keys(sectorDist).length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('Distribución por Sector', MARGIN, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [['Sector', 'Contratos', 'Inversión (USD)']],
        body: Object.entries(sectorDist)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([sector, data]) => [sector, String(data.count), fmtMoney(data.total)]),
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    const estadoDist = {};
    projects.forEach(p => {
      const estado = p['Estado del Crédito'] || 'Sin estado';
      if (!estadoDist[estado]) estadoDist[estado] = 0;
      estadoDist[estado]++;
    });

    if (Object.keys(estadoDist).length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('Distribución por Estado del Crédito', MARGIN, y);
      y += 4;

      const estadoColors = {
        'VIGENTE': [22, 163, 74],
        'EN ALP': [217, 119, 6],
        'EN GESTIÓN': [234, 88, 12],
        'EN CIERRE': [37, 99, 235],
      };

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [['Estado', 'Cantidad']],
        body: Object.entries(estadoDist).map(([estado, count]) => [estado, String(count)]),
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0 && estadoColors[data.cell.raw]) {
            data.cell.styles.fillColor = estadoColors[data.cell.raw];
            data.cell.styles.textColor = [255, 255, 255];
          }
        },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (y > 230) { doc.addPage(); y = 20; } else { y += 2; }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Lista de Contratos', MARGIN, y);
    y += 4;

    const projectRows = projects.map(p => [
      fmt(p['Nombre del Proyecto']).substring(0, 55),
      fmt(p['Organismo Financiador']),
      fmtMoney(p['Monto Contratado (USD)']),
      fmtPct(p['Porcentaje de Desembolso']),
      fmt(p['Estado del Crédito']),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Contrato', 'Organismo', 'Monto Contratado', 'Desembolso', 'Estado']],
      body: projectRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
      },
    });

    addFooter(doc);
    const fileName = depto ? `Resumen_${depto.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf` : `Resumen_Nacional_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generando PDF resumen:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

export const exportFichaPDF = (project) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const nombreContrato = project['Nombre del Proyecto'] || 'Sin nombre';
    let y = addHeader(doc, 'Ficha Técnica del Contrato');

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    const titleLines = doc.splitTextToSize(nombreContrato, 170);
    doc.text(titleLines, MARGIN, y);
    y += titleLines.length * 6 + 4;

    const goldLine = (startY) => {
      doc.setDrawColor(184, 149, 44);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, startY, 190, startY);
      return startY + 3;
    };

    const sectionTitle = (text, yPos) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text(text, MARGIN, yPos);
      return yPos + 2;
    };

    y = goldLine(y + 2);
    y = sectionTitle('DATOS GENERALES', y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      body: [
        ['Organismo Financiador', fmt(project['Organismo Financiador'])],
        ['Departamento', fmt(project['Departamento'])],
        ['Entidad Ejecutora', fmt(project['Entidad Ejecutora'])],
        ['Sector', fmt(project._sector)],
        ['SISFIN', fmt(project['SISFIN'])],
        ['Código SISIN', fmt(project['Código SISIN'])],
        ['Estado del Crédito', fmt(project['Estado del Crédito'])],
        ['N° de Contrato', fmt(project['N° de contrato'])],
        ['Repago', fmt(project['Repago'])],
      ],
      theme: 'grid',
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] }, 1: { cellWidth: 110 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (y > 210) { doc.addPage(); y = 20; }

    y = goldLine(y);
    y = sectionTitle('MONTOS', y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      body: [
        ['Monto Contratado (USD)', fmtMoney(project['Monto Contratado (USD)'])],
        ['Monto Desembolsado (USD)', fmtMoney(project['Monto Desembolsado (USD)'])],
        ['Monto por Desembolsar (USD)', fmtMoney(project['Monto por Desembolsar (USD)'])],
        ['Porcentaje de Desembolso', fmtPct(project['Porcentaje de Desembolso'])],
        ['Avance Físico', fmtPct(project['Porcentaje (%) de Avance Físico'])],
        ['Avance Financiero', fmtPct(project['Porcentaje (%) de Avance Financiero'])],
      ],
      theme: 'grid',
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] }, 1: { cellWidth: 110 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (y > 210) { doc.addPage(); y = 20; }

    y = goldLine(y);
    y = sectionTitle('DATOS LEGALES', y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      body: [
        ['N° de la Ley', fmt(project['N° de la Ley'])],
        ['Año de Aprobación de la Ley', fmt(project['Año de la aprobación de la Ley'])],
        ['Fecha de Suscripción', fmt(project['Fecha de Suscripción'])],
        ['Fecha de Último Desembolso', fmt(project['Fecha de último desembolso'])],
        ['Suscripción de Contrato', fmt(project['Suscripción de Contrato'])],
        ['Aprobación de la Ley', fmt(project['Aprobación de la Ley'])],
      ],
      theme: 'grid',
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] }, 1: { cellWidth: 110 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (y > 200) { doc.addPage(); y = 20; }

    y = goldLine(y);
    y = sectionTitle('GESTIÓN DEL CRÉDITO - PIPELINE', y);
    y += 2;

    const pipelineData = [
      ['Etapa Inicial (20%)', project['Etapa inicial (20%)'] === 'X' ? 'Completado' : 'Pendiente'],
      ['Coordinación con Organismo (40%)', project['Coordinación con el Organismo Financiador (40%)'] === 'X' ? 'Completado' : 'Pendiente'],
      ['DS y Suscripción de Contrato (60%)', project['Proceso de Decreto Supremo y Suscripción de contrato (60%)'] === 'X' ? 'Completado' : 'Pendiente'],
      ['Aprobación en la ALP (80%)', project['Aprobación en la Asamblea Legislativa Plurinacional (80%)'] === 'X' ? 'Completado' : 'Pendiente'],
      ['Puesta en Marcha (100%)', project['Puesta en marcha (100%)'] === 'X' ? 'Completado' : 'Pendiente'],
      ['Avance Referencial', fmtPct(project['Avance referencial de la Gestión del Crédito (%)'])],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      body: pipelineData,
      theme: 'grid',
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [245, 245, 245] }, 1: { cellWidth: 100 } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'Completado') {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'Pendiente') {
            data.cell.styles.textColor = [150, 150, 150];
          }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (project['Descripción (Situación actual)'] && project['Descripción (Situación actual)'] !== 'n.a.') {
      if (y > 185) { doc.addPage(); y = 20; }
      y = goldLine(y);
      y = sectionTitle('DESCRIPCIÓN - SITUACIÓN ACTUAL', y);
      y += 3;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const descLines = doc.splitTextToSize(project['Descripción (Situación actual)'], 170);

      const checkPageBreak = (currentY, neededHeight) => {
        if (currentY + neededHeight > 280) {
          doc.addPage();
          return 20;
        }
        return currentY;
      };

      let currentY = y;
      descLines.forEach((line) => {
        const lineH = 4.5;
        currentY = checkPageBreak(currentY, lineH);
        doc.text(line, MARGIN, currentY);
        currentY += lineH;
      });
      y = currentY + 6;
    }

    const situacion = project['Estado de situación (descripción)'];
    if (situacion && situacion.trim() !== '') {
      if (y > 185) { doc.addPage(); y = 20; }
      y = goldLine(y);
      y = sectionTitle('ESTADO DE SITUACIÓN', y);
      y += 3;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const situacionLines = doc.splitTextToSize(situacion, 170);

      let currentY = y;
      situacionLines.forEach((line) => {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, MARGIN, currentY);
        currentY += 4.5;
      });
    }

    addFooter(doc);
    const fileName = `Ficha_${nombreContrato.substring(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generando PDF ficha:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};