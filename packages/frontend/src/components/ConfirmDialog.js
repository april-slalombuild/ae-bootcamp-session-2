import React from 'react';
import './Dialog.css';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="dialog">
        <h2 id="confirm-title" className="dialog__title">{title}</h2>
        <p>{message}</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--text" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
