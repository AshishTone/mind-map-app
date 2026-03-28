const matchesSearch = (node, searchTerm) => {
  if (!searchTerm) {
    return true;
  }

  const text = `${node.title} ${node.details}`.toLowerCase();
  return text.includes(searchTerm.toLowerCase());
};

const matchesSearchInBranch = (node, searchTerm) => {
  if (!searchTerm) {
    return true;
  }

  if (matchesSearch(node, searchTerm)) {
    return true;
  }

  return (node.children || []).some((child) => matchesSearchInBranch(child, searchTerm));
};

export function MindNode({
  node,
  selectedNodeId,
  activePathIds,
  searchTerm,
  visibleDepth,
  stepModeEnabled,
  orientation,
  onSelect,
  onToggleCollapse
}) {
  const isSelected = node.id === selectedNodeId;
  const isActivePath = activePathIds.includes(node.id);
  const isVisible = !stepModeEnabled || node.level <= visibleDepth;
  const isSearchMatch = matchesSearch(node, searchTerm);
  const shouldRenderForSearch = matchesSearchInBranch(node, searchTerm);
  const showChildren = node.children?.length > 0 && (!node.collapsed || Boolean(searchTerm));

  if (!isVisible || !shouldRenderForSearch) {
    return null;
  }

  return (
    <div className={`mind-node-group mind-node-group-${orientation}`}>
      <div
        className={[
          "mind-node",
          isSelected ? "selected" : "",
          isActivePath ? "active-path" : "",
          isSearchMatch ? "" : "search-muted"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button className="node-card" type="button" onClick={() => onSelect(node.id)}>
          <strong>{node.title}</strong>
          <p>{node.details || "No details yet."}</p>
        </button>
        {node.children?.length > 0 ? (
          <button className="collapse-button" type="button" onClick={() => onToggleCollapse(node.id)}>
            {node.collapsed ? "Expand" : "Collapse"}
          </button>
        ) : null}
      </div>

      {showChildren ? (
        <div className={`mind-node-children mind-node-children-${orientation}`}>
          {node.children.map((child) => (
            <MindNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              activePathIds={activePathIds}
              searchTerm={searchTerm}
              visibleDepth={visibleDepth}
              stepModeEnabled={stepModeEnabled}
              orientation={orientation}
              onSelect={onSelect}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
