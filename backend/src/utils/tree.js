import crypto from "node:crypto";

const ALLOWED_TYPES = new Set(["concept", "example", "formula", "mistake", "revision"]);

const normalizeNode = (node, level = 0, parentPath = [], index = 0) => {
  const id = node.id || `node-${crypto.randomUUID()}`;
  const path = [...parentPath, id];
  const children = Array.isArray(node.children) ? node.children : [];

  return {
    id,
    title: String(node.title || "Untitled node").trim(),
    details: String(node.details || ""),
    type: ALLOWED_TYPES.has(node.type) ? node.type : "concept",
    order: Number.isFinite(node.order) ? node.order : index,
    collapsed: Boolean(node.collapsed),
    level,
    path,
    children: children.map((child, childIndex) => normalizeNode(child, level + 1, path, childIndex))
  };
};

export const normalizeMindMapPayload = (payload) => {
  const rootNode = normalizeNode(payload.rootNode || {});

  return {
    title: String(payload.title || "Untitled map").trim(),
    description: String(payload.description || ""),
    rootNode
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

export const createEmptyMindMapPayload = ({ title = "Untitled Mind Map", description = "" } = {}) =>
  normalizeMindMapPayload({
    title,
    description,
    rootNode: {
      title: title || "Untitled Mind Map",
      details: description,
      type: "concept",
      children: []
    }
  });
