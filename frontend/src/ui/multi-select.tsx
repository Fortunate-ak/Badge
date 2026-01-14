import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

/**
 * MultiSelect.tsx
 * ----------------
 * A compact, reusable multi-select autocomplete component built with
 * React + TypeScript and Tailwind CSS. It supports keyboard navigation,
 * programmatic control via an imperative ref API, and deterministic
 * dropdown placement (above or below the input).
 *
 * Key features
 * - Controlled or uncontrolled selection (value / defaultValue)
 * - Autocomplete filtering (no custom values)
 * - Keyboard support: ArrowUp/Down, Enter, Escape, Backspace
 * - Programmatic API via ref (select, set, remove, clear, getSelected, focus, open, close)
 * - Stable dropdown positioning with `dropdownDirection` ("auto" | "top" | "bottom")
 * - `maxVisible` controls how many items are shown in the dropdown
 * - Accessible markup (role=combobox, listbox, option, aria-* attributes)
 *
 * Props
 * - options: Option[] (required) — option can be string or {label, value}
 * - value / defaultValue: string[] — selected values
 * - onChange: (values) => void
 * - placeholder, name, maxSelected, disabled, dark
 * - getLabel, getValue: mappers for option objects
 * - className, classNames: style overrides
 * - dropdownDirection: 'auto'|'top'|'bottom' (default 'auto')
 * - maxVisible: number (how many options to show, default 10)
 *
 * Notes on dropdown positioning
 * - Dropdown placement is computed from the input container's bounding rect
 *   and re-computed on open, resize, scroll, and when option measurements change.
 * - To avoid an initially oversized/incorrect placement on focus (before option
 *   heights are measured and before the user starts typing), the initial open
 *   dropdown uses a smaller preview size so it anchors close to the input.
 */

// ---------------------- Types ----------------------
export type Option = string | { label: string; value: string };

export interface ClassNames {
  container?: string;
  input?: string;
  chip?: string;
  chipRemove?: string;
  dropdown?: string;
  option?: string;
  optionActive?: string;
}

export interface MultiSelectProps {
  options: Option[]; // required
  value?: string[]; // controlled
  defaultValue?: string[]; // uncontrolled initial value
  onChange?: (values: string[]) => void;
  placeholder?: string;
  name?: string; // used to emit hidden inputs for forms
  maxSelected?: number; // default 10
  disabled?: boolean;
  dark?: boolean; // toggle base color scheme
  getLabel?: (opt: Option) => string; // optional mapper
  getValue?: (opt: Option) => string; // optional mapper
  className?: string; // top-level wrapper
  classNames?: ClassNames; // override internal element classes
  dropdownDirection?: "auto" | "top" | "bottom";
  maxVisible?: number;
}

export interface MultiSelectHandle {
  select: (values: string[]) => void;
  set: (values: string[]) => void;
  remove: (values: string[]) => void;
  clear: () => void;
  getSelected: () => string[];
  focus: () => void;
  open: () => void;
  close: () => void;
}

// ---------------------- Helpers ----------------------
const defaultGetLabel = (o: Option) => (typeof o === "string" ? o : o.label);
const defaultGetValue = (o: Option) => (typeof o === "string" ? o : o.value);

function normalizeOptions(options: Option[], getLabel: (o: Option) => string, getValue: (o: Option) => string) {
  return options.map((o) => ({ label: getLabel(o), value: getValue(o) }));
}

function highlightMatch(label: string, query: string) {
  if (!query) return [label];
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [label];
  const before = label.slice(0, idx);
  const match = label.slice(idx, idx + query.length);
  const after = label.slice(idx + query.length);
  return [before, match, after];
}

let idCounter = 0;
function useId(prefix = "ms") {
  const ref = useRef<number | null>(null);
  if (ref.current === null) ref.current = ++idCounter;
  return `${prefix}-${ref.current}`;
}

