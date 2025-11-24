import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ModalHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
};

type Props = {
  title?: string;
  initialOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string; // additional classes for the modal panel
  overlayClassName?: string; // additional classes for the overlay wrapper
  closeOnBackdrop?: boolean; // whether clicking backdrop closes
};

const MinimalModal = forwardRef<ModalHandle, Props>(
  (
    {
      title,
      initialOpen = false,
      onClose,
      children,
      className = "",
      overlayClassName = "",
      closeOnBackdrop = true,
    },
    ref
  ) => {
    const [open, setOpen] = useState<boolean>(initialOpen);

    // Expose imperative API via ref
    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen((v) => !v),
        isOpen: () => open,
      }),
      [open]
    );

    // Close on Escape
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          onClose?.();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
        role="dialog"
        aria-modal="true"
      >
        {/* backdrop */}
        <div
          className="fixed inset-0 bg-black/90"
          onClick={() => {
            if (closeOnBackdrop) {
              setOpen(false);
              onClose?.();
            }
          }}
        />

        {/* panel */}
        <div
          className={`relative transition-all max-w-lg w-full mx-4 p-4 md:p-6 bg-background border border-border/50 rounded-md shadow max-h-[90dvh] overflow-y-auto ${className}`}
          onClick={(e) => e.stopPropagation()} // prevent clicks inside from closing
        >
          {title && <div className="mb-2 text-xl font-bold">{title}</div>}

          <div>{children}</div>

          <button
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
            aria-label="Close modal"
            className="absolute top-3 right-3 tw-button-ghost"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }
);

MinimalModal.displayName = "MinimalModal";

export default MinimalModal;

/*
Usage (example):

import React, { useRef } from 'react'
import MinimalModal, { ModalHandle } from './MinimalModal'

const Example = () => {
  const ref = useRef<ModalHandle | null>(null)

  return (
    <>
      <button onClick={() => ref.current?.open()}>Open modal</button>

      <MinimalModal ref={ref} title="Hi" onClose={() => console.log('closed')}>
        <p>Modal content goes here</p>
      </MinimalModal>
    </>
  )
}
*/
