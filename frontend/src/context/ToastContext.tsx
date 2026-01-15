import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/* --- TYPES --- */

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'custom';

export interface ToastOptions {
  duration?: number; // ms, default 4000
  icon?: string; // custom mso icon name
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number; // 0 to 100
}

// Internal Toast Interface
interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
  message: string;
  visible: boolean; // For exit animation control
  resolve?: (value: boolean) => void; // For confirm dialogs
  isConfirm?: boolean;
}

interface ToastContextType {
  // Basic Notifications
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  
  // Advanced
  update: (id: string, updates: Partial<Toast>) => void;
  dismiss: (id: string) => void;
  
  // Async Confirmation
  confirm: (message: string, options?: { confirmText?: string; cancelText?: string; description?: string }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/* --- UTILS --- */

const generateId = () => Math.random().toString(36).substring(2, 9);

/* --- COMPONENT --- */

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Helper to remove toast from DOM after animation
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Trigger exit animation, then remove
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    // Wait for CSS transition (400ms) before hard removal
    setTimeout(() => removeToast(id), 400); 
  }, [removeToast]);

  const push = useCallback((type: ToastType, message: string, options: ToastOptions = {}) => {
    const id = generateId();
    const duration = options.duration ?? (type === 'loading' ? Infinity : 4000);

    const newToast: Toast = {
      id,
      type,
      message,
      visible: true,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration !== Infinity) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const update = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) => {
      // If we are updating a loading toast to success/error, handle auto-dismiss logic
      const target = prev.find(t => t.id === id);
      if (target && target.type === 'loading' && updates.type && updates.type !== 'loading') {
         // If it stops loading, set a timeout to dismiss it automatically if not specified
         setTimeout(() => dismiss(id), updates.duration || 4000);
      }
      return prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
    });
  }, [dismiss]);

  const confirm = useCallback((message: string, options: { confirmText?: string; cancelText?: string; description?: string } = {}) => {
    return new Promise<boolean>((resolve) => {
      const id = generateId();
      const newToast: Toast = {
        id,
        type: 'custom', // 'custom' rendering for confirm
        message,
        description: options.description,
        visible: true,
        duration: Infinity,
        isConfirm: true,
        resolve: (val) => {
          resolve(val);
          dismiss(id);
        },
        action: { // Hack to store button labels
          label: options.confirmText || 'Confirm', 
          onClick: () => {} // handled in UI
        }
      };
      setToasts((prev) => [...prev, newToast]);
    });
  }, [dismiss]);

  // Exposed API
  const api: ToastContextType = {
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, opts),
    info: (msg, opts) => push('info', msg, opts),
    loading: (msg, opts) => push('loading', msg, opts),
    update,
    dismiss,
    confirm,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      
      {/* Container: Mobile Top-Center / Desktop Bottom-Right */}
      <div className="toast-container fixed z-9999 pointer-events-none
        flex flex-col gap-2
        top-0 left-0 w-full p-4 items-center
        md:top-auto md:left-auto md:bottom-0 md:right-0 md:items-end md:p-6
      ">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* --- INDIVIDUAL TOAST ITEM UI --- */

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  // Icon Mapping
  const getIcon = () => {
    if (toast.icon) return toast.icon;
    switch (toast.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'loading': return 'progress_activity'; // Needs spinning animation class
      default: return 'notifications';
    }
  };

  // Color Mapping (Tailwind variables)
  const getColors = () => {
    switch (toast.type) {
      case 'success': return 'text-[var(--color-primary)]';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-orange-400';
      default: return 'text-[var(--color-foreground)]';
    }
  };

  return (
    <div 
      className={`
        toast-item-wrapper pointer-events-auto w-full max-w-sm
        ${toast.visible ? 'toast-enter' : 'toast-exit'}
      `}
    >
      <div className="
        relative overflow-hidden
        bg-secondary 
        border border-border
        shadow-lg shadow-black/20
        rounded-xl p-3
        flex flex-col gap-3
        backdrop-blur-md``
      ">
        
        {/* Main Row: Icon + Content + Close */}
        <div className="flex items-center gap-3 w-full">
          
          {/* Icon Area */}
          <div className={`
            shrink-0 mt-0.5
            size-8 flex items-center justify-center rounded-full bg-muted/5
            ${getColors()}
            ${toast.type === 'loading' ? 'animate-spin' : ''}
          `}>
             <span className="mso text-[24px]">{getIcon()}</span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {toast.message}
            </h4>
            {toast.description && (
              <p className="text-xs text-subtle-text mt-1 leading-relaxed">
                {toast.description}
              </p>
            )}
            
            {/* Optional Action Button (Non-confirm) */}
            {toast.action && !toast.isConfirm && (
               <button 
                onClick={toast.action.onClick}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close Button (if not loading/confirm) */}
          {!toast.isConfirm && (
            <button className="text-muted hover:text-foreground transition-colors">
              <span className="mso text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Progress Bar (Optional) */}
        {typeof toast.progress === 'number' && (
          <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${toast.progress}%` }}
            />
          </div>
        )}

        {/* Confirmation Buttons (Only for 'confirm' type) */}
        {toast.isConfirm && (
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.resolve?.(false)}
              className="px-3 py-1.5 text-xs font-medium text-subtle-text hover:bg-muted/10 rounded-md transition-colors"
            >
              {/* The second part of the hack, getting cancel text from description? 
                  Better to just standardise or access options. 
                  For simplicity, hardcoding Cancel or extracting. */}
               Cancel
            </button>
            <button
              onClick={() => toast.resolve?.(true)}
              className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-md hover:bg-white/90 transition-colors shadow-sm"
            >
              {toast.action?.label || 'Confirm'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

/* --- HOOK --- */

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};





/*

const MyTextComponent = () => {
  const toast = useToast();

  const handleSave = () => {
    // 1. Basic Success
    toast.success('Settings saved successfully');
  };

  const handleAsyncAction = async () => {
    // 2. Loading -> Update Pattern
    const toastId = toast.loading('Uploading file...', { 
      progress: 0, 
      description: 'Please wait' 
    });

    // Simulate progress
    setTimeout(() => toast.update(toastId, { progress: 50 }), 1000);
    
    setTimeout(() => {
      // 3. Update to Success
      toast.update(toastId, { 
        type: 'success', 
        message: 'Upload Complete', 
        description: 'File has been stored safely.',
        progress: 100,
        // It will auto-dismiss after 4s because we switched type from loading
      });
    }, 2000);
  };

  const handleDelete = async () => {
    // 4. Confirmation Pattern (Promise based)
    const confirmed = await toast.confirm('Delete this repository?', {
      description: 'This action cannot be undone.',
      confirmText: 'Yes, delete',
      cancelText: 'No, keep'
    });

    if (confirmed) {
      toast.success('Deleted!');
    } else {
      toast.info('Cancelled');
    }
  };

  return (
    <div className="flex gap-4 p-10">
      <button onClick={handleSave}>Notify</button>
      <button onClick={handleAsyncAction}>Upload</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

*/