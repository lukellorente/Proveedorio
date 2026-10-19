import React, { KeyboardEvent, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import './DataTable.css';

export interface Column<T> {
    header: React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    /** Columna numérica: alineada a la derecha y con cifras tabulares. */
    numeric?: boolean;
    /** Columna principal que se queda con el espacio sobrante (p. ej. el nombre). */
    grow?: boolean;
    /** Valor por el que ordenar en cliente; si existe, la cabecera es ordenable. */
    sortValue?: (item: T) => string | number | null | undefined;
    /** Clave de orden en servidor; la cabecera es ordenable si la tabla recibe onSortChange. */
    sortKey?: string;
}

export type SortDirection = 'ascending' | 'descending';

export interface ControlledSort {
    key: string;
    direction: SortDirection;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    isError?: boolean;
    loadingMessage?: string;
    errorMessage?: string;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T, index: number) => string | number;
    /** Nombre accesible de la tabla. */
    caption?: string;
    /** Orden controlado desde fuera (p. ej. en servidor): estado actual y aviso al pulsar una cabecera. */
    sort?: ControlledSort;
    onSortChange?: (key: string) => void;
    /** Clase extra por fila, p. ej. data-table__row--muted para filas desactivadas. */
    rowClassName?: (item: T) => string | undefined;
}

type SortState = { index: number; direction: SortDirection } | null;

const SKELETON_ROWS = 6;

const compare = (a: string | number | null | undefined, b: string | number | null | undefined) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' });
};

/**
 * Tabla compacta genérica: cabecera fija, columnas ordenables,
 * y estados de carga, error y vacío. Las filas no se animan.
 */
export function DataTable<T>({
    columns,
    data,
    isLoading = false,
    isError = false,
    loadingMessage = 'Cargando datos...',
    errorMessage = 'Error al cargar los datos.',
    emptyMessage = 'No hay datos disponibles.',
    onRowClick,
    keyExtractor,
    caption,
    sort: controlledSort,
    onSortChange,
    rowClassName,
}: DataTableProps<T>) {
    const [sort, setSort] = useState<SortState>(null);
    const isControlled = Boolean(onSortChange);

    const rows = useMemo(() => {
        if (isControlled || !sort || !data) return data;
        const getValue = columns[sort.index]?.sortValue;
        if (!getValue) return data;
        const sorted = [...data].sort((a, b) => compare(getValue(a), getValue(b)));
        return sort.direction === 'descending' ? sorted.reverse() : sorted;
    }, [data, sort, columns, isControlled]);

    const toggleSort = (index: number) => {
        setSort((current) => {
            if (!current || current.index !== index) return { index, direction: 'ascending' };
            if (current.direction === 'ascending') return { index, direction: 'descending' };
            return null;
        });
    };

    const alignClass = (col: Column<T>) => {
        const align = col.numeric ? 'right' : col.align || 'left';
        return [`data-table__cell--${align}`, col.numeric ? 'tabular-nums' : '', col.grow ? 'data-table__cell--grow' : ''].filter(Boolean).join(' ');
    };

    const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: T) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRowClick?.(item);
        }
    };

    if (isError) {
        return (
            <div className="data-table__container">
                <EmptyState tone="error" title={errorMessage} />
            </div>
        );
    }

    if (!isLoading && (!data || data.length === 0)) {
        return (
            <div className="data-table__container">
                <EmptyState title={emptyMessage} />
            </div>
        );
    }

    return (
        <div className="data-table__container" aria-busy={isLoading || undefined}>
            <table className="data-table__table">
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead className="data-table__head">
                    <tr>
                        {columns.map((col, index) => {
                            const sortable = isControlled ? Boolean(col.sortKey) : Boolean(col.sortValue);
                            const direction = isControlled
                                ? (col.sortKey && controlledSort?.key === col.sortKey ? controlledSort.direction : undefined)
                                : (sort?.index === index ? sort.direction : undefined);
                            const SortIcon = direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown;
                            return (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`data-table__header ${alignClass(col)}`}
                                    aria-sort={sortable ? direction ?? 'none' : undefined}
                                >
                                    {sortable ? (
                                        <button type="button" className="data-table__sort" onClick={() => (isControlled && col.sortKey ? onSortChange?.(col.sortKey) : toggleSort(index))}>
                                            {col.header}
                                            <SortIcon
                                                className={direction ? 'data-table__sort-icon data-table__sort-icon--active' : 'data-table__sort-icon'}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    ) : (
                                        col.header
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {isLoading
                        ? Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                            <tr key={`skeleton-${rowIndex}`} className="data-table__row">
                                {columns.map((col, idx) => (
                                    <td key={idx} className={`data-table__cell ${alignClass(col)}`}>
                                        <Skeleton width={col.numeric ? 'md' : 'lg'} />
                                    </td>
                                ))}
                            </tr>
                        ))
                        : rows.map((item, rowIndex) => (
                            <tr
                                key={keyExtractor(item, rowIndex)}
                                className={['data-table__row', onRowClick ? 'data-table__row--clickable' : '', rowClassName?.(item) ?? ''].filter(Boolean).join(' ')}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                                onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, item) : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                            >
                                {columns.map((col, idx) => {
                                    let content: React.ReactNode = null;

                                    if (col.cell) {
                                        content = col.cell(item, rowIndex);
                                    } else if (col.accessorKey) {
                                        content = item[col.accessorKey] as React.ReactNode;
                                    }

                                    return <td key={idx} className={`data-table__cell ${alignClass(col)}`}>{content}</td>;
                                })}
                            </tr>
                        ))}
                </tbody>
            </table>
            {isLoading && <span className="sr-only" role="status">{loadingMessage}</span>}
        </div>
    );
}
