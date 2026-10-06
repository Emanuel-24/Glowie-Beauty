import { useEffect, useState } from 'react'
import Button from './Button'

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  onChange,
  min = 1,
  max = 99,
  ariaLabel = 'Cantidad del producto',
}) {
  const [draftValue, setDraftValue] = useState(String(value))

  useEffect(() => {
    setDraftValue(String(value))
  }, [value])

  const normalizeValue = (rawValue) => {
    if (rawValue === '') return ''

    const parsed = Number(rawValue)
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return null

    const nextValue = Math.min(Math.max(Math.round(parsed), min), max)
    return nextValue
  }

  const handleInputChange = (event) => {
    const rawValue = event.target.value
    if (rawValue === '') {
      setDraftValue('')
      return
    }

    const nextValue = normalizeValue(rawValue)
    if (nextValue === null) return

    setDraftValue(String(nextValue))
    if (onChange) onChange(nextValue)
  }

  const handleBlur = () => {
    if (draftValue === '' || Number(draftValue) <= 0) {
      const safeValue = min
      setDraftValue(String(safeValue))
      if (onChange) onChange(safeValue)
      return
    }

    const nextValue = normalizeValue(draftValue)
    if (nextValue === null) {
      setDraftValue(String(value))
      return
    }

    setDraftValue(String(nextValue))
    if (onChange) onChange(nextValue)
  }

  const isMin = value <= min
  const isMax = value >= max

  return (
    <div role="group" aria-label={ariaLabel} className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
      <Button variant="glass" size="icon" onClick={onDecrease} disabled={isMin} aria-label="Quitar uno" className="h-11 w-11 rounded-full">
        −
      </Button>
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={draftValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        className="h-11 w-10 border-0 bg-transparent px-0 text-center text-xs font-bold text-glowe-dark outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button variant="glass" size="icon" onClick={onIncrease} disabled={isMax} aria-label="Agregar uno" className="h-11 w-11 rounded-full">
        +
      </Button>
    </div>
  )
}
