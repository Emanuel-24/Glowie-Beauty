import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { useConfirm } from '@/shared/components/ui'
import { updateOrder } from '@/features/orders/services/orderService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, formatId } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import OrderDetailModal from './OrderDetailModal'
import EditSaleModal from './EditSaleModal'
import RegisterPaymentModal from '@/features/admin/tabs/payments/RegisterPaymentModal'

const formatCustomerName = (fullName = '') => {
  if (!fullName) return 'Cliente'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

export default function OrdersTab({
  purchases = [],
  setPurchases,
  payments = [],
  setPayments,
  products = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingSaleOrder, setEditingSaleOrder] = useState(null)
  const [payingOrder, setPayingOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const salesPurchases = useMemo(
    () => purchases.filter((item) => (item.status || '') !== 'Pendiente'),
    [purchases],
  )

  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return salesPurchases
    return salesPurchases.filter((item) => (item.status || '').toLowerCase() === statusFilter.toLowerCase())
  }, [salesPurchases, statusFilter])

  const orderRows = useMemo(
    () =>
      filteredByStatus.map((item, index) => {
        const totalNum = Number(item.total || 0)
        const amountPaid = Number(item.amountPaid || 0)
        const balance = Math.max(0, totalNum - amountPaid)
        const shippingCost = Number(item.shippingCost ?? 0)

        return {
          id: item.id ?? item._id ?? `${item.invoice}-${index}`,
          rawId: item.id ?? item._id,
          number: String(index + 1).padStart(2, '0'),
          invoice: item.invoice || formatId(index + 1, 'FAC-'),
          date: item.date || 'Hoy',
          rawCustomer: item.customer || 'Cliente Glowe',
          customer: formatCustomerName(item.customer),
          customerPhone: item.customerPhone || '',
          customerEmail: item.customerEmail || '',
          customerCedula: item.customerCedula || '',
          customerCity: item.customerCity || '',
          customerDepartment: item.customerDepartment || '',
          notes: item.notes || '',
          shippingCost,
          shippingCostFormatted: shippingCost > 0 ? formatCOP(shippingCost) : 'Gratis',
          total: formatCOP(item.total),
          totalValue: totalNum,
          amountPaid,
          balance,
          balanceFormatted: formatCOP(balance),
          status: item.status || 'Confirmada',
          statusTone:
            item.status === 'Entregado' || item.status === 'Completada'
              ? 'success'
              : item.status === 'Anulada'
              ? 'danger'
              : 'info',
          items: Array.isArray(item.items) ? item.items : [],
          shippingAddress: item.shippingAddress || 'No especificada',
        }
      }),
    [filteredByStatus],
  )

  const handleAnularOrder = async (id) => {
    if (!id) return
    const target = purchases.find((item) => (item.id ?? item._id) === id)
    if (!target) return

    if (target.status === 'Anulada') {
      showToast('Venta ya anulada', 'Esta venta ya se encuentra en estado Anulada.', 'ℹ️')
      return
    }

    const ok = await confirm({
      type: 'danger',
      title: '¿Anular venta?',
      message: '¿Estás seguro de anular esta venta? Pasará a estado Anulada manteniendo su registro contable.',
      confirmText: 'Sí, anular venta',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      const result = await updateOrder(id, { status: 'Anulada' })
      if (result?.ok !== false) {
        setPurchases?.((prev) =>
          prev.map((item) => {
            if ((item.id ?? item._id) !== id) return item
            return { ...item, status: 'Anulada', statusTone: 'danger' }
          }),
        )
        showToast('Venta anulada', 'La venta pasó a estado Anulada.', '⚠️')
      }
    } catch (err) {
      showToast('Error', err.message || 'No se pudo anular la orden.', '❌')
    }
  }

  const orderColumns = [
    {
      key: 'number',
      header: '#',
      className: 'w-12',
      render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span>,
    },
    {
      key: 'invoice',
      header: 'Factura',
      render: (row) => <span className="font-mono font-bold text-glowe-dark">{row.invoice}</span>,
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (row) => <span className="text-xs text-glowe-muted">{row.date}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (row) => (
        <span className="font-semibold text-glowe-dark" title={row.rawCustomer}>
          {row.customer}
        </span>
      ),
    },
    {
      key: 'shippingCost',
      header: 'Envío',
      render: (row) => (
        <span className="text-xs font-semibold text-glowe-muted">
          {row.shippingCost > 0 ? row.shippingCostFormatted : 'Gratis'}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (row) => <span className="font-bold text-glowe-dark">{row.total}</span>,
    },
    {
      key: 'balance',
      header: 'Por pagar',
      render: (row) => (
        <span
          className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
            row.balance > 0
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-400 font-medium'
          }`}
        >
          {row.balance > 0 ? row.balanceFormatted : 'Al día'}
        </span>
      ),
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
          <ActionButton type="view" title="Ver detalle completo" onClick={() => setSelectedOrder(row)} />
          <ActionButton type="edit" title="Editar venta" onClick={() => setEditingSaleOrder(row)} />
          <ActionButton type="payment" title="Registrar abono" onClick={() => setPayingOrder(row)} />
          <ActionButton
            type="ban"
            title="Anular venta"
            onClick={() => handleAnularOrder(row.rawId || row.id)}
            disabled={row.status === 'Anulada'}
            className={row.status === 'Anulada' ? 'opacity-40 cursor-not-allowed' : ''}
          />
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = orderRows.map((r) => ({ Factura: r.invoice, Fecha: r.date, Cliente: r.rawCustomer, Envío: r.shippingCost, Total: r.totalValue, 'Por Pagar': r.balance, Estado: r.status }))
    if (type === 'excel') exportToExcel({ title: 'reporte-ventas', payload })
    else exportToPdf({ title: 'reporte-ventas', moduleTitle: 'Ventas y Facturación', payload })
  }

  const selectedOrderPayments = useMemo(() => {
    if (!selectedOrder) return []
    const targetId = String(selectedOrder.rawId || selectedOrder.id)
    return payments.filter((p) => String(p.orderId) === targetId)
  }, [selectedOrder, payments])

  const FILTER_BUTTONS = [
    { key: 'all', label: 'Todas las ventas' },
    { key: 'confirmada', label: 'Confirmadas' },
    { key: 'en camino', label: 'En camino' },
    { key: 'entregado', label: 'Entregados' },
    { key: 'anulada', label: 'Anuladas' },
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-glowe-muted mr-1">Filtrar:</span>
        {FILTER_BUTTONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab.key ? 'bg-glowe-dark text-white shadow-xs' : 'bg-white/70 text-glowe-muted hover:bg-white hover:text-glowe-dark border border-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        title="Ventas y Facturación"
        rows={orderRows}
        columns={orderColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        orderPayments={selectedOrderPayments}
      />

      <EditSaleModal
        isOpen={Boolean(editingSaleOrder)}
        onClose={() => setEditingSaleOrder(null)}
        order={editingSaleOrder}
        products={products}
        onSaveSuccess={(up) => {
          setPurchases?.((prev) => prev.map((it) => (it.id ?? it._id) === (up.rawId || up.id) ? { ...it, ...up } : it))
          setEditingSaleOrder(null)
        }}
      />

      <RegisterPaymentModal
        isOpen={Boolean(payingOrder)}
        onClose={() => setPayingOrder(null)}
        purchases={purchases}
        initialOrderId={payingOrder?.rawId || payingOrder?.id}
        onPaymentRegistered={({ payment, orderId, abonoAmount }) => {
          setPayments?.((prev) => [payment, ...prev])
          setPurchases?.((prev) => prev.map((ord) => {
            if (String(ord.id ?? ord._id) !== String(orderId)) return ord
            const currentPaid = Number(ord.amountPaid || 0) + abonoAmount
            const total = Number(ord.totalValue ?? ord.total ?? 0)
            const balance = Math.max(0, total - currentPaid)
            return { ...ord, amountPaid: currentPaid, balance, paymentStatus: balance <= 0 ? 'Pagada' : 'Abonada' }
          }))
        }}
      />
    </>
  )
}
