import { MindMap } from "../models/MindMap.js";
import { generateMindMapDraft } from "../services/geminiService.js";
import { createEmptyMindMapPayload, findNodeById, normalizeMindMapPayload } from "../utils/tree.js";

export const listMindMaps = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }

  const maps = await MindMap.find({ userId })
    .select("title description updatedAt createdAt username")
    .sort({ updatedAt: -1 });

  return res.json(maps);
};

export const getMindMap = async (req, res) => {
  const { userId } = req.query;
  const map = await MindMap.findOne({ _id: req.params.id, userId });

  if (!map) {
    return res.status(404).json({ message: "Mind map not found." });
  }

  return res.json(map);
};

export const createMindMap = async (req, res) => {
  const { userId, username, title, description, rootNode } = req.body;

  if (!userId || !username) {
    return res.status(400).json({ message: "userId and username are required." });
  }

  const payload = rootNode
    ? normalizeMindMapPayload({ title, description, rootNode })
    : createEmptyMindMapPayload({ title, description });

  const map = await MindMap.create({
    userId,
    username,
    ...payload
  });

  return res.status(201).json(map);
};

export const updateMindMap = async (req, res) => {
  const { userId, title, description, rootNode } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }

  const payload = normalizeMindMapPayload({ title, description, rootNode });
  const map = await MindMap.findOneAndUpdate({ _id: req.params.id, userId }, payload, {
    new: true,
    runValidators: true
  });

  if (!map) {
    return res.status(404).json({ message: "Mind map not found." });
  }

  return res.json(map);
};

export const deleteMindMap = async (req, res) => {
  const { userId } = req.query;
  const map = await MindMap.findOneAndDelete({ _id: req.params.id, userId });

  if (!map) {
    return res.status(404).json({ message: "Mind map not found." });
  }

  return res.status(204).send();
};

export const getNodeDetails = async (req, res) => {
  const { userId } = req.query;
  const map = await MindMap.findOne({ _id: req.params.id, userId });

  if (!map) {
    return res.status(404).json({ message: "Mind map not found." });
  }

  const node = findNodeById(map.rootNode, req.params.nodeId);

  if (!node) {
    return res.status(404).json({ message: "Node not found." });
  }

  return res.json(node);
};

export const generateMindMap = async (req, res) => {
  const { title, description, depth } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "A title is required to generate a mind map." });
  }

  const generated = await generateMindMapDraft({
    title: title.trim(),
    description: String(description || ""),
    depth: Number(depth || 4)
  });

  return res.json(generated);
};
