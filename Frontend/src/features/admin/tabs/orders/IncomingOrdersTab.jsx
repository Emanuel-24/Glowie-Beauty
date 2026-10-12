import { useState, useMemo } from 'react'
import { MessageCircle, CheckCircle, Ban, Eye, Pencil } from 'lucide-react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import { useConfirm } from '@/shared/components/ui'
import { updateOrder } from '@/features/orders/services/orderService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, formatId } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import EditOrderModal from './EditOrderModal'
import IncomingOrderDetailModal from './IncomingOrderDetailModal'

const formatPaymentMethod = (method) => {
  const map = {
    contra_entrega: 'Contra entrega',
    abono: 'Abono / Crédito',
    transferencia_completa: 'Transferencia completa',
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    nequi: 'Nequi / Daviplata',
  }
  return map[method] || method || 'Por coordinar'
}

export default function IncomingOrdersTab({
  purchases = [],
  setPurchases,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const pendingPurchases = useMemo(
    () => purchases.filter((item) => (item.status || 'Pendiente') === 'Pendiente'),
    [purchases],
  )

  const orderRows = useMemo(
    () =>
      pendingPurchases.map((item, index) => ({
        id: item.id ?? item._id ?? `${item.invoice}-${index}`,
        rawId: item.id ?? item._id,
        number: String(index + 1).padStart(2, '0'),
        invoice: item.invoice || formatId(index + 1, 'FAC-'),
        date: item.date || 'Hoy',
        customer: item.customer || 'Cliente Glowe',
        customerPhone: item.customerPhone || '',
        customerEmail: item.customerEmail || '',
        customerCedula: item.customerCedula || '',
        customerCity: item.customerCity || '',
        customerDepartment: item.customerDepartment || '',
        shippingAddress: item.shippingAddress || 'No especificada',
        paymentMethod: formatPaymentMethod(item.paymentMethod),
        rawPaymentMethod: item.paymentMethod,
        notes: item.notes || '',
        shippingCost: Number(item.shippingCost ?? 0),
        shippingCostFormatted: formatCOP(Number(item.shippingCost ?? 0)),
        total: formatCOP(item.total),
        totalValue: Number(item.total || 0),
        status: 'Pendiente',
        items: Array.isArray(item.items) ? item.items : [],
      })),
    [pendingPurchases],
  )

  const handleConfirmOrder = async (id, invoice) => {
    if (!id) return
    const ok = await confirm({
      type: 'info',
      title: '¿Confirmar pedido?',
      message: `El pedido #${invoice} pasará a estado "Confirmada" y se transferirá al módulo de Ventas.`,
      confirmText: 'Sí, confirmar pedido',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    setActionLoadingId(id)
    try {
      const res = await updateOrder(id, { status: 'Confirmada' })
      if (res?.ok !== false) {
        setPurchases?.((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === id
              ? { ...item, status: 'Confirmada', statusTone: 'success' }
              : item,
          ),
        )
        showToast('Pedido confirmado', `La orden #${invoice} pasó a Ventas exitosamente.`, '✅')
        if (selectedOrder?.rawId === id) setSelectedOrder(null)
      }
    } catch (err) {
      showToast('Error', err.message || 'No se pudo confirmar el pedido.', '❌')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleAnularOrder = async (id, invoice) => {
    if (!id) return
    const ok = await confirm({
      type: 'danger',
      title: '¿Anular pedido?',
      message: `¿Estás seguro de anular el pedido #${invoice}? Se conservará el registro histórico como Anulada.`,
      confirmText: 'Sí, anular pedido',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    setActionLoadingId(id)
    try {
      const res = await updateOrder(id, { status: 'Anulada' })
      if (res?.ok !== false) {
        setPurchases?.((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === id
              ? { ...item, status: 'Anulada', statusTone: 'danger' }
              : item,
          ),
        )
        showToast('Pedido anulado', `La orden #${invoice} quedó en estado Anulada.`, '⚠️')
        if (selectedOrder?.rawId === id) setSelectedOrder(null)
      }
    } catch (err) {
      showToast('Error', err.message || 'No se pudo anular el pedido.', '❌')
    } finally {
      setActionLoadingId(null)
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
      header: 'Factura / Orden',
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
        <div>
          <p className="font-semibold text-glowe-dark">{row.customer}</p>
          {row.customerPhone && <p className="text-[11px] text-glowe-muted">{row.customerPhone}</p>}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Pago',
      render: (row) => <span className="text-xs text-glowe-dark font-medium">{row.paymentMethod}</span>,
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
      render: (row) => <span className="font-bold text-glowe-pink-accent">{row.total}</span>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton type="view" title="Ver detalle" onClick={() => setSelectedOrder(row)}>
            <Eye className="w-3.5 h-3.5" />
          </ActionButton>
          <ActionButton
            type="edit"
            title="Editar pedido"
            onClick={() => setEditingOrder(row)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </ActionButton>
          <ActionButton
            type="confirm"
            title="Confirmar pedido"
            disabled={actionLoadingId === row.rawId}
            onClick={() => handleConfirmOrder(row.rawId, row.invoice)}
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </ActionButton>
          <ActionButton
            type="ban"
            title="Anular pedido"
            disabled={actionLoadingId === row.rawId}
            onClick={() => handleAnularOrder(row.rawId, row.invoice)}
            className="text-rose-700 bg-rose-50 hover:bg-rose-100"
          >
            <Ban className="w-3.5 h-3.5" />
          </ActionButton>
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = orderRows.map((row) => ({
      Factura: row.invoice,
      Fecha: row.date,
      Cliente: row.customer,
      Teléfono: row.customerPhone,
      Pago: row.paymentMethod,
      Total: row.totalValue,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-pedidos-pendientes', payload })
    } else {
      exportToPdf({ title: 'reporte-pedidos-pendientes', moduleTitle: 'Pedidos Web Entrantes', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Pedidos Web Entrantes"
        rows={orderRows}
        columns={orderColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <IncomingOrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onConfirmOrder={handleConfirmOrder}
        isConfirming={actionLoadingId === selectedOrder?.rawId}
      />

      <EditOrderModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        onSaveSuccess={(updated) => {
          setPurchases?.((prev) =>
            prev.map((item) =>
              (item.id ?? item._id) === (updated.rawId || updated.id)
                ? { ...item, ...updated }
                : item,
            ),
          )
          setEditingOrder(null)
        }}
      />
    </>
  )
}
