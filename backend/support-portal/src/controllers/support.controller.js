import SupportAgent from '../models/SupportAgent.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// 🔹 REGISTER SUPPORT AGENT
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await SupportAgent.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await SupportAgent.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    await SupportAgent.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Support agent registered successfully'
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error.message); // 👈 no email printed
    res.status(500).json({ message: 'Registration failed' });
  }
};



// 🔹 LOGIN SUPPORT AGENT
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const agent = await SupportAgent.findOne({ where: { username } });
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: agent.id,
      role: 'SUPPORT_AGENT'
    });

    res.json({
      token,
      username: agent.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};
