import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDetails, createUser, updateUser } from '../services/userService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { UserRequestDto } from 'src/types';
import { useFieldErrors } from 'src/hooks/useFieldErrors';
import { Field } from 'src/components/form/Field';
import { PasswordInput } from 'src/components/form/PasswordInput';
import { RadioGroup, RadioOption } from 'src/components/form/RadioGroup';
import { FormSection } from 'src/components/form/FormSection';
import { FormGrid } from 'src/components/form/FormGrid';
import { FormActions } from 'src/components/form/FormActions';
import { PageHeader } from 'src/components/ui/PageHeader';
import { Button } from 'src/components/ui/Button';
import { buttonClassName } from 'src/components/ui/buttonClassName';
import { Skeleton } from 'src/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { ROLES, RoleId } from '../roles';

type UserField = 'username' | 'email' | 'fullName' | 'password';

const ROLE_OPTIONS: RadioOption<RoleId>[] = (Object.keys(ROLES) as RoleId[]).map((role) => ({
  value: role,
  label: ROLES[role].label,
  description: ROLES[role].description,
}));

type BackendError = { message?: string; errors?: Record<string, string> };

/**
 * Página de formulario para crear o editar usuarios.
 * Gestiona la carga inicial, el envío al backend y la visualización de errores de validación.
 */
const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<UserRequestDto>({
    id: undefined,
    username: '',
    email: '',
    fullName: '',
    password: '',
    roles: ['ROLE_CLIENTE'],
  });

  const {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFieldErrors<UserField>();

  const { data: existingUser, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserDetails(Number(id)),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingUser) {
      setFormData({
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        fullName: existingUser.fullName,
        password: '', // Password should not be pre-filled
        roles: existingUser.roles,
      });
    }
  }, [isEditMode, existingUser]);

  const mutation = useMutation({
    mutationFn: (user: UserRequestDto) => {
      // Clean up password field if it's empty
      const userData = { ...user };
      if (userData.password === '') {
        delete userData.password;
      }
      if (isEditMode) {
        return updateUser(Number(id), userData);
      } else {
        return createUser(userData);
      }
    },
    onSuccess: () => {
      clearAllErrors();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(isEditMode ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
      navigate('/users');
    },
    onError: (error) => {
      // Intentamos mapear errores de validación por campo si vienen del backend
      const typedError = error as AxiosError<BackendError> & Error;
      const fieldErrors = typedError.response?.data?.errors;

      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setFieldError(field as UserField, String(message));
        });
      } else {
        toast.error(`Error al guardar el usuario: ${typedError.response?.data?.message || typedError.message}`);
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name as UserField);
  };

  const handleRoleChange = (role: RoleId) => {
    setFormData((prev) => ({ ...prev, roles: [role] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      toast.error('Un usuario debe tener al menos un rol.');
      return;
    }
    mutation.mutate(formData);
  };

  if (isLoading && isEditMode) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando formulario...</span>
        <Skeleton width="md" />
      </div>
    );
  }

  const textField = (name: UserField, label: string, options: { type?: string; required?: boolean; autoComplete?: string } = {}) => (
    <Field id={name} label={label} required={options.required} error={errors[name]}>
      {(control) => (
        <input
          {...control}
          name={name}
          type={options.type ?? 'text'}
          value={formData[name] ?? ''}
          onChange={handleInputChange}
          required={options.required}
          autoComplete={options.autoComplete}
        />
      )}
    </Field>
  );

  return (
    <>
      <PageHeader title={isEditMode ? 'Editar usuario' : 'Nuevo usuario'} />

      <form onSubmit={handleSubmit}>
        <FormSection title="Información del usuario">
          <FormGrid>
            {textField('username', 'Usuario', { required: true, autoComplete: 'off' })}
            {textField('email', 'Email', { type: 'email', required: true, autoComplete: 'off' })}
            {textField('fullName', 'Nombre completo')}
            <Field
              id="password"
              label="Contraseña"
              required={!isEditMode}
              error={errors.password}
              hint={isEditMode ? 'Déjala en blanco para conservar la actual.' : undefined}
            >
              {(control) => (
                <PasswordInput
                  {...control}
                  name="password"
                  value={formData.password ?? ''}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  autoComplete="new-password"
                />
              )}
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Permisos">
          <RadioGroup<RoleId>
            name="user-role"
            legend="Rol"
            value={formData.roles[0] as RoleId | undefined}
            options={ROLE_OPTIONS}
            onChange={handleRoleChange}
          />
        </FormSection>

        <FormActions>
          <Link to="/users" className={buttonClassName('secondary')}>Cancelar</Link>
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : (isEditMode ? 'Guardar cambios' : 'Crear usuario')}
          </Button>
        </FormActions>
      </form>
    </>
  );
};

export default UserFormPage;
