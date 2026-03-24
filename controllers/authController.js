import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export const signup = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          email ? { email } : null,
          username ? { username } : null
        ].filter(Boolean)
      }
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, department: user.department } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });

  }
};