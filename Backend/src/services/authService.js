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
  favorites: Array.isArray(user.favorites) ? user.favorites : [],
  lastLoginAt: user.lastLoginAt || null,
  createdAt: user.createdAt || null,
});

export const createToken = (user, customExpiresIn) => {
  const role = String(user.role || '').toLowerCase();
  const isAdminOrStaff = ['admin', 'editor', 'soporte'].includes(role);
  const expiresIn = customExpiresIn || (isAdminOrStaff ? '24h' : '60d');

  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn },
  );
};

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('Este correo ya esta registrado.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: 'user',
    lastLoginAt: new Date(),
    status: 'Activo',
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

  // Actualizar último acceso y reactivar a Activo si no estaba bloqueado
  user.lastLoginAt = new Date();
  if (user.status !== 'Bloqueado') {
    user.status = 'Activo';
  }
  await user.save();

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
};
