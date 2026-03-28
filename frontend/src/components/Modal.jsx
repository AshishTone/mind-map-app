export function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className={`modal-card ${wide ? "modal-card-wide" : ""}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
