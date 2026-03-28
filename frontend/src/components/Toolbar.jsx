export function Toolbar({
  username,
  title,
  searchTerm,
  onSearchChange,
  onNewMap,
  onGenerate,
  freeViewEnabled,
  onToggleFreeView,
  onSave,
  onToggleStepMode,
  onLogout,
  isSaving
}) {
  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <img className="app-logo" src="/app-logo.svg" alt="App logo" />
        <div>
          <p className="eyebrow">Mind Map Studio</p>
          <h1>{title || "Create a new mind map"}</h1>
        </div>
      </div>

      <div className="toolbar-actions">
        <input
          className="search-input"
          type="search"
          placeholder="Search a node"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button className="ghost-button" type="button" onClick={onNewMap}>
          New Map
        </button>
        <button className="ghost-button" type="button" onClick={onGenerate}>
          Generate AI Map
        </button>
        <button className="ghost-button" type="button" onClick={onToggleFreeView}>
          {freeViewEnabled ? "Exit Free View" : "Free View"}
        </button>
        <button className="ghost-button" type="button" onClick={onToggleStepMode}>
          Step Mode
        </button>
        <button className="primary-button" type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
        <div className="user-chip">
          <span>{username}</span>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
