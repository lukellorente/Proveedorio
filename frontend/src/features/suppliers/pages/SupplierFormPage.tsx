import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSupplierDetails, 
  createSupplier, 
  updateSupplier, 
  getSupplierMappings,
  createSupplierMapping,
  updateSupplierMapping,
  deleteSupplierMapping
} from '../services/supplierService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { SupplierRequestDto, SupplierMappingRequestDto } from 'src/types';
import { useFieldErrors } from 'src/hooks/useFieldErrors';
import { Field } from 'src/components/form/Field';
import { Checkbox } from 'src/components/form/Checkbox';
import { PasswordInput } from 'src/components/form/PasswordInput';
import { FormSection } from 'src/components/form/FormSection';
import { FormGrid } from 'src/components/form/FormGrid';
import { FormActions } from 'src/components/form/FormActions';
import { PageHeader } from 'src/components/ui/PageHeader';
import { Button } from 'src/components/ui/Button';
import { buttonClassName } from 'src/components/ui/buttonClassName';
import { Skeleton } from 'src/components/ui/Skeleton';
import { useEntityName } from 'src/components/layout/usePageMeta';
import { MappingEditor, type EditableMapping } from '../components/MappingEditor';

type SupplierField = 'name' | 'baseUrlApi' | 'contact' | 'email' | 'schedule' | 'catalogEndpoint' | 'detailEndpoint' | 'searchEndpoint';

interface TextFieldDef {
  name: SupplierField;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}

/** Campos de texto del formulario, en orden de presentación. */
const GENERAL_FIELDS: TextFieldDef[] = [
  { name: 'name', label: 'Nombre', placeholder: 'Nombre del proveedor', required: true },
  { name: 'contact', label: 'Contacto', placeholder: 'Nombre de contacto' },
  { name: 'email', label: 'Email', placeholder: 'contacto@proveedor.com', type: 'email' },
  { name: 'schedule', label: 'Horario', placeholder: 'L-V 09:00-18:00' },
];

const API_FIELDS: TextFieldDef[] = [
  { name: 'baseUrlApi', label: 'API base URL', placeholder: 'https://api.supplier.com', required: true },
  { name: 'catalogEndpoint', label: 'Endpoint de catálogo', placeholder: '/catalog' },
  { name: 'detailEndpoint', label: 'Endpoint de detalle', placeholder: '/products/{id}' },
  { name: 'searchEndpoint', label: 'Endpoint de búsqueda', placeholder: '/search' },
];

/**
 * Página de formulario para crear o editar un proveedor y sus reglas de mapeo.
 * Coordina las llamadas al backend y muestra errores de validación en los campos.
 */
