import { AggregatedProductDto } from 'src/types';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/badge/Badge';
import { formatCurrency } from '@/utils/formatting';
import { DataTable, Column } from '@/components/ui/DataTable';
import './ProductTable.css';

export type SortField = 'model' | 'brand' | 'category' | 'precioMinimo' | 'minCostPrice' | 'disponibilidad' | 'availability';
export type SortDirection = 'ASC' | 'DESC';

interface ProductTableProps {
  products: AggregatedProductDto[];
  isLoading: boolean;
  sortBy: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}

type SpecsRecord = Record<string, unknown>;

const getBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  switch (status) {
    case 'DISPONIBLE': return 'success';
    case 'BAJO_STOCK': return 'warning';
    case 'SIN_STOCK': return 'error';
    default: return 'neutral';
  }
};

const getBadgeText = (status: string): string => {
  switch (status) {
    case 'DISPONIBLE': return 'Disponible';
    case 'BAJO_STOCK': return 'Bajo Stock';
    case 'SIN_STOCK': return 'Agotado';
    default: return status || 'Desconocido';
  }
};

const formatSpecs = (specs: unknown): string => {
  // Si no hay especificaciones, no mostrar nada
  if (!specs) {
    return '';
  }

  let specsObject: unknown;

  // 1. Si es un string, intentar parsearlo como JSON
  if (typeof specs === 'string') {
    try {
      specsObject = JSON.parse(specs);
    } catch {
      // Si no es un JSON válido, podría ser un string simple.
      return specs;
    }
  } else {
    specsObject = specs;
  }

  // 2. Si después de parsear es un objeto (o un array), lo formateamos
  if (typeof specsObject === 'object' && specsObject !== null) {
    if (Object.keys(specsObject).length === 0) {
      return '';
    }

    return Object.entries(specsObject as SpecsRecord)
      .map(([key, value]) => {
        // No mostrar "proveedor" y limpiar la key
        if (key.toLowerCase() === 'proveedor') return null;
        const cleanKey = key.replace(/_/g, ' ');
        const displayValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
        return `${cleanKey}: ${displayValue}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  // 3. Si no es ni string ni objeto, no podemos procesarlo
  return 'No disponible';
};

/** Tabla compacta de productos. El orden se aplica en servidor. */
const ProductTable = ({
  products,
  isLoading,
  sortBy,
  direction,
  onSort,
}: ProductTableProps) => {
  const navigate = useNavigate();

  const columns: Column<AggregatedProductDto>[] = [
    { header: 'MPN', cell: (p) => <span className="product-table__mpn tabular-nums">{p.mpn}</span> },
    { header: 'Modelo', sortKey: 'model', cell: (p) => <span className="product-table__model">{p.model}</span> },
    { header: 'Marca', sortKey: 'brand', accessorKey: 'brand' },
    { header: 'Categoría', sortKey: 'category', cell: (p) => p.category || '—' },
    { header: 'Precio mínimo', sortKey: 'minCostPrice', numeric: true, cell: (p) => formatCurrency(p.minCostPrice) },
    {
      header: 'Disponible',
      sortKey: 'availability',
      align: 'center',
      cell: (p) => (
        <Badge variant={getBadgeVariant(p.availability)}>
          {getBadgeText(p.availability)}
        </Badge>
      ),
    },
    { header: 'Nº proveedores', numeric: true, cell: (p) => p.supplierCount },
    { header: 'Especificaciones', cell: (p) => <span className="product-table__specs">{formatSpecs(p.specifications)}</span> },
  ];

  return (
    <DataTable
      caption="Productos"
      columns={columns}
      data={products}
      isLoading={isLoading}
      loadingMessage="Cargando productos..."
      keyExtractor={(p) => p.id}
      onRowClick={(product) => navigate(`/product/${product.id}`)}
      sort={{ key: sortBy, direction: direction === 'ASC' ? 'ascending' : 'descending' }}
      onSortChange={(key) => onSort(key as SortField)}
    />
  );
};

export default ProductTable;
