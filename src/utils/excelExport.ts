import * as XLSX from 'xlsx'

/**
 * Exports tabular data as a genuine Microsoft Excel (.xlsx) file with auto-fitted column widths.
 *
 * @param headers Array of column header strings
 * @param rows 2D array of row data
 * @param filename File name (with or without .xlsx extension)
 * @param sheetName Name of the sheet inside the workbook (defaults to 'Data')
 */
export function exportToExcel(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  filename: string,
  sheetName = 'Data'
): void {
  const worksheetData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  // Calculate auto-fit column widths
  const colWidths = headers.map((header, colIndex) => {
    let maxLen = header.length
    for (const row of rows) {
      const cellVal = row[colIndex] != null ? String(row[colIndex]) : ''
      if (cellVal.length > maxLen) {
        maxLen = cellVal.length
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 60) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generate Excel XLSX binary and trigger download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
