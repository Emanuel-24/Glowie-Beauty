import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    throw new Error('JWT_SECRET no configurado. Añade la variable de entorno antes de iniciar la API.');
  }
  return secret;
};

export const sanitizeUser = (user) => ({
  id: user._id?.toString?.() ?? user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
});

export const createToken = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email },
  getJwtSecret(),
  { expiresIn: '1h' },
);

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('El usuario ya existe');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: 'user',
  });

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'Bloqueado') {
    const error = new Error('Tu cuenta está bloqueada. Contacta al administrador.');
    error.statusCode = 403;
    throw error;
  }

  const isValidPassword = await user.comparePassword(String(password));

  if (!isValidPassword) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
};