// ---------------------- Component ----------------------
const MultiSelect = React.forwardRef<MultiSelectHandle, MultiSelectProps>((props, ref) => {
  const {
    options,
    value,
    defaultValue = [],
    onChange,
    placeholder = "Select...",
    name,
    maxSelected = 10,
    disabled = false,
    dark = false,
    getLabel = defaultGetLabel,
    getValue = defaultGetValue,
    className = "",
    classNames = {},
    dropdownDirection = "auto",
    maxVisible = 10,
  } = props;

  const normalized = useMemo(() => normalizeOptions(options, getLabel, getValue), [options, getLabel, getValue]);

  const isControlled = Array.isArray(value);
  const [internalSelected, setInternalSelected] = useState<string[]>(() => (isControlled ? [] : defaultValue));
  const selected = isControlled ? (value as string[]) : internalSelected;

  useEffect(() => {
    if (!isControlled) return;
    setInternalSelected([]);
  }, [isControlled]);

  const emitChange = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalSelected(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId("ms-list");
  const comboboxId = useId("ms-cb");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized
      .filter((o) => !selected.includes(o.value))
      .filter((o) => (q ? o.label.toLowerCase().includes(q) : true));
  }, [normalized, query, selected]);

  useEffect(() => {
    setActiveIndex((i) => {
      const max = Math.max(0, Math.min(filtered.slice(0, maxVisible).length - 1, i));
      return max < 0 ? -1 : max;
    });
  }, [filtered, maxVisible]);

  const selectValue = useCallback(
    (val: string) => {
      if (selected.includes(val)) return;
      if (selected.length >= maxSelected) return;
      const next = [...selected, val];
      emitChange(next);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [selected, maxSelected, emitChange]
  );

  const removeValue = useCallback(
    (val: string) => {
      const next = selected.filter((v) => v !== val);
      emitChange(next);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [selected, emitChange]
  );

  // programmatic API handlers
  const handleProgrammaticSelect = useCallback(
    (vals: string[]) => {
      if (disabled) return;
      if (!Array.isArray(vals) || vals.length === 0) return;

      const valid = new Set(normalized.map((o) => o.value));
      const toAdd = vals.filter((v) => valid.has(v) && !selected.includes(v));
      if (toAdd.length === 0) return;

      const slots = Math.max(0, maxSelected - selected.length);
      const take = toAdd.slice(0, slots);
      if (take.length === 0) return;

      const next = [...selected, ...take];
      emitChange(next);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
    },
    [disabled, normalized, selected, maxSelected, emitChange]
  );

  const handleProgrammaticSet = useCallback(
    (vals: string[]) => {
      if (disabled) return;
      if (!Array.isArray(vals)) return;

      const valid = new Set(normalized.map((o) => o.value));
      const filteredVals = vals.filter((v) => valid.has(v));
      const unique = Array.from(new Set(filteredVals));
      const take = unique.slice(0, maxSelected);
      emitChange(take);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [disabled, normalized, maxSelected, emitChange]
  );

  const handleProgrammaticRemove = useCallback(
    (vals: string[]) => {
      if (!Array.isArray(vals) || vals.length === 0) return;
      const toRemove = new Set(vals);
      const next = selected.filter((v) => !toRemove.has(v));
      emitChange(next);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [selected, emitChange]
  );

  const handleClear = useCallback(() => {
    emitChange([]);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [emitChange]);

  const handleGetSelected = useCallback(() => selected, [selected]);
  const handleFocus = useCallback(() => inputRef.current?.focus(), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useImperativeHandle(
    ref,
    () => ({
      select: handleProgrammaticSelect,
      set: handleProgrammaticSet,
      remove: handleProgrammaticRemove,
      clear: handleClear,
      getSelected: handleGetSelected,
      focus: handleFocus,
      open: handleOpen,
      close: handleClose,
    }),
    [
      handleProgrammaticSelect,
      handleProgrammaticSet,
      handleProgrammaticRemove,
      handleClear,
      handleGetSelected,
      handleFocus,
      handleOpen,
      handleClose,
    ]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(-1, i - 1));
        break;
      case "Enter":
      case "Tab": {
        if (open && activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault();
          selectValue(filtered[activeIndex].value);
        }
        break;
      }
      case "Escape":
        setOpen(false);
        break;
      case "Backspace":
        if (!query && selected.length > 0) {
          removeValue(selected[selected.length - 1]);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!target) return;
      if (!containerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const baseContainer = dark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900";

  const defaults: Required<ClassNames> = {
    container: "border rounded-md flex flex-wrap items-center gap-2 tw-input",
    input: "flex-1 min-w-[120px] outline-none bg-transparent text-sm !border-0 text-foreground",
    chip: "flex items-center gap-2 px-2 py-1 rounded-lg text-xs bg-gray-100/5 text-foreground",
    chipRemove: "ml-1 cursor-pointer rounded-full hover:bg-gray-200/5 p-0.5 px-1.5 text-foreground",
    dropdown: "mt-1 w-fit max-h-80 overflow-auto border border-gray-200 rounded bg-secondary z-20 shadow-lg",
    option: "px-3 py-2 text-sm cursor-pointer hover:bg-gray-50/10 hover:text-foreground",
    optionActive: "bg-primary/50 text-white",
  };

  const mergedClassNames: Required<ClassNames> = {
    container: `${defaults.container} ${classNames.container ?? ""}`,
    input: `${defaults.input} ${classNames.input ?? ""}`,
    chip: `${defaults.chip} ${classNames.chip ?? ""}`,
    chipRemove: `${defaults.chipRemove} ${classNames.chipRemove ?? ""}`,
    dropdown: `${defaults.dropdown} ${classNames.dropdown ?? ""}`,
    option: `${defaults.option} ${classNames.option ?? ""}`,
    optionActive: `${defaults.optionActive} ${classNames.optionActive ?? ""}`,
  };

  const containerClasses = `${baseContainer} ${mergedClassNames.container} ${className}`;
  const dropdownClasses = dark
    ? mergedClassNames.dropdown //.replace("bg-white", "bg-gray-700").replace("border-gray-200", "border-gray-600")
    : mergedClassNames.dropdown;

  // Dropdown positioning
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | undefined>(undefined);
  const [openUp, setOpenUp] = useState(false);
  const optionHeightRef = useRef<number | null>(null);

  const computeAndSetDropdown = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // measured height for a single option (fallback used until measured)
    const estItemH = optionHeightRef.current ?? 40;

    // keep a sane upper bound on maxVisible used for pixel calculations
    const effectiveMaxVisible = Math.max(1, Math.min(maxVisible, 10));

    // To avoid a huge dropdown immediately on focus (before measurement & before typing),
    // show a smaller preview when query is empty. After typing/measuring we expand.
    const q = query.trim();
    const visibleCount = q === "" ? Math.min(5, effectiveMaxVisible, Math.max(1, filtered.length)) : Math.min(effectiveMaxVisible, Math.max(1, filtered.length));

    const desiredHeight = estItemH * visibleCount;
    const margin = 8;

    const spaceBelow = vh - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    // placement decision
    let placeUp = false;
    if (dropdownDirection === "top") placeUp = true;
    else if (dropdownDirection === "bottom") placeUp = false;
    else {
      const threshold = Math.min(desiredHeight, 120);
      if (spaceBelow >= threshold) placeUp = false;
      else if (spaceAbove >= threshold) placeUp = true;
      else placeUp = spaceAbove > spaceBelow;
    }

    // available space on chosen side
    const avail = placeUp ? spaceAbove : spaceBelow;
    // compute final height but clamp to reasonable max to avoid huge jumps
    let finalHeight = Math.min(desiredHeight, Math.max(40, avail));
    const maxClamp = Math.max(200, estItemH * Math.min(effectiveMaxVisible, 8));
    finalHeight = Math.min(finalHeight, maxClamp);

    // compute left and width so dropdown doesn't overflow viewport
    const left = Math.max(margin, rect.left);
    const maxWidth = vw - margin * 2 - left;
    const width = Math.min(rect.width, maxWidth);

    const top = placeUp ? Math.max(margin, rect.top - finalHeight - 6) : Math.min(vh - margin - 10, rect.bottom + 6);

    const style: React.CSSProperties = {
      position: "fixed",
      left,
      top,
      width,
      maxHeight: finalHeight,
      overflowY: "auto",
      zIndex: 9999,
    };

    setOpenUp(placeUp);
    setDropdownStyle(style);
  }, [filtered.length, dropdownDirection, maxVisible, query]);

  useEffect(() => {
    if (!open) {
      setDropdownStyle(undefined);
      return;
    }
    computeAndSetDropdown();
    const onChange = () => computeAndSetDropdown();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, computeAndSetDropdown]);

  const visibleOptions = filtered.slice(0, maxVisible);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        id={comboboxId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={listId}
        className={containerClasses + " bg-secondary! tw-input"}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {selected.map((val) => {
          const found = normalized.find((o) => o.value === val);
          const label = found ? found.label : val;
          return (
            <div key={val} className={mergedClassNames.chip} data-ms-chip>
              <span className="select-none">{label}</span>
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeValue(val);
                }}
                className={mergedClassNames.chipRemove}
              >
                ✕
              </button>
            </div>
          );
        })}

        <input
          ref={inputRef}
          className={mergedClassNames.input}
          placeholder={selected.length === 0 ? placeholder : "Search..."}
          value={query}
          disabled={disabled || selected.length >= maxSelected}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          // onFocus={() => setOpen(true)}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        />

        {name &&
          selected.map((val, idx) => (
            <input key={`hidden-${val}-${idx}`} type="hidden" name={name} value={val} />
          ))}
      </div>

      {open && visibleOptions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className={dropdownClasses}
          style={dropdownStyle}
          aria-label="Suggestions"
        >
          {visibleOptions.map((opt, idx) => {
            const isActive = idx === activeIndex;
            const optionId = `${listId}-opt-${idx}`;
            const parts = highlightMatch(opt.label, query);
            const refCb = (el: HTMLLIElement | null) => {
              if (el) {
                const h = el.getBoundingClientRect().height;
                if (!optionHeightRef.current || Math.abs((optionHeightRef.current ?? 0) - h) > 1) {
                  optionHeightRef.current = h;
                  computeAndSetDropdown();
                }
              }
            };

            return (
              <li
                ref={idx === 0 ? refCb : undefined}
                id={optionId}
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={`${mergedClassNames.option} ${isActive ? mergedClassNames.optionActive : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectValue(opt.value);
                }}
              >
                {parts.length === 1 ? (
                  <span>{parts[0]}</span>
                ) : (
                  <>
                    <span>{parts[0]}</span>
                    <strong className="font-semibold">{parts[1]}</strong>
                    <span>{parts[2]}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className={dropdownClasses + " px-3 py-2 text-sm text-gray-500"} style={dropdownStyle}>
          No results
        </div>
      )}
    </div>
  );
});

export default MultiSelect;
