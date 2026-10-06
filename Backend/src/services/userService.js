import User from '../models/User.js';
import { sanitizeUser } from './authService.js';

export { sanitizeUser };

export const getAllUsers = async () => {
  const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();
  return users.map(sanitizeUser);
};

export const createUserRecord = async ({ name, email, password, role, status }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('El usuario ya existe');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: role === 'admin' ? 'admin' : 'user',
    status: status || 'Activo',
  });

  return sanitizeUser(user);
};

export const updateUserRecord = async (id, { name, email, password, role, status }) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (name) user.name = String(name).trim();
  if (email) user.email = String(email).trim().toLowerCase();
  if (password) user.password = password;
  if (role) user.role = role === 'admin' ? 'admin' : 'user';
  if (status) user.status = status;

  await user.save();
  return sanitizeUser(user);
};

export const deleteUserRecord = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
