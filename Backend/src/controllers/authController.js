import { registerUser, loginUser, sanitizeUser } from '../services/authService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, null, 'Nombre, email y contraseña son obligatorios');
  }

  try {
    const data = await registerUser({ name, email, password });
    return sendResponse(res, 201, true, data, 'Usuario registrado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo registrar el usuario');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, false, null, 'Email y contraseña son obligatorios');
  }

  try {
    const data = await loginUser({ email, password });
    return sendResponse(res, 200, true, data, 'Inicio de sesión exitoso');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'Error al iniciar sesión');
  }
};

export const getProfile = async (req, res) => {
  if (!req.user) {
    return sendResponse(res, 401, false, null, 'Sesión requerida');
  }

  return sendResponse(res, 200, true, sanitizeUser(req.user), 'Perfil cargado correctamente');
};
