import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message) => addToast(message, 'info'), [addToast]);
  toast.success = useCallback((message) => addToast(message, 'success'), [addToast]);
  toast.error = useCallback((message) => addToast(message, 'error'), [addToast]);
  toast.info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ id, message, type, duration, onRemove }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onRemove(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <div className={`toast toast--${type}`}>
      <span>{message}</span>
      <button className="toast__close" onClick={() => onRemove(id)}>
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for pages that don't use the provider
    return Object.assign(
      (msg) => { /* noop */ },
      { success: () => {}, error: () => {}, info: () => {} }
    );
  }
  return ctx;
}

export default function Toast({ show, message, type = 'info', onClose }) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast--${type}`}>
        <span>{message}</span>
        {onClose && (
          <button className="toast__close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