const SupplierFormPage = () => {
  type BackendError = { message?: string; errors?: Record<string, string> };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const supplierId = Number(id);

  const [formData, setFormData] = useState<SupplierRequestDto>({
    name: '',
    baseUrlApi: '',
    contact: '',
    email: '',
    schedule: '',
    apiKey: '',
    active: true,
    supportsBulkSync: true,
    catalogEndpoint: '',
    detailEndpoint: '',
    searchEndpoint: '',
  });

  const [mappings, setMappings] = useState<EditableMapping[]>([]);
  const [mappingsToDelete, setMappingsToDelete] = useState<number[]>([]);

  const { data: existingSupplier, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => getSupplierDetails(supplierId),
    enabled: isEditMode,
  });

  const { data: existingMappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ['supplierMappings', supplierId],
    queryFn: () => getSupplierMappings(supplierId),
    enabled: isEditMode,
  });

  const {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFieldErrors<SupplierField>();

  useEntityName(isEditMode ? existingSupplier?.name : undefined);

  useEffect(() => {
    if (isEditMode && existingSupplier) {
      setFormData({
        name: existingSupplier.name,
        baseUrlApi: existingSupplier.baseUrlApi,
        contact: existingSupplier.contact ?? '',
        email: existingSupplier.email ?? '',
        schedule: existingSupplier.schedule ?? '',
        apiKey: '', // API key is not sent back from server for security
        active: existingSupplier.active,
        supportsBulkSync: existingSupplier.supportsBulkSync,
        catalogEndpoint: existingSupplier.catalogEndpoint,
        detailEndpoint: existingSupplier.detailEndpoint,
        searchEndpoint: existingSupplier.searchEndpoint,
      });
    }
    if (isEditMode && existingMappings) {
      setMappings(existingMappings);
    }
  }, [isEditMode, existingSupplier, existingMappings]);

  const supplierUpdateMutation = useMutation({
    mutationFn: (data: { id: number, supplier: SupplierRequestDto }) => updateSupplier(data.id, data.supplier),
  });

  const supplierCreateMutation = useMutation({
    mutationFn: createSupplier,
  });
  
  const mappingCreateMutation = useMutation({
    mutationFn: (data: { supplierId: number, mapping: SupplierMappingRequestDto }) =>
      createSupplierMapping(data.supplierId, data.mapping),
  });

  const mappingUpdateMutation = useMutation({
    mutationFn: (data: { mappingId: number, mapping: SupplierMappingRequestDto }) =>
      updateSupplierMapping(data.mappingId, data.mapping),
  });

  const mappingDeleteMutation = useMutation({
    mutationFn: deleteSupplierMapping,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    clearFieldError(name as SupplierField);
  };

  const handleMappingChange = (index: number, field: keyof SupplierMappingRequestDto, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const handleAddMapping = () => {
    setMappings((prev) => ([
      ...prev,
      { internalField: '', externalField: '', transformationType: 'DIRECT' },
    ]));
  };

  const handleRemoveMapping = (index: number) => {
    const mappingToRemove = mappings[index];
    if (mappingToRemove.mappingId) {
      setMappingsToDelete(prev => [...prev, mappingToRemove.mappingId!]);
    }
    const newMappings = [...mappings];
    newMappings.splice(index, 1);
    setMappings(newMappings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      clearAllErrors();
      let currentSupplierId = supplierId;
      if (isEditMode) {
        await supplierUpdateMutation.mutateAsync({ id: supplierId, supplier: formData });
      } else {
        const newSupplier = await supplierCreateMutation.mutateAsync(formData);
        currentSupplierId = newSupplier.id;
      }

      const mappingPromises = [];

      // Deletions
      for (const mappingId of mappingsToDelete) {
        mappingPromises.push(mappingDeleteMutation.mutateAsync(mappingId));
      }

      // Creations and Updates
      for (const mapping of mappings) {
        const { ...mappingData } = mapping;
        if (mapping.mappingId) {
          // It's an update
          mappingPromises.push(
            mappingUpdateMutation.mutateAsync({
              mappingId: mapping.mappingId,
              mapping: mappingData as SupplierMappingRequestDto,
            }),
          );
        } else {
          // It's a creation
          mappingPromises.push(
            mappingCreateMutation.mutateAsync({
              supplierId: currentSupplierId,
              mapping: mappingData as SupplierMappingRequestDto,
            }),
          );
        }
      }

      await Promise.all(mappingPromises);

      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', currentSupplierId] });
      queryClient.invalidateQueries({ queryKey: ['supplierMappings', currentSupplierId] });

      toast.success(isEditMode ? 'Proveedor actualizado.' : 'Proveedor creado.');
      navigate(isEditMode ? `/suppliers/${currentSupplierId}` : '/suppliers');

    } catch (error) {
      const typedError = error as AxiosError<BackendError> & Error;
      const fieldErrors = typedError.response?.data?.errors;

      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setFieldError(field as SupplierField, String(message));
        });
      }
      toast.error(fieldErrors ? 'Revisa los campos marcados.' : 'No se pudo guardar el proveedor.');
      // Además dejamos rastro en consola para depuración.
      console.error('Failed to save supplier and mappings', typedError);
    }
  };

  const isProcessing = 
    supplierUpdateMutation.isPending || 
    supplierCreateMutation.isPending || 
    mappingCreateMutation.isPending ||
    mappingUpdateMutation.isPending ||
    mappingDeleteMutation.isPending;

  if ((isLoadingSupplier || isLoadingMappings) && isEditMode) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando formulario...</span>
        <Skeleton width="md" />
      </div>
    );
  }

  const textField = (field: TextFieldDef) => (
    <Field key={field.name} id={field.name} label={field.label} required={field.required} error={errors[field.name]}>
      {(control) => (
        <input
          {...control}
          name={field.name}
          type={field.type ?? 'text'}
          value={(formData[field.name] as string | undefined) ?? ''}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}
    </Field>
  );

  const cancelTo = isEditMode ? `/suppliers/${id}` : '/suppliers';

  return (
    <>
      <PageHeader title={isEditMode ? 'Editar proveedor' : 'Nuevo proveedor'} />

      <form onSubmit={handleSubmit}>
        <FormSection title="Información general">
          <FormGrid>
            {GENERAL_FIELDS.map(textField)}
            <div className="form-grid__full">
              <Checkbox id="active" name="active" label="Proveedor activo" checked={formData.active} onChange={handleInputChange} />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Integración API">
          <FormGrid>
            {API_FIELDS.map(textField)}
            <Field id="apiKey" label="API key" hint={isEditMode ? 'Déjala en blanco para no modificarla.' : undefined}>
              {(control) => (
                <PasswordInput
                  {...control}
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
              )}
            </Field>
            <div className="form-grid__full">
              <Checkbox
                id="supportsBulkSync"
                name="supportsBulkSync"
                label="Soporta sincronización masiva"
                checked={formData.supportsBulkSync}
                onChange={handleInputChange}
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Mappings"
          description="Traducen los campos de la API del proveedor a los campos internos del sistema."
        >
          <MappingEditor
            mappings={mappings}
            onChange={handleMappingChange}
            onAdd={handleAddMapping}
            onRemove={handleRemoveMapping}
          />
        </FormSection>

        <FormActions>
          <Link to={cancelTo} className={buttonClassName('secondary')}>Cancelar</Link>
          <Button type="submit" loading={isProcessing}>
            {isProcessing ? 'Guardando...' : (isEditMode ? 'Guardar cambios' : 'Crear proveedor')}
          </Button>
        </FormActions>
      </form>
    </>
  );
};

export default SupplierFormPage;
