import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    type: {
      type: String,
      enum: ["concept", "example", "formula", "mistake", "revision"],
      default: "concept"
    },
    order: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    path: { type: [String], default: [] },
    children: { type: [], default: [] }
  },
  { _id: false }
);

nodeSchema.add({ children: [nodeSchema] });

const mindMapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    rootNode: { type: nodeSchema, required: true }
  },
  { timestamps: true }
);

export const MindMap = mongoose.model("MindMap", mindMapSchema);
