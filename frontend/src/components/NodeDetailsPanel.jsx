export function NodeDetailsPanel({
  node,
  mapTitle,
  mapDescription,
  onMapMetaChange,
  onNodeFieldChange,
  onAddChild,
  onDeleteNode,
  canDeleteNode
}) {
  if (!node) {
    return (
      <aside className="details-card">
        <p className="eyebrow">Node Editor</p>
        <h2>Select a node</h2>
        <p>Pick any node in the graph to edit its content, add children, or remove it.</p>
      </aside>
    );
  }

  return (
    <aside className="details-card">
      <p className="eyebrow">Node Editor</p>
      <h2>{node.title}</h2>

      <label className="field">
        <span>Mind Map Title</span>
        <input value={mapTitle} onChange={(event) => onMapMetaChange("title", event.target.value)} />
      </label>

      <label className="field">
        <span>Mind Map Description</span>
        <textarea
          rows="4"
          value={mapDescription}
          onChange={(event) => onMapMetaChange("description", event.target.value)}
        />
      </label>

      <label className="field">
        <span>Node Title</span>
        <input value={node.title} onChange={(event) => onNodeFieldChange("title", event.target.value)} />
      </label>

      <label className="field">
        <span>Node Details</span>
        <textarea
          rows="9"
          value={node.details}
          onChange={(event) => onNodeFieldChange("details", event.target.value)}
        />
      </label>

      <div className="panel-actions">
        <button className="primary-button" type="button" onClick={onAddChild}>
          Add Child
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={onDeleteNode}
          disabled={!canDeleteNode}
        >
          Delete Node
        </button>
      </div>
    </aside>
  );
}
