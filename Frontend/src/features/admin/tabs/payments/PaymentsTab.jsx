import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { createPayment, cancelPayment } from '@/features/admin/services/paymentService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, formatId } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'

export default function PaymentsTab({
  payments = [],
  setPayments,
  purchases = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [localSearch, setLocalSearch] = useState('')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const paymentRows = useMemo(() => {
    const seqByOrderId = new Map(purchases.map((order, index) => [String(order.id ?? order._id ?? ''), index + 1]))
    return payments.map((item, index) => {
      const seq = seqByOrderId.get(String(item.orderId ?? '')) ?? index + 1
      return {
        id: item.id,
        orderLabel: formatId(seq, 'Orden #'),
        customer: item.customer || 'Cliente',
        method: item.method,
        amount: formatCOP(item.amount),
        amountValue: Number(item.amount || 0),
        status: item.status,
        statusTone: item.statusTone || (item.status === 'Anulado' ? 'danger' : 'success'),
        createdAt: item.createdAt,
      }
    })
  }, [payments, purchases])

  const handleRegisterPayment = async () => {
    if (!purchases.length) {
      showToast('Sin compras', 'Primero crea una orden para registrar un abono.', '⚠️')
      return
    }

    const order = purchases[0]
    const amount = Math.min(Number(order.total || 0), 50000)
    const result = await createPayment({
      orderId: order.id,
      amount,
      method: 'Transferencia',
      reference: `AB-${Date.now()}`,
      note: 'Abono registrado desde el panel administrativo',
    })

    const savedPayment = result?.payment ?? result
    if (!savedPayment) return

    setPayments?.((prev) => [
      {
        id: savedPayment.id ?? `pay-${Date.now()}`,
        orderId: savedPayment.orderId ?? order.id,
        customer: order.customer,
        amount: Number(savedPayment.amount ?? amount),
        method: savedPayment.method || 'Transferencia',
        status: savedPayment.status || 'Confirmado',
        statusTone: savedPayment.status === 'Anulado' ? 'danger' : 'success',
        createdAt: new Date().toLocaleDateString('es-CO'),
      },
      ...prev,
    ])

    showToast('Abono registrado', `Se registró ${formatCOP(Number(savedPayment.amount ?? amount))} a la orden ${order.invoice}.`, '✅')
  }

  const handleDeletePayment = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Anular este pago o abono registrado?')) return
    }

    const result = await cancelPayment(id)
    if (result?.ok === false) return
    setPayments?.((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Anulado', statusTone: 'danger' } : item)),
    )
    showToast('Pago anulado', 'El movimiento quedó marcado como anulado.', '🗑️')
  }

  const paymentColumns = [
    {
      key: 'orderLabel',
      header: 'Orden',
      render: (row) => <span className="font-semibold text-glowe-dark">{row.orderLabel}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (row) => <span className="text-sm text-glowe-dark">{row.customer}</span>,
    },
    {
      key: 'method',
      header: 'Método',
      render: (row) => <span className="text-sm text-glowe-muted">{row.method}</span>,
    },
    {
      key: 'amount',
      header: 'Abono',
      render: (row) => <span className="font-bold text-glowe-dark">{row.amount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (row) => <span className="text-sm text-glowe-muted">{row.createdAt}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <StatusBadge label={row.status} tone={row.statusTone} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="delete" title="Anular" onClick={() => handleDeletePayment(row.id)}>
            Anular
          </ActionButton>
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = paymentRows.map((row) => ({
      Orden: row.orderLabel,
      Cliente: row.customer,
      Metodo: row.method,
      Monto: row.amountValue,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-pagos', payload })
    } else {
      exportToPdf({ title: 'reporte-pagos', moduleTitle: 'Pagos y abonos', payload })
    }
  }

  return (
    <DataTable
      title="Pagos y abonos"
      rows={paymentRows}
      columns={paymentColumns}
      searchValue={currentSearch}
      onSearchChange={handleSearch}
      primaryActionLabel="+ Registrar abono"
      onPrimaryAction={handleRegisterPayment}
      onExportPdf={() => handleExport('pdf')}
      onExportExcel={() => handleExport('excel')}
    />
  )
}
