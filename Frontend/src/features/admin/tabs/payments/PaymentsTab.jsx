import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { cancelPayment } from '@/features/admin/services/paymentService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, formatId } from '@/features/admin/constants'
import { useConfirm } from '@/shared/components/ui'
import { useToast } from '@/shared/toast'
import RegisterPaymentModal from './RegisterPaymentModal'

export default function PaymentsTab({
  payments = [],
  setPayments,
  purchases = [],
  setPurchases,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const paymentRows = useMemo(() => {
    const orderByOrderId = new Map(
      purchases.map((ord, idx) => [
        String(ord.id ?? ord._id ?? ''),
        {
          invoice: ord.invoice || formatId(idx + 1, 'FAC-'),
          customer: ord.customer || 'Cliente Glowe',
          total: Number(ord.totalValue ?? ord.total ?? 0),
          amountPaid: Number(ord.amountPaid || 0),
          balance: Math.max(0, Number(ord.totalValue ?? ord.total ?? 0) - Number(ord.amountPaid || 0)),
        },
      ]),
    )

    return payments.map((item, index) => {
      const orderData = orderByOrderId.get(String(item.orderId ?? ''))
      const invoiceLabel = item.invoice || orderData?.invoice || formatId(index + 1, 'FAC-')
      const customer = item.customer || orderData?.customer || 'Cliente'
      const remainingBalance = item.balance !== undefined ? Number(item.balance) : orderData?.balance ?? 0

      return {
        id: item.id ?? item._id ?? `pay-${index}`,
        orderId: item.orderId,
        invoice: invoiceLabel,
        customer,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Hoy',
        amount: formatCOP(item.amount),
        amountValue: Number(item.amount || 0),
        balance: formatCOP(remainingBalance),
        balanceValue: remainingBalance,
        method: item.method || 'Transferencia',
        reference: item.reference || '—',
        status: item.status || 'Confirmado',
        statusTone: item.statusTone || (item.status === 'Anulado' ? 'danger' : 'success'),
      }
    })
  }, [payments, purchases])

  const handlePaymentRegistered = ({ payment, orderId, abonoAmount }) => {
    setPayments?.((prev) => [payment, ...prev])

    // Actualizar de inmediato la orden asociada en purchases
    setPurchases?.((prev) =>
      prev.map((ord) => {
        if (String(ord.id ?? ord._id) !== String(orderId)) return ord
        const currentPaid = Number(ord.amountPaid || 0) + abonoAmount
        const total = Number(ord.totalValue ?? ord.total ?? 0)
        const balance = Math.max(0, total - currentPaid)
        const paymentStatus = balance <= 0 ? 'Pagada' : 'Abonada'
        return {
          ...ord,
          amountPaid: currentPaid,
          balance,
          paymentStatus,
        }
      }),
    )
  }

  const handleDeletePayment = async (id, orderId, amountValue) => {
    const ok = await confirm({
      type: 'danger',
      title: '¿Anular abono?',
      message: '¿Estás seguro de anular este abono registrado? Se recalculará el saldo pendiente de la venta.',
      confirmText: 'Sí, anular abono',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      const result = await cancelPayment(id)
      if (result?.ok === false) return

      setPayments?.((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'Anulado', statusTone: 'danger' } : item)),
      )

      if (orderId && amountValue) {
        setPurchases?.((prev) =>
          prev.map((ord) => {
            if (String(ord.id ?? ord._id) !== String(orderId)) return ord
            const currentPaid = Math.max(0, Number(ord.amountPaid || 0) - amountValue)
            const total = Number(ord.totalValue ?? ord.total ?? 0)
            const balance = Math.max(0, total - currentPaid)
            const paymentStatus = currentPaid <= 0 ? 'Sin pagos' : 'Abonada'
            return {
              ...ord,
              amountPaid: currentPaid,
              balance,
              paymentStatus,
            }
          }),
        )
      }

      showToast('Abono anulado', 'El movimiento fue marcado como anulado y se restauró el saldo.', '⚠️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo anular el abono.', '❌')
    }
  }

  const paymentColumns = [
    {
      key: 'invoice',
      header: 'ID Venta',
      render: (row) => <span className="font-mono font-bold text-glowe-dark">#{row.invoice}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (row) => <span className="font-semibold text-glowe-dark text-xs">{row.customer}</span>,
    },
    {
      key: 'date',
      header: 'Fecha Abono',
      render: (row) => <span className="text-xs text-glowe-muted">{row.date}</span>,
    },
    {
      key: 'amount',
      header: 'Monto Abonado',
      render: (row) => <span className="font-bold text-emerald-700 text-xs">{row.amount}</span>,
    },
    {
      key: 'balance',
      header: 'Saldo Restante',
      render: (row) => (
        <span
          className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
            row.balanceValue > 0
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-400 font-medium'
          }`}
        >
          {row.balanceValue > 0 ? row.balance : 'Al día'}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Método de Pago',
      render: (row) => <span className="text-xs text-glowe-dark font-medium">{row.method}</span>,
    },
    {
      key: 'reference',
      header: 'Comprobante',
      render: (row) => <span className="font-mono text-xs text-glowe-muted">{row.reference}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <StatusBadge label={row.status} tone={row.statusTone} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            type="ban"
            title="Anular abono"
            disabled={row.status === 'Anulado'}
            onClick={() => handleDeletePayment(row.id, row.orderId, row.amountValue)}
            className={row.status === 'Anulado' ? 'opacity-40 cursor-not-allowed' : ''}
          />
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = paymentRows.map((row) => ({
      'ID Venta': row.invoice,
      Cliente: row.customer,
      'Fecha Abono': row.date,
      'Monto Abonado': row.amountValue,
      'Saldo Restante': row.balanceValue,
      'Método de Pago': row.method,
      Comprobante: row.reference,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-pagos-abonos', payload })
    } else {
      exportToPdf({ title: 'reporte-pagos-abonos', moduleTitle: 'Pagos y Abonos', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Pagos y abonos"
        rows={paymentRows}
        columns={paymentColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Registrar abono"
        onPrimaryAction={() => setIsRegisterModalOpen(true)}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <RegisterPaymentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        purchases={purchases}
        onPaymentRegistered={handlePaymentRegistered}
      />
    </>
  )
}
