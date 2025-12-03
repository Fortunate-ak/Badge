// data-table.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Generic, minimal, unstyled data table.
 *
 * - No external libs
 * - Accepts a column schema and data rows
 * - Updates when props.data changes
 * - Exposes useful methods via ref (add/update/remove/get/sort)
 * - Uses semantic table HTML so styling with Tailwind is straightforward later
 */

/* ----------------------------- Types ----------------------------------- */

export type Column<T> = {
  /** unique key for column (used for sorting identification if needed) */
  key: string;
  /** header label (string or React node) */
  header: React.ReactNode;
  /**
   * accessor can be:
   * - a string key (property name of the row)
   * - a function that returns what should be displayed for the cell
   * If both accessor and cell are provided, `cell` has priority.
   */
  accessor?: keyof T | ((row: T) => React.ReactNode);
  /**
   * optional cell renderer: receives (value, row, rowIndex)
   * If provided it takes precedence over accessor.
   */
  cell?: (value: any, row: T, rowIndex: number) => React.ReactNode;
  /** optional width string (for future styling) */
  width?: string;
};

export type SortDirection = "asc" | "desc";

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[]; // rows (may be a state variable from parent)
  /**
   * How to compute a stable row key:
   * - if function: called with row => string|number
   * - if key: uses row[rowKey] as identifier
   * - if not provided: fallback to row index (less stable)
   */
  rowKey?: keyof T | ((row: T) => string | number);
  onRowClick?: (row: T, index: number) => void;
  /** optional: initial sort spec */
  initialSort?: { columnKey: string; direction: SortDirection };
  /** whether to show a simple selectable checkbox column */
  selectable?: boolean;
}

/** Methods exposed via ref */
export type DataTableHandle<T> = {
  getData: () => T[];
  setData: (next: T[]) => void;
  addRow: (row: T) => void;
  updateRow: (id: string | number, patch: Partial<T>) => boolean;
  removeRow: (id: string | number) => boolean;
  findRowIndex: (id: string | number) => number;
  sortBy: (columnKey: string, direction?: SortDirection) => void;
  refresh: () => void;
};

/* --------------------------- Component -------------------------------- */

function defaultGetRowId<T>(
  row: T,
  rowKey?: keyof T | ((r: T) => string | number),
  fallbackIndex?: number
): string | number {
  if (!rowKey) return fallbackIndex ?? Math.random();
  if (typeof rowKey === "function") return rowKey(row);
  // keyof T given
  const val = (row as any)[rowKey];
  // if undefined, fallback to index-like value
  return val !== undefined ? val : fallbackIndex ?? Math.random();
}

