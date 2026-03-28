export function SavedMapsSidebar({
  maps,
  selectedMapId,
  mapSearchTerm,
  onMapSearchChange,
  onSelect,
  onCreate,
  onDelete,
  onExport
}) {
  return (
    <aside className="saved-maps-sidebar">
      <div className="saved-maps-header">
        <div>
          <p className="eyebrow">Your Maps</p>
          <h2>Saved mind maps</h2>
        </div>
        <button className="primary-button" type="button" onClick={onCreate}>
          New
        </button>
      </div>

      <div className="map-list">
        <input
          className="search-input sidebar-search"
          type="search"
          placeholder="Search maps"
          value={mapSearchTerm}
          onChange={(event) => onMapSearchChange(event.target.value)}
        />
        {maps.length === 0 ? (
          <div className="empty-state-card">
            <strong>No maps yet</strong>
            <p>Create your first blank mind map to start building the graph.</p>
          </div>
        ) : null}

        {maps.map((map) => (
          <article
            key={map._id}
            className={`map-list-item ${selectedMapId === map._id ? "map-list-item-active" : ""}`}
          >
            <button type="button" className="map-list-button" onClick={() => onSelect(map._id)}>
              <strong>{map.title}</strong>
              <p>{map.description || "No description yet."}</p>
            </button>
            <div className="map-item-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => onExport(map._id)}
                disabled={selectedMapId !== map._id}
              >
                Export
              </button>
              <button className="delete-map-button" type="button" onClick={() => onDelete(map._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
