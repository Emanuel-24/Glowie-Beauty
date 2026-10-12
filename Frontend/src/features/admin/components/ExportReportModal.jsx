import { useState } from 'react'
import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react'
import AdminModal from './AdminModal'
import { Button, ButtonLoading, CustomDatePicker } from '@/shared/components/ui'

const PRESETS = [
  { id: 'thisMonth', label: 'Este mes' },
  { id: 'lastQuarter', label: 'Último trimestre' },
  { id: 'thisYear', label: 'Este año' },
  { id: 'all', label: 'Todo el histórico' },
]

const toISO = (date) => {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ExportReportModal({
  isOpen,
  onClose,
  onExport,
  title = 'Exportar reporte',
  subtitle = 'Descarga de datos',
  defaultStartDate = '',
  defaultEndDate = '',
  showFormatSelector = true,
  isExporting = false,
}) {
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [format, setFormat] = useState('pdf') // 'pdf' | 'excel'
  const [activePreset, setActivePreset] = useState('')

  const applyPreset = (presetId) => {
    setActivePreset(presetId)
    const now = new Date()

    if (presetId === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(toISO(start))
      setEndDate(toISO(end))
    } else if (presetId === 'lastQuarter') {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(toISO(start))
      setEndDate(toISO(end))
    } else if (presetId === 'thisYear') {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      setStartDate(toISO(start))
      setEndDate(toISO(end))
    } else if (presetId === 'all') {
      setStartDate('')
      setEndDate('')
    }
  }

  const handleExport = async (e) => {
    e?.preventDefault?.()
    if (onExport) {
      await onExport({
        startDate,
        endDate,
        format,
      })
    }
    onClose?.()
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleExport} className="space-y-5">
        {/* Atajos Rápidos de Rango */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
            Rangos rápidos sugeridos
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-glowe-pink-accent bg-glowe-pink/40 text-glowe-pink-accent shadow-xs'
                      : 'border-slate-200/80 bg-white/70 text-glowe-dark hover:border-glowe-pink/60 hover:bg-white'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fechas Desde / Hasta con CustomDatePicker */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha Desde
            </label>
            <CustomDatePicker
              value={startDate}
              onChange={(e) => {
                setStartDate(e.value)
                setActivePreset('')
              }}
              placeholder="Desde el inicio"
              maxDate={endDate || undefined}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Fecha Hasta
            </label>
            <CustomDatePicker
              value={endDate}
              onChange={(e) => {
                setEndDate(e.value)
                setActivePreset('')
              }}
              placeholder="Hasta hoy"
              minDate={startDate || undefined}
            />
          </div>
        </div>

        {/* Selector de Formato de Salida (PDF / Excel) */}
        {showFormatSelector && (
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-glowe-muted">
              Formato del documento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                  format === 'pdf'
                    ? 'border-rose-400 bg-rose-50/80 text-rose-600 shadow-sm'
                    : 'border-slate-200/80 bg-white/70 text-glowe-dark hover:bg-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documento PDF (.pdf)
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                  format === 'excel'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-sm'
                    : 'border-slate-200/80 bg-white/70 text-glowe-dark hover:bg-white'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Hoja de Cálculo (.xlsx)
              </button>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="glass"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <ButtonLoading
            variant="gradient"
            size="sm"
            type="submit"
            loading={isExporting}
            className="w-full sm:w-auto font-bold"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Descargar reporte
          </ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
