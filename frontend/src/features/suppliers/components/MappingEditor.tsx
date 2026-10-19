import { Plus, Trash2 } from 'lucide-react';
import { SupplierMappingRequestDto } from 'src/types';
import { Button } from 'components/ui/Button';
import './MappingEditor.css';

export type EditableMapping = Partial<SupplierMappingRequestDto> & { mappingId?: number };

const TRANSFORMATIONS: SupplierMappingRequestDto['transformationType'][] = ['DIRECT', 'NESTED', 'FIND_IN_ARRAY', 'SPLIT'];

interface MappingEditorProps {
  mappings: EditableMapping[];
  onChange: (index: number, field: keyof SupplierMappingRequestDto, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/** Filas editables de mapeo campo interno ↔ campo externo del proveedor. */
export const MappingEditor = ({ mappings, onChange, onAdd, onRemove }: MappingEditorProps) => (
  <div className="mapping-editor">
    {mappings.length > 0 ? (
      <table className="mapping-editor__table">
        <thead>
          <tr>
            <th scope="col">Campo interno</th>
            <th scope="col">Campo externo</th>
            <th scope="col">Transformación</th>
            <th scope="col"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping, index) => (
            <tr key={mapping.mappingId ?? `new-${index}`}>
              <td>
                <input
                  className="mapping-editor__input"
                  value={mapping.internalField ?? ''}
                  onChange={(e) => onChange(index, 'internalField', e.target.value)}
                  placeholder="price"
                  aria-label={`Campo interno, fila ${index + 1}`}
                />
              </td>
              <td>
                <input
                  className="mapping-editor__input"
                  value={mapping.externalField ?? ''}
                  onChange={(e) => onChange(index, 'externalField', e.target.value)}
                  placeholder="commercial.price_data.amount"
                  aria-label={`Campo externo, fila ${index + 1}`}
                />
              </td>
              <td>
                <select
                  className="mapping-editor__input"
                  value={mapping.transformationType ?? 'DIRECT'}
                  onChange={(e) => onChange(index, 'transformationType', e.target.value)}
                  aria-label={`Transformación, fila ${index + 1}`}
                >
                  {TRANSFORMATIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </td>
              <td className="mapping-editor__remove">
                <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} onClick={() => onRemove(index)}>
                  {`Eliminar mapping de la fila ${index + 1}`}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="mapping-editor__empty">No hay mappings definidos.</p>
    )}
    <Button variant="secondary" size="sm" icon={<Plus />} onClick={onAdd}>
      Añadir mapping
    </Button>
  </div>
);
