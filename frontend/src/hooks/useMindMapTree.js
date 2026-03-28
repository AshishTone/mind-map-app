const makeNodeId = () => `node-${Math.random().toString(36).slice(2, 10)}`;

export const annotateTree = (node, level = 0, parentPath = [], index = 0) => {
  const id = node.id || makeNodeId();
  const path = [...parentPath, id];

  return {
    ...node,
    id,
    level,
    order: Number.isFinite(node.order) ? node.order : index,
    collapsed: Boolean(node.collapsed),
    path,
    children: (node.children || []).map((child, childIndex) =>
      annotateTree(child, level + 1, path, childIndex)
    )
  };
};

export const findNodeById = (node, nodeId) => {
  if (!node) {
    return null;
  }

  if (node.id === nodeId) {
    return node;
  }

  for (const child of node.children || []) {
    const match = findNodeById(child, nodeId);
    if (match) {
      return match;
    }
  }

  return null;
};

export const updateNodeInTree = (node, nodeId, updater) => {
  if (node.id === nodeId) {
    return annotateTree(updater(node), node.level, node.path.slice(0, -1), node.order);
  }

  return annotateTree({
    ...node,
    children: (node.children || []).map((child) => updateNodeInTree(child, nodeId, updater))
  });
};

export const getMaxDepth = (node) => {
  if (!node) {
    return 0;
  }

  return Math.max(node.level, ...(node.children || []).map(getMaxDepth));
};

export const getActivePathIds = (node, selectedNodeId) => {
  const selected = findNodeById(node, selectedNodeId);
  return selected?.path || [];
};

export const addChildNode = (rootNode, parentId) =>
  updateNodeInTree(rootNode, parentId, (node) => ({
    ...node,
    collapsed: false,
    children: [
      ...(node.children || []),
      {
        id: makeNodeId(),
        title: "New Step",
        details: "Add a short explanation or revision note.",
        type: "concept",
        children: []
      }
    ]
  }));

export const deleteNodeFromTree = (node, nodeId) => {
  if (!node.children?.length) {
    return node;
  }

  return annotateTree({
    ...node,
    children: node.children
      .filter((child) => child.id !== nodeId)
      .map((child) => deleteNodeFromTree(child, nodeId))
  });
};
