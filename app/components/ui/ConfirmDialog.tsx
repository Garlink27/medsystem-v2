'use client';

interface ConfirmDialogProps {
  isOpen:   boolean;
  title:    string;
  message:  string;
  onConfirm: () => void;
  onCancel:  () => void;
  danger?:  boolean;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, danger = false }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <span className="text-2xl">{danger ? '🗑️' : '⚠️'}</span>
        </div>
        <h3 className="text-center text-lg font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-center text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 justify-center" onClick={onCancel}>Cancelar</button>
          <button
            className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'} inline-flex items-center`}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
