export function StepModeControls({ visibleDepth, maxDepth, onPrev, onNext, onReset, onClose }) {
  const progress = maxDepth === 0 ? 0 : ((visibleDepth + 1) / (maxDepth + 1)) * 100;

  return (
    <footer className="step-presentation-bar">
      <button className="ghost-button" type="button" onClick={onPrev} disabled={visibleDepth <= 0}>
        Previous
      </button>
      <button className="ghost-button" type="button" onClick={onReset}>
        Restart
      </button>
      <div className="step-progress-shell">
        <span className="step-pill">
          Step {visibleDepth + 1} / {maxDepth + 1}
        </span>
        <div className="step-progress-track">
          <div className="step-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button
        className="primary-button"
        type="button"
        onClick={onNext}
        disabled={visibleDepth >= maxDepth}
      >
        Next
      </button>
      <button className="ghost-button" type="button" onClick={onClose}>
        Close
      </button>
    </footer>
  );
}
