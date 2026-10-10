import { useState, useMemo } from 'react'
import DataTable from '@/features/admin/components/DataTable'
import ActionButton from '@/features/admin/components/ActionButton'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { createUser, updateUser, deleteUser } from '@/features/admin/services/userService'
import { exportToExcel, exportToPdf } from '@/features/admin/services/reportService'
import { useToast } from '@/shared/toast'

export default function UsersTab({
  users = [],
  setUsers,
  searchValue = '',
  onSearchChange,
}) {
  const { showToast } = useToast()
  const [localSearch, setLocalSearch] = useState('')

  const currentSearch = onSearchChange ? searchValue : localSearch
  const handleSearch = onSearchChange || setLocalSearch

  const userRows = useMemo(
    () =>
      users.map((item, index) => ({
        id: item.id ?? `${item.email}-${index}`,
        number: String(index + 1).padStart(2, '0'),
        name: item.name,
        email: item.email,
        role: item.role,
        roleTone: item.role === 'Admin' ? 'info' : 'neutral',
        status: item.status,
        statusTone: item.statusTone || 'success',
      })),
    [users],
  )

  const handleCreateUser = async () => {
    const generatedUser = {
      name: 'Nuevo usuario',
      email: `usuario${Date.now()}@glowe.com`,
      password: 'glowe2024',
      role: 'user',
      status: 'Activo',
    }

    try {
      const result = await createUser(generatedUser)
      const savedUser = result?.data ?? generatedUser
      setUsers?.((prev) => [
        {
          id: savedUser.id ?? Date.now(),
          name: savedUser.name || generatedUser.name,
          email: savedUser.email || generatedUser.email,
          role: savedUser.role === 'admin' ? 'Admin' : 'Cliente',
          status: savedUser.status || 'Activo',
          statusTone: 'success',
        },
        ...prev,
      ])
      showToast('Usuario creado', `Se registró ${savedUser.name}.`, '👤')
    } catch (err) {
      showToast('Error', err.message || 'No se pudo crear el usuario.', '❌')
    }
  }

  const toggleUserRole = async (id) => {
    const target = users.find((item) => item.id === id)
    if (!target) return

    const nextRole = target.role === 'Admin' ? 'Cliente' : 'Admin'
    const result = await updateUser(id, { role: nextRole === 'Admin' ? 'admin' : 'user' })

    if (result?.ok !== false) {
      setUsers?.((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, role: nextRole } : item,
        ),
      )
      showToast('Rol actualizado', `El usuario ahora es ${nextRole}.`, '✅')
    }
  }

  const toggleUserStatus = async (id) => {
    const target = users.find((item) => item.id === id)
    if (!target) return

    const nextStatus = target.status === 'Bloqueado' ? 'Activo' : 'Bloqueado'
    const result = await updateUser(id, { status: nextStatus })

    if (result?.ok !== false) {
      setUsers?.((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return { ...item, status: nextStatus, statusTone: nextStatus === 'Activo' ? 'success' : 'danger' }
        }),
      )
      showToast('Estado actualizado', `El usuario quedó ${nextStatus}.`, '✅')
    }
  }

  const handleDeleteUser = async (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('¿Eliminar este usuario y su acceso?')) return
    }

    const result = await deleteUser(id)
    if (result?.ok === false) return
    setUsers?.((prev) => prev.filter((item) => (item.id ?? item._id) !== id))
    showToast('Usuario eliminado', 'Se eliminó el acceso del usuario.', '🗑️')
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton type="edit" title="Editar rol" onClick={() => toggleUserRole(row.id)}>
            Editar rol
          </ActionButton>
          <ActionButton
            type="delete"
            title={row.status === 'Bloqueado' ? 'Activar' : 'Bloquear'}
            onClick={() => toggleUserStatus(row.id)}
          >
            {row.status === 'Bloqueado' ? 'Activar' : 'Bloquear'}
          </ActionButton>
          <ActionButton type="delete" title="Eliminar" onClick={() => handleDeleteUser(row.id)}>
            Eliminar
          </ActionButton>
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
      exportToPdf({ title: 'reporte-usuarios', moduleTitle: 'Usuarios', payload })
    }
  }

  return (
    <DataTable
      title="Usuarios"
      rows={userRows}
      columns={userColumns}
      searchValue={currentSearch}
      onSearchChange={handleSearch}
      primaryActionLabel="+ Crear usuario"
      onPrimaryAction={handleCreateUser}
      onExportPdf={() => handleExport('pdf')}
      onExportExcel={() => handleExport('excel')}
    />
  )
}
