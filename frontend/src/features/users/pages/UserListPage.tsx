import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getUsers, deleteUser } from '../services/userService';
import { roleLabel } from '../roles';
import { Badge } from '../../../components/badge/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { UserDto } from 'src/types';
import { PageHeader } from 'components/ui/PageHeader';
import { Button } from 'components/ui/Button';
import { buttonClassName } from 'components/ui/buttonClassName';
import { ConfirmDialog } from 'components/ui/ConfirmDialog';

const UserListPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUserToDelete(null);
    },
    onError: () => {
      toast.error('Error al eliminar el usuario');
      setUserToDelete(null);
    },
  });

  const columns: Column<UserDto>[] = [
    { header: 'Usuario', sortValue: (u) => u.username, cell: (u) => <strong>{u.username}</strong> },
    { header: 'Nombre completo', sortValue: (u) => u.fullName, cell: (u) => u.fullName || '—' },
    { header: 'Email', sortValue: (u) => u.email, accessorKey: 'email' },
    {
      header: 'Rol',
      sortValue: (u) => u.roles.join(','),
      cell: (u) => (
        <span className="data-table__actions">
          {u.roles.map((role) => (
            <Badge key={role} variant={role === 'ROLE_ADMIN' ? 'info' : 'neutral'}>{roleLabel(role)}</Badge>
          ))}
        </span>
      ),
    },
    {
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      cell: (u) => (
        <span className="data-table__actions">
          <Link
            to={`/users/edit/${u.id}`}
            className={buttonClassName('ghost', 'sm')}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Editar ${u.username}`}
          >
            <span className="button__icon" aria-hidden="true"><Pencil /></span>
            Editar
          </Link>
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            icon={<Trash2 />}
            onClick={(e) => { e.stopPropagation(); setUserToDelete(u); }}
          >
            {`Eliminar ${u.username}`}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={users ? `${users.length} usuarios` : undefined}
        actions={(
          <Link to="/users/new" className={buttonClassName('primary')}>
            <span className="button__icon" aria-hidden="true"><Plus /></span>
            Crear usuario
          </Link>
        )}
      />

      <ErrorBoundary
        fallbackMessage="Error al cargar la lista de usuarios. Asegúrese de que el servidor está en funcionamiento."
        onRetry={refetch}
      >
        <DataTable
          caption="Usuarios"
          columns={columns}
          data={users || []}
          isLoading={isLoading}
          isError={isError}
          loadingMessage="Cargando usuarios..."
          errorMessage="Error al cargar la lista de usuarios."
          emptyMessage="No hay usuarios registrados."
          keyExtractor={(u) => u.id}
          onRowClick={(u) => navigate(`/users/edit/${u.id}`)}
        />
      </ErrorBoundary>

      <ConfirmDialog
        open={userToDelete !== null}
        title={`¿Eliminar a ${userToDelete?.username ?? ''}?`}
        description="El usuario perderá el acceso de inmediato. Esta acción no se puede deshacer."
        confirmLabel="Eliminar usuario"
        danger
        loading={deleteUserMutation.isPending}
        onConfirm={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
        onCancel={() => setUserToDelete(null)}
      />
    </>
  );
};

export default UserListPage;
