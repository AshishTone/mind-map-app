import crypto from "node:crypto";
import { User } from "../models/User.js";

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  const [salt, storedHash] = String(storedPassword).split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(password, salt, 64);
  const knownHash = Buffer.from(storedHash, "hex");

  if (candidateHash.length !== knownHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateHash, knownHash);
};

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username
});

export const signup = async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists." });
  }

  const user = await User.create({
    username,
    password: hashPassword(password)
  });

  return res.status(201).json(sanitizeUser(user));
};

export const login = async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const passwordMatches = verifyPassword(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.json(sanitizeUser(user));
};
