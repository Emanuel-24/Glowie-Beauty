import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import AdminModal from '@/features/admin/components/AdminModal'
import Button from '@/shared/components/ui/Button'
import { createOrder, updateOrder, deleteOrder } from '@/features/orders/services/orderService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { formatCOP, formatId } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import { useAuth } from '@/features/auth'

export default function OrdersTab({
  purchases = [],
  setPurchases,
  products = [],
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [localSearch, setLocalSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const orderRows = useMemo(
    () =>
      purchases.map((item, index) => ({
        id: item.id ?? `${item.invoice}-${index}`,
        rawId: item.id,
        number: String(index + 1).padStart(2, '0'),
        invoice: item.invoice || formatId(index + 1, 'FAC-'),
        date: item.date || 'Hoy',
        customer: item.customer || 'Cliente Glowe',
        total: formatCOP(item.total),
        totalValue: Number(item.total || 0),
        status: item.status || 'Pendiente',
        statusTone: item.statusTone || (item.status === 'Completada' ? 'success' : item.status === 'Anulada' ? 'danger' : 'warning'),
        items: item.items || [],
        shippingAddress: item.shippingAddress || 'No especificada',
      })),
    [purchases],
  )

  const handleCreateOrder = async () => {
    const generatedOrder = {
      userId: user?._id || user?.id || 'authenticated-user',
      invoice: `FAC-${Date.now()}`,
      customer: user?.name || 'Cliente nuevo',
      total: 85000,
      status: 'Pendiente',
      shippingAddress: 'Bogotá, Colombia',
      items: [
        {
          productId: products[0]?._id || products[0]?.id || 'demo-product',
          title: products[0]?.name || 'Glow Serum',
          quantity: 1,
          price: 85000,
        },
      ],
    }

    try {
      const result = await createOrder(generatedOrder)
      const savedOrder = result?.data ?? generatedOrder
      setPurchases?.((prev) => [
        {
          id: savedOrder.id ?? Date.now(),
          invoice: savedOrder.invoice || generatedOrder.invoice,
          date: new Date().toLocaleDateString('es-CO'),
          createdAt: new Date(),
          customer: savedOrder.customer || generatedOrder.customer,
          total: Number(savedOrder.total ?? generatedOrder.total),
          status: savedOrder.status || 'Pendiente',
          statusTone: savedOrder.status === 'Completada' ? 'success' : savedOrder.status === 'Anulada' ? 'danger' : 'warning',
        },
        ...prev,
      ])
      showToast('Compra creada', `Se registró la orden ${savedOrder.invoice || generatedOrder.invoice}.`, '🛍️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo crear la orden.', '❌')
    }
  }

  const togglePurchaseStatus = async (id) => {
    const target = purchases.find((item) => item.id === id)
    if (!target) return

    const nextStatus = target.status === 'Pendiente' ? 'Completada' : target.status === 'Completada' ? 'Anulada' : 'Pendiente'
    const result = await updateOrder(id, { status: nextStatus })

    if (result?.ok !== false) {
      setPurchases?.((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            status: nextStatus,
            statusTone: nextStatus === 'Completada' ? 'success' : nextStatus === 'Anulada' ? 'danger' : 'warning',
          }
        }),
      )
      showToast('Pedido actualizado', `El pedido quedó en ${nextStatus}.`, '✅')
    }
  }

  const handleDeletePurchase = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Anular esta compra y quitarla del panel?')) return
    }

    const result = await deleteOrder(id)
    if (result?.ok === false) return
    setPurchases?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Compra anulada', 'La compra fue eliminada del registro.', '🗑️')
  }

  const orderColumns = [
    {
      key: 'number',
      header: '#',
      className: 'w-16',
      render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span>,
    },
    {
      key: 'invoice',
      header: 'Factura',
      render: (row) => <span className="font-semibold text-glowe-dark">{row.invoice}</span>,
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (row) => <span className="text-sm text-glowe-muted">{row.date}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (row) => <span className="font-medium text-glowe-dark">{row.customer}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (row) => <span className="font-bold text-glowe-dark">{row.total}</span>,
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
          <ActionButton type="view" title="Ver detalle" onClick={() => setSelectedOrder(row)}>
            Ver detalle
          </ActionButton>
          <ActionButton type="edit" title="Cambiar estado" onClick={() => togglePurchaseStatus(row.rawId || row.id)}>
            Cambiar estado
          </ActionButton>
          <ActionButton type="delete" title="Anular" onClick={() => handleDeletePurchase(row.rawId || row.id)}>
            Anular
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
      Total: row.totalValue,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-compras', payload })
    } else {
      exportToPdf({ title: 'reporte-compras', moduleTitle: 'Compras', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Compras"
        rows={orderRows}
        columns={orderColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Crear compra"
        onPrimaryAction={handleCreateOrder}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      {/* Modal de Detalle de Orden */}
      <AdminModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Detalle de Pedido — ${selectedOrder?.invoice || ''}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-glowe-muted">Factura:</span>
                <span className="font-bold text-glowe-dark">{selectedOrder.invoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glowe-muted">Cliente:</span>
                <span className="font-semibold text-glowe-dark">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glowe-muted">Fecha:</span>
                <span>{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glowe-muted">Estado:</span>
                <StatusBadge label={selectedOrder.status} tone={selectedOrder.statusTone} />
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-base">
                <span>Total:</span>
                <span className="text-glowe-pink-accent">{selectedOrder.total}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="glass" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </>
  )
}
