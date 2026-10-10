import { useEffect, useMemo, useState } from 'react'
import Button from '@/shared/components/ui/Button'
import Pagination from '@/shared/components/ui/Pagination'
import StatusBadge from './StatusBadge'

export default function DataTable({
  title,
  rows = [],
  columns = [],
  searchValue = '',
  onSearchChange,
  primaryActionLabel = '+ Crear nuevo',
  onPrimaryAction,
  onExportPdf,
  onExportExcel,
}) {
  const [page, setPage] = useState(1)
  const [reportMenuOpen, setReportMenuOpen] = useState(false)
  const pageSize = 6

  useEffect(() => {
    setPage(1)
  }, [searchValue])

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) => {
      const haystack = JSON.stringify(row).toLowerCase()
      return haystack.includes(query)
    })
  }, [rows, searchValue])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-glowe-pink-accent">Control de registro</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-glowe-dark">{title}</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex w-full min-w-0 items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-glowe-muted shadow-sm sm:w-auto">
            <span aria-hidden="true">⌕</span>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Buscar registro"
              aria-label="Buscar registro"
              className="min-w-0 flex-1 bg-transparent text-sm text-glowe-dark outline-none placeholder:text-glowe-muted sm:w-40"
            />
          </label>

          <div className="relative w-full sm:w-auto">
            <Button variant="glass" size="sm" fullWidth onClick={() => setReportMenuOpen((v) => !v)} className="sm:w-auto">
              Generar reporte
            </Button>
            {reportMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-1 shadow-xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    onExportPdf?.()
                    setReportMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-glowe-dark transition hover:bg-pink-50"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportExcel?.()
                    setReportMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-glowe-dark transition hover:bg-sky-50"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          <Button variant="gradient" size="sm" fullWidth onClick={onPrimaryAction} className="sm:w-auto">
            {primaryActionLabel}
          </Button>
        </div>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-white/60 bg-slate-50/90 text-[10px] uppercase tracking-[0.18em] text-glowe-muted">
              {columns.map((column) => (
                <th key={column.key} className={`pb-3 pr-4 font-semibold ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-sm text-glowe-muted">
                  No se encontraron registros con la búsqueda actual.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr key={row.id || `${row.name || title}-${index}`} className="border-b border-white/50 align-middle">
                  {columns.map((column) => (
                    <td key={`${row.id || index}-${column.key}`} className={`py-3 pr-4 ${column.cellClassName || ''}`}>
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 xl:hidden">
        {paginatedRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/80 px-4 py-6 text-sm text-glowe-muted">
            No se encontraron registros con la búsqueda actual.
          </p>
        ) : (
          paginatedRows.map((row, index) => (
            <article key={row.id || `${row.name || title}-${index}`} className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm">
              <dl className="space-y-3">
                {columns.map((column) => {
                  const isAction = column.key === 'actions'
                  const value = column.render ? column.render(row, index) : row[column.key]

                  return (
                    <div
                      key={`${row.id || index}-${column.key}`}
                      className={isAction ? 'border-t border-white/70 pt-3' : 'grid grid-cols-[minmax(5rem,0.8fr)_minmax(0,1.2fr)] items-start gap-3'}
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
                        {column.header}
                      </dt>
                      <dd className={isAction ? 'mt-2 flex flex-wrap gap-2' : 'min-w-0 break-words text-right text-sm text-glowe-dark'}>
                        {value}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </article>
          ))
        )}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      <div className="sr-only">
        <StatusBadge status="Activo" tone="success" />
      </div>
    </section>
  )
}

export { StatusBadge }
