import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", auth, isAdmin, async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

export default router;