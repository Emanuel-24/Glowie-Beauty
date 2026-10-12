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

  const validRoles = ['admin', 'editor', 'soporte', 'user'];
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: validRoles.includes(role) ? role : 'user',
    status: status || 'Activo',
    lastLoginAt: new Date(),
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

  const isPrimaryAdmin = user.email.toLowerCase() === 'admin@glowe.com';

  // Blindaje de seguridad para el Administrador principal
  if (isPrimaryAdmin) {
    if (role && role !== 'admin') {
      const error = new Error('No se puede modificar ni degradar el rol del Administrador principal.');
      error.statusCode = 403;
      throw error;
    }
    if (status && status === 'Bloqueado') {
      const error = new Error('No se puede bloquear la cuenta del Administrador principal.');
      error.statusCode = 403;
      throw error;
    }
  }

  if (name) user.name = String(name).trim();
  if (email && !isPrimaryAdmin) user.email = String(email).trim().toLowerCase();
  if (password) user.password = password;

  if (role) {
    const validRoles = ['admin', 'editor', 'soporte', 'user'];
    if (validRoles.includes(role)) {
      user.role = role;
    }
  }

  if (status) user.status = status;

  await user.save();
  return sanitizeUser(user);
};

export const deleteUserRecord = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Blindaje inmutable: El administrador principal no puede ser eliminado
  if (user.email.toLowerCase() === 'admin@glowe.com') {
    const error = new Error('El Administrador principal no puede ser eliminado físicamente de la base de datos.');
    error.statusCode = 403;
    throw error;
  }

  // No permitir eliminar el único administrador existente
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      const error = new Error('No es posible eliminar al único Administrador disponible.');
      error.statusCode = 403;
      throw error;
    }
  }

  await User.findByIdAndDelete(id);
  return { id };
};
