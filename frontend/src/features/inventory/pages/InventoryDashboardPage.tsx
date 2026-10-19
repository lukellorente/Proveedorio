import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import { LayoutGrid, List, RotateCw, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { getProducts, searchProducts } from 'features/inventory/services/productService';
import ProductTable, { SortField, SortDirection } from 'features/inventory/components/ProductTable';
import ProductGrid from 'features/inventory/components/ProductGrid';
import { useInventoryView, type InventoryView } from 'features/inventory/hooks/useInventoryView';
import { useDebounce } from '../../../hooks/useDebounce';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { PageHeader } from 'components/ui/PageHeader';
import { Toolbar } from 'components/ui/Toolbar';
import { ViewToggle } from 'components/ui/ViewToggle';
import { Button } from 'components/ui/Button';
import { EmptyState } from 'components/ui/EmptyState';
import { Pagination } from 'components/ui/Pagination';
import { SearchInput } from 'components/form/SearchInput';

const PAGE_SIZE = 20;

const VIEW_OPTIONS = [
  { value: 'list' as const, label: 'Vista de tabla', icon: <List /> },
  { value: 'grid' as const, label: 'Vista de cuadrícula', icon: <LayoutGrid /> },
];

/** Opciones de orden para la cuadrícula, que no tiene cabeceras de columna. */
const GRID_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'model:ASC', label: 'Modelo (A–Z)' },
  { value: 'model:DESC', label: 'Modelo (Z–A)' },
  { value: 'minCostPrice:ASC', label: 'Precio: menor a mayor' },
  { value: 'minCostPrice:DESC', label: 'Precio: mayor a menor' },
  { value: 'brand:ASC', label: 'Marca (A–Z)' },
  { value: 'availability:ASC', label: 'Disponibilidad' },
];

const InventoryDashboardPage = () => {
  // La búsqueda global de la barra superior llega como ?q=
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [queryInput, setQueryInput] = useState(urlQuery);
  const [specsInput, setSpecsInput] = useState('');
  const [query, setQuery] = useState(urlQuery);
  const [specsFilter, setSpecsFilter] = useState('');

  const debouncedSpecsFilter = useDebounce(specsFilter, 300);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>('model');
  const [direction, setDirection] = useState<SortDirection>('ASC');
  const [view, setView] = useInventoryView();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setQueryInput(urlQuery);
    setQuery(urlQuery);
    setPage(0);
  }, [urlQuery]);

  // Fetch products via API based on query, sort, page AND specsFilter
  const { data: productsResponse, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['products', query, page, sortBy, direction, debouncedSpecsFilter],
    queryFn: () => {
      // If either the main query OR the specs filter has text, we MUST use the /search endpoint.
      if (query.trim() === '' && debouncedSpecsFilter.trim() === '') {
        return getProducts(page, PAGE_SIZE, sortBy, direction);
      } else {
        return searchProducts(query, page, PAGE_SIZE, sortBy, direction, undefined, debouncedSpecsFilter);
      }
    },
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  const productsFromApi = useMemo(() => productsResponse?.content ?? [], [productsResponse?.content]);
  const totalPages = productsResponse?.totalPages ?? 0;
  const totalElements = productsResponse?.totalElements ?? 0;
  const isDataLoading = isLoading || isFetching;

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(queryInput);
    setPage(0);
  };

  const handleSpecsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSpecsInput(e.target.value);
    setSpecsFilter(e.target.value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleSort = (newSortBy: SortField) => {
    if (sortBy === newSortBy) {
      setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setDirection('ASC');
    }
    setPage(0);
  };

  const handleGridSort = (value: string) => {
    const [field, dir] = value.split(':') as [SortField, SortDirection];
    setSortBy(field);
    setDirection(dir);
    setPage(0);
  };

  const subtitle = isLoading
    ? 'Cargando productos…'
    : totalElements === 0 ? 'Sin resultados' : `${totalElements.toLocaleString('es-ES')} productos`;

  // Cambio lista ↔ cuadrícula: entrada breve; con movimiento reducido, solo un fundido corto.
  const viewMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: [0.2, 0, 0, 1] as const } };

  const renderResults = () => {
    if (isError) {
      return (
        <EmptyState
          tone="error"
          title="Error al conectar con el servidor."
          description="No se pudieron cargar los productos."
          action={<Button variant="secondary" icon={<RotateCw />} onClick={() => refetch()}>Reintentar</Button>}
        />
      );
    }

    if (!isDataLoading && productsFromApi.length === 0) {
      return (
        <EmptyState
          icon={<SearchX />}
          title="No hay coincidencias"
          description="Intenta con otros términos de búsqueda o quita el filtro de especificaciones."
        />
      );
    }

    return view === 'grid'
      ? <ProductGrid products={productsFromApi} isLoading={isDataLoading} />
      : (
        <ProductTable
          products={productsFromApi}
          isLoading={isDataLoading}
          sortBy={sortBy}
          direction={direction}
          onSort={handleSort}
        />
      );
  };

  return (
    <>
      <PageHeader title="Inventario consolidado" description={subtitle} />

      <Toolbar
        end={(
          <>
            {view === 'grid' && (
              <label className="toolbar__label">
                Ordenar
                <select
                  className="toolbar__select"
                  value={`${sortBy}:${direction}`}
                  onChange={(e) => handleGridSort(e.target.value)}
                >
                  {!GRID_SORT_OPTIONS.some((o) => o.value === `${sortBy}:${direction}`) && (
                    <option value={`${sortBy}:${direction}`}>Personalizado</option>
                  )}
                  {GRID_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            )}
            <ViewToggle<InventoryView>
              label="Vista de productos"
              value={view}
              options={VIEW_OPTIONS}
              onChange={setView}
            />
          </>
        )}
      >
        <form className="toolbar__start" role="search" onSubmit={handleSearchSubmit}>
          <SearchInput
            id="inventory-search"
            label="Buscar por modelo, marca o MPN"
            placeholder="Buscar por modelo, marca, MPN..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            grow
          />
          <SearchInput
            id="inventory-specs"
            label="Filtrar por especificaciones"
            placeholder="Filtrar specs (ej: ram:8gb o rojo)"
            icon={<SlidersHorizontal />}
            value={specsInput}
            onChange={handleSpecsChange}
          />
          <Button type="submit" icon={<Search />}>Buscar</Button>
        </form>
      </Toolbar>

      <ErrorBoundary fallbackMessage="Error al cargar los productos." onRetry={refetch}>
        <motion.div key={view} {...viewMotion}>
          {renderResults()}
        </motion.div>
      </ErrorBoundary>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </>
  );
};

export default InventoryDashboardPage;
