import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, Select, useConfirm } from '@/shared/components/ui'
import { updateUser, deleteUser } from '@/features/admin/services/userService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { useToast } from '@/shared/toast'
import CreateUserModal from './CreateUserModal'

const availableRoles = [
  { value: 'admin', label: 'Admin (Administrador)' },
  { value: 'editor', label: 'Colaborador / Ventas (Catálogo y Ofertas)' },
  { value: 'soporte', label: 'Soporte (Pedidos y Pagos)' },
  { value: 'user', label: 'Cliente (Usuario de tienda)' },
]

export default function UsersTab({
  users = [],
  setUsers,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [localSearch, setLocalSearch] = useState('')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false)
  const [selectedUserForRole, setSelectedUserForRole] = useState(null)
  const [targetRole, setTargetRole] = useState('user')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const userRows = useMemo(() => {
    return users.map((item, index) => {
      const isPrimaryAdmin =
        (item.email && item.email.toLowerCase() === 'admin@glowe.com') ||
        (item.role === 'Admin' && index === 0)

      const roleDisplay = item.role || 'Cliente'
      const roleTone =
        roleDisplay === 'Admin'
          ? 'info'
          : roleDisplay === 'Editor'
          ? 'accent'
          : roleDisplay === 'Soporte'
          ? 'warning'
          : 'neutral'

      return {
        id: item.id ?? item._id ?? `${item.email}-${index}`,
        rawId: item.id ?? item._id,
        number: String(index + 1).padStart(2, '0'),
        name: item.name || 'Usuario Glowe',
        email: item.email || '',
        role: roleDisplay,
        rawRole: item.rawRole || (roleDisplay === 'Admin' ? 'admin' : 'user'),
        roleTone,
        status: item.status || 'Activo',
        statusTone: item.status === 'Activo' ? 'success' : 'warning',
        isPrimaryAdmin,
        rawUser: item,
      }
    })
  }, [users])

  const handleUserCreated = (newUser) => {
    const roleLabelMap = { admin: 'Admin', editor: 'Editor', soporte: 'Soporte', user: 'Cliente' }
    setUsers?.((prev) => [
      {
        id: newUser.id ?? newUser._id ?? Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: roleLabelMap[newUser.role] || 'Cliente',
        rawRole: newUser.role || 'user',
        status: newUser.status || 'Activo',
        statusTone: 'success',
        createdAt: new Date(),
      },
      ...prev,
    ])
  }

  const openRoleModal = (row) => {
    if (row.isPrimaryAdmin) {
      showToast('Protección activa', 'El Administrador principal no puede ser modificado.', '🛡️')
      return
    }
    setSelectedUserForRole(row)
    setTargetRole(row.rawRole || 'user')
    setRoleModalOpen(true)
  }

  const handleSaveRole = async () => {
    if (!selectedUserForRole) return

    try {
      const roleLabelMap = { admin: 'Admin', editor: 'Editor', soporte: 'Soporte', user: 'Cliente' }
      const nextRoleLabel = roleLabelMap[targetRole] || 'Cliente'

      const result = await updateUser(selectedUserForRole.rawId, { role: targetRole })
      if (result?.ok !== false) {
        setUsers?.((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === selectedUserForRole.rawId
              ? { ...item, role: nextRoleLabel, rawRole: targetRole }
              : item,
          ),
        )
        showToast('Rol actualizado', `${selectedUserForRole.name} ahora tiene rol ${nextRoleLabel}.`, '✅')
      }
      setRoleModalOpen(false)
      setSelectedUserForRole(null)
    } catch (err) {
      showToast('Error', err.message || 'No se pudo actualizar el rol.', '❌')
    }
  }

  const handleDeleteUser = async (row) => {
    if (row.isPrimaryAdmin) {
      showToast('Acción bloqueada', 'El Administrador principal no puede ser eliminado de la base de datos.', '🛡️')
      return
    }

    const ok = await confirm({
      type: 'danger',
      title: '¿Eliminar usuario?',
      message: `¿Estás seguro de eliminar a ${row.name} (${row.email})? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar usuario',
      cancelText: 'Cancelar',
    })

    if (!ok) return

    try {
      const result = await deleteUser(row.rawId)
      if (result?.ok === false) return
      setUsers?.((prev) => prev.filter((item) => (item.id ?? item._id) !== row.rawId))
      showToast('Usuario eliminado', 'Se retiró el usuario del sistema.', '🗑️')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo eliminar el usuario.', '❌')
    }
  }

  const userColumns = [
    {
      key: 'number',
      header: '#',
      className: 'w-16',
      render: (row) => <span className="font-bold text-glowe-muted">{row.number}</span>,
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (row) => (
        <div>
          <p className="font-semibold text-glowe-dark">{row.name}</p>
          {row.isPrimaryAdmin && (
            <span className="inline-block rounded-full bg-pink-100 px-2 py-0.2 text-[9px] font-bold text-glowe-pink-accent">
              Root Admin
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-sm text-glowe-muted">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      render: (row) => <StatusBadge label={row.role} tone={row.roleTone} />,
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
            type="edit"
            title={row.isPrimaryAdmin ? 'El Administrador principal no puede ser modificado' : 'Cambiar rol'}
            disabled={row.isPrimaryAdmin}
            className={row.isPrimaryAdmin ? 'opacity-35 cursor-not-allowed' : ''}
            onClick={() => !row.isPrimaryAdmin && openRoleModal(row)}
          />

          <ActionButton
            type="delete"
            title={row.isPrimaryAdmin ? 'El Administrador principal no puede ser eliminado' : 'Eliminar usuario'}
            disabled={row.isPrimaryAdmin}
            className={row.isPrimaryAdmin ? 'opacity-35 cursor-not-allowed' : ''}
            onClick={() => !row.isPrimaryAdmin && handleDeleteUser(row)}
          />
        </div>
      ),
    },
  ]

  const handleExport = (type) => {
    const payload = userRows.map((row) => ({
      Nombre: row.name,
      Email: row.email,
      Rol: row.role,
      Estado: row.status,
    }))

    if (type === 'excel') {
      exportToExcel({ title: 'reporte-usuarios', payload })
    } else {
      exportToPdf({ title: 'reporte-usuarios', moduleTitle: 'Usuarios y Accesos', payload })
    }
  }

  return (
    <>
      <DataTable
        title="Gestión de Usuarios"
        rows={userRows}
        columns={userColumns}
        searchValue={currentSearch}
        onSearchChange={handleSearch}
        primaryActionLabel="+ Nuevo usuario"
        onPrimaryAction={() => setCreateUserModalOpen(true)}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        existingUsers={users}
        onUserCreated={handleUserCreated}
      />

      {/* Modal para asignación de rol dinámico */}
      <AdminModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Cambiar Rol — ${selectedUserForRole?.name || ''}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-glowe-muted">
            Selecciona el nuevo rol para <strong>{selectedUserForRole?.email}</strong>. Los permisos se actualizarán en tiempo real.
          </p>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Rol asignado
            </label>
            <Select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              options={availableRoles}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
            <Button variant="glass" onClick={() => setRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSaveRole}>
              Guardar rol
            </Button>
          </div>
        </div>
      </AdminModal>
    </>
  )
}
