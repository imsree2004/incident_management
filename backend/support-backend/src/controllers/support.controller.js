import { comparePassword, hashPassword } from '../utils/password.js';
import { Op, fn, col, where as sequelizeWhere } from 'sequelize';

import SupportAgent from '../models/SupportAgent.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createHttpError } from '../utils/httpError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/;
const USERNAME_REGEX = /^[a-z0-9._-]{3,50}$/;

const normalizeUsername = (username = '') => username.trim().toLowerCase();
const normalizeEmail = (email = '') => email.trim().toLowerCase();

const caseInsensitiveMatch = (field, value) =>
  sequelizeWhere(fn('lower', col(field)), value);

/* Format response */
const formatAgent = (agent) => ({
  id: agent.id,
  username: agent.username,
  email: agent.email,
  department: agent.department
});

/* ---------------- VALIDATION ---------------- */

const validateRegistrationInput = ({ username, email, password, department } = {}) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = typeof password === 'string' ? password.trim() : '';
  const normalizedDepartment = typeof department === 'string' ? department.trim() : '';

  if (!normalizedUsername || !normalizedEmail || !normalizedPassword || !normalizedDepartment) {
    throw createHttpError(400, 'Username, email, password, and department are required');
  }

  if (!USERNAME_REGEX.test(normalizedUsername)) {
    throw createHttpError(
      400,
      'Username must be 3-50 characters and contain only letters, numbers, dots, underscores, or hyphens'
    );
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createHttpError(400, 'A valid email address is required');
  }

  if (!PASSWORD_REGEX.test(normalizedPassword)) {
    throw createHttpError(
      400,
      'Password must be at least 8 characters long and include at least one letter and one number'
    );
  }

  return {
    username: normalizedUsername,
    email: normalizedEmail,
    password: normalizedPassword,
    department: normalizedDepartment
  };
};

const validateLoginInput = ({ username, password } = {}) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = typeof password === 'string' ? password.trim() : '';

  if (!normalizedUsername || !normalizedPassword) {
    throw createHttpError(400, 'Username and password are required');
  }

  return {
    username: normalizedUsername,
    password: normalizedPassword
  };
};

/* ---------------- REGISTER ---------------- */

export const register = asyncHandler(async (req, res) => {

  const { username, email, password, department } = validateRegistrationInput(req.body);

  const [existingUsername, existingEmail] = await Promise.all([
    SupportAgent.findOne({
      where: caseInsensitiveMatch('username', username),
      attributes: ['id']
    }),
    SupportAgent.findOne({
      where: caseInsensitiveMatch('email', email),
      attributes: ['id']
    })
  ]);

  if (existingUsername) {
    throw createHttpError(409, 'Username already exists');
  }

  if (existingEmail) {
    throw createHttpError(409, 'Email already exists');
  }

  const agent = await SupportAgent.create({
    username,
    email,
    password: await hashPassword(password),
    department
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Support agent registered successfully',
    data: formatAgent(agent)
  });
});

/* ---------------- LOGIN ---------------- */

export const login = asyncHandler(async (req, res) => {

  const { username, password } = validateLoginInput(req.body);

  const agent = await SupportAgent.findOne({
    where: {
      [Op.or]: [
        caseInsensitiveMatch('username', username),
        caseInsensitiveMatch('email', username)
      ]
    },
    attributes: ['id', 'username', 'email', 'password', 'department']
  });

  if (!agent) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const valid = await comparePassword(password, agent.password);

  if (!valid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const token = generateToken({ id: agent.id, role: 'SUPPORT_AGENT' });

  return sendSuccess(res, {
    message: 'Login successful',
    data: {
      ...formatAgent(agent),
      token
    }
  });
});