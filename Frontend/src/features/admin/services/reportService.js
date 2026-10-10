/**
 * Servicio de exportación de reportes (PDF y Excel).
 * Aísla jspdf y xlsx mediante dynamic import() para excluir ~500 kB del bundle inicial de la app.
 */

export async function exportToExcel({ title, payload, sheetName = 'Reporte' }) {
  if (!Array.isArray(payload) || payload.length === 0) return

  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(payload)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${title}.xlsx`)
}

export async function exportToPdf({ title, moduleTitle = 'General', payload }) {
  if (!Array.isArray(payload) || payload.length === 0) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const paintHeader = () => {
    doc.setFillColor(250, 239, 245)
    doc.rect(0, 0, 595, 842, 'F')
    doc.setTextColor(40, 27, 39)
    doc.setFontSize(18)
    doc.text('Glowe Beauty - Reporte', 42, 52)
    doc.setFontSize(11)
    doc.text(`Módulo: ${moduleTitle}`, 42, 78)
  }

  paintHeader()
  let line = 110
  payload.forEach((item, index) => {
    const text = `${index + 1}. ${Object.values(item).join(' | ')}`
    const lines = doc.splitTextToSize(text, 500)
    if (line + lines.length * 24 > 800) {
      doc.addPage()
      paintHeader()
      line = 110
    }
    doc.text(lines, 42, line)
    line += lines.length * 24 + 6
  })

  doc.save(`${title}.pdf`)
}