const DataTableInner = <T extends Record<string, any>>(
  props: DataTableProps<T>,
  ref: React.Ref<DataTableHandle<T>>
) => {
  const { columns, data, rowKey, onRowClick, initialSort, selectable } = props;

  // Local copy of data so table can be controlled OR semi-controlled
  const [localData, setLocalData] = useState<T[]>(data ?? []);
  // keep a ref to latest data (helps imperative methods avoid stale closures)
  const localDataRef = useRef<T[]>(localData);
  localDataRef.current = localData;

  // selection state if selectable enabled
  const [selectedMap, setSelectedMap] = useState<Record<string | number, boolean>>({});

  // sort state
  const [sortSpec, setSortSpec] = useState<{ key: string; dir: SortDirection } | null>(
    initialSort ? { key: initialSort.columnKey, dir: initialSort.direction } : null
  );

  // keep rowKey resolver in a ref for stable usage
  const rowKeyRef = useRef(rowKey);
  useEffect(() => {
    rowKeyRef.current = rowKey;
  }, [rowKey]);

  // When parent changes `data` prop, update local data
  useEffect(() => {
    setLocalData(data ?? []);
  }, [data]);

  // Expose imperative handle
  useImperativeHandle(
    ref,
    (): DataTableHandle<T> => ({
      getData: () => localDataRef.current,
      setData: (next: T[]) => {
        setLocalData(next);
      },
      addRow: (row: T) => {
        setLocalData((prev) => [...prev, row]);
      },
      updateRow: (id: string | number, patch: Partial<T>) => {
        const idx = (localDataRef.current || []).findIndex(
          (r, i) => defaultGetRowId(r, rowKeyRef.current, i) === id
        );
        if (idx === -1) return false;
        setLocalData((prev) => {
          const copy = prev.slice();
          copy[idx] = { ...copy[idx], ...patch };
          return copy;
        });
        return true;
      },
      removeRow: (id: string | number) => {
        const idx = (localDataRef.current || []).findIndex(
          (r, i) => defaultGetRowId(r, rowKeyRef.current, i) === id
        );
        if (idx === -1) return false;
        setLocalData((prev) => prev.filter((_, i) => i !== idx));
        // also remove selection
        setSelectedMap((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        return true;
      },
      findRowIndex: (id: string | number) =>
        (localDataRef.current || []).findIndex((r, i) => defaultGetRowId(r, rowKeyRef.current, i) === id),
      sortBy: (columnKey: string, direction: SortDirection = "asc") => {
        setSortSpec({ key: columnKey, dir: direction });
        // apply immediately
        setLocalData((prev) => sortData(prev, columns, columnKey, direction));
      },
      refresh: () => {
        // re-trigger render by replacing the same array (useful if mutated externally)
        setLocalData((prev) => prev.slice());
      },
    }),
    [columns]
  );

  // sorting helper
  function sortData(arr: T[], cols: Column<T>[], columnKey: string, dir: SortDirection) {
    const col = cols.find((c) => c.key === columnKey);
    if (!col) return arr.slice();
    const accessor = col.accessor;
    // shallow copy
    const copy = arr.slice();
    copy.sort((a: T, b: T) => {
      let va: any;
      let vb: any;
      if (col.cell) {
        // cell renderer may return nodes; fallback to string comparison
        va = col.cell(undefined, a, 0) as any;
        vb = col.cell(undefined, b, 0) as any;
      } else if (typeof accessor === "function") {
        va = accessor(a);
        vb = accessor(b);
      } else if (accessor) {
        va = (a as any)[accessor];
        vb = (b as any)[accessor];
      } else {
        va = (a as any)[columnKey];
        vb = (b as any)[columnKey];
      }

      // basic compare supporting numbers and strings. Undefined/ null go last.
      if (va == null && vb == null) return 0;
      if (va == null) return dir === "asc" ? 1 : -1;
      if (vb == null) return dir === "asc" ? -1 : 1;

      // numeric compare when possible
      const na = parseFloat(va);
      const nb = parseFloat(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return dir === "asc" ? na - nb : nb - na;
      }

      // fallback to string compare
      const sa = String(va);
      const sb = String(vb);
      return dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return copy;
  }

  // Memoize rendered rows for efficiency
  const renderedRows = useMemo(() => {
    return localData.map((row, rowIndex) => {
      const rid = defaultGetRowId(row, rowKeyRef.current, rowIndex);
      const cells = columns.map((col, colIndex) => {
        // Determine cell value
        let value: any;
        if (col.cell) {
          // if cell renderer provided, call it with value placeholder (value arg left undefined here)
          const accessorVal =
            typeof col.accessor === "function"
              ? (col.accessor as (r: T) => any)(row)
              : typeof col.accessor === "string"
              ? (row as any)[col.accessor]
              : undefined;
          value = col.cell(accessorVal, row, rowIndex);
        } else if (typeof col.accessor === "function") {
          value = col.accessor(row);
        } else if (col.accessor) {
          value = (row as any)[col.accessor];
        } else {
          // fallback: use the property with the same key as the column key
          value = (row as any)[col.key];
        }

        return (
          <td key={col.key} role="cell" className="whitespace-nowrap" data-col-key={col.key}>
            {/* raw value could be number/string or ReactNode */}
            {value as React.ReactNode}
          </td>
        );
      });

      // optional checkbox cell
      const checkboxCell = selectable ? (
        <td key="__select__" role="cell">
          <input
            type="checkbox"
            checked={!!selectedMap[rid]}
            onChange={(e) => {
              setSelectedMap((prev) => ({ ...prev, [rid]: e.target.checked }));
            }}
          />
        </td>
      ) : null;

      return (
        <tr
          key={String(rid)}
          data-row-key={String(rid)}
          onClick={(e) => {e.stopPropagation();onRowClick?.(row, rowIndex);}}
          role="row"
          className="*:p-2 border-b border-border *:first:pl-4 hover:bg-secondary/50"
        >
          {checkboxCell}
          {cells}
        </tr>
      );
    });
  }, [localData, columns, onRowClick, selectable, selectedMap]);

  // header render (with very basic clickable sort toggle)
  const headerRow = (
    <tr role="row" className="*:p-2 *:first:pl-4 border-b border-border *:whitespace-nowrap">
      {selectable && <th role="columnheader">{/* place for top checkbox if needed */}</th>}
      {columns.map((col) => {
        const isSorted = sortSpec?.key === col.key;
        const dir = isSorted ? sortSpec!.dir : undefined;
        return (
          <th
            key={col.key}
            role="columnheader"
            onClick={() => {
              // toggle sort: asc -> desc -> none
              if (!isSorted) {
                setSortSpec({ key: col.key, dir: "asc" });
                setLocalData((prev) => sortData(prev, columns, col.key, "asc"));
              } else if (dir === "asc") {
                setSortSpec({ key: col.key, dir: "desc" });
                setLocalData((prev) => sortData(prev, columns, col.key, "desc"));
              } else {
                setSortSpec(null);
                setLocalData((prev) => prev.slice()); // keep previous order (no stable restore)
              }
            }}
            style={col.width ? { width: col.width } : undefined}
          >
            <div className="text-left flex items-center">
              {col.header}
              <span className="mso text-xl text-muted">{isSorted ? (sortSpec!.dir === "asc" ? "arrow_drop_up" : "arrow_drop_down") : ""}</span>
            </div>
          </th>
        );
      })}
    </tr>
  );

  return (
    <div className="relative w-full max-w-full h-fit overflow-x-auto border border-border rounded-md">
      <table role="table" className="min-w-full">
        <thead className="bg-secondary">{headerRow}</thead>
        <tbody className="p-2">{renderedRows}</tbody>
      </table>
    </div>
  );
};

export const DataTable = forwardRef(DataTableInner) as <T extends Record<string, any>>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableHandle<T>> }
) => ReturnType<typeof DataTableInner>;

/* ------------------------- Example Usage --------------------------------

Below is an example of how to use this DataTable component. Paste it in a
component file to try it out.

import React, { useRef, useState } from "react";
import { DataTable, Column, DataTableHandle } from "./data-table";

type Person = { id: string; name: string; age: number; city?: string };

export default function Demo() {
  const [people, setPeople] = useState<Person[]>([
    { id: "a", name: "Alice", age: 28, city: "Harare" },
    { id: "b", name: "Bob", age: 34, city: "Bulawayo" },
  ]);

  const tableRef = useRef<DataTableHandle<Person> | null>(null);

  const columns: Column<Person>[] = [
    { key: "name", header: "Name", accessor: "name" },
    { key: "age", header: "Age", accessor: "age" },
    {
      key: "city",
      header: "City",
      accessor: (row) => row.city ?? "—",
    },
    // custom-rendered column:
    {
      key: "action",
      header: "Action",
      cell: (_value, row) => <button onClick={() => alert(`clicked ${row.name}`)}>Say hi</button>,
    },
  ];

  return (
    <div>
      <button
        onClick={() =>
          setPeople((p) => [
            ...p,
            { id: Math.random().toString(36).slice(2), name: "New", age: 20 },
          ])
        }
      >
        Add
      </button>

      <button
        onClick={() => {
          // call imperative method
          tableRef.current?.sortBy("age", "desc");
        }}
      >
        Sort by age desc
      </button>

      <DataTable
        ref={tableRef}
        columns={columns}
        data={people}
        rowKey="id"
        selectable
        onRowClick={(row) => console.log("row clicked", row)}
      />
    </div>
  );
}

-------------------------------------------------------------------------- */

