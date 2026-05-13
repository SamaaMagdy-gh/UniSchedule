import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const COLORS = {
  success: { bg: '#f0faf0', border: '#b2e8b2', text: '#1a6e1a', icon: '#2d6a2d', bar: '#2d6a2d' },
  error:   { bg: '#fff5f5', border: '#ffc0c0', text: '#c0392b', icon: '#e53e3e', bar: '#e53e3e' },
  warning: { bg: '#fffbf0', border: '#ffe0a0', text: '#856404', icon: '#d4a017', bar: '#d4a017' },
  info:    { bg: '#f0f4ff', border: '#b8d0ff', text: '#1a3a7a', icon: '#3b82f6', bar: '#3b82f6' },
};

function ToastItem({ id, message, type = 'info', onRemove, duration = 4000 }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const colors = COLORS[type] || COLORS.info;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        dismiss();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration, dismiss]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '14px 16px', borderRadius: '12px',
        background: colors.bg, border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        color: colors.text, fontSize: '13px', fontWeight: '500',
        minWidth: '300px', maxWidth: '420px', position: 'relative',
        overflow: 'hidden', cursor: 'pointer',
        transform: exiting ? 'translateX(120%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        animation: exiting ? 'none' : 'toastSlideIn 0.35s cubic-bezier(0.21,1.02,0.73,1)',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
      onClick={dismiss}
    >
      <div style={{ color: colors.icon, flexShrink: 0, marginTop: '1px' }}>
        {ICONS[type]}
      </div>
      <div style={{ flex: 1, lineHeight: '1.5', wordBreak: 'break-word' }}>
        {message}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.text, opacity: 0.5, padding: '2px',
          flexShrink: 0, display: 'flex', alignItems: 'center',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
      >
        <X size={14} />
      </button>
      
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '3px', background: colors.bar, opacity: 0.4,
        width: `${progress}%`, transition: 'width 0.03s linear',
        borderRadius: '0 0 12px 12px',
      }} />
    </div>
  );
}

let globalAddToast = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

   useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Inject animation keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
       {toasts.length > 0 && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          zIndex: 99999, pointerEvents: 'none',
        }}>
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem {...t} onRemove={removeToast} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

 export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

 export function toast(message, type = 'info', duration = 4000) {
  if (globalAddToast) {
    globalAddToast(message, type, duration);
  } else {
     console.warn('[Toast]', message);
  }
}

export default { ToastProvider, useToast, toast };
