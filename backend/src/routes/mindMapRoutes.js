import { Router } from "express";
import {
  createMindMap,
  deleteMindMap,
  generateMindMap,
  getMindMap,
  getNodeDetails,
  listMindMaps,
  updateMindMap
} from "../controllers/mindMapController.js";

const router = Router();

router.get("/", listMindMaps);
router.post("/", createMindMap);
router.post("/generate", generateMindMap);
router.get("/:id", getMindMap);
router.put("/:id", updateMindMap);
router.delete("/:id", deleteMindMap);
router.get("/:id/nodes/:nodeId", getNodeDetails);

export default router;
