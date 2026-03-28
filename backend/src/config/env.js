import dotenv from "dotenv";

dotenv.config();

export const env = {
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mindmap-study-app",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  geminiApiKey: process.env.GEMINI_API_KEY || "dummy-gemini-api-key"
};
