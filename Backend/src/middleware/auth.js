import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !String(secret).trim()) {
    throw new Error('JWT_SECRET no configurado. Añade la variable de entorno antes de iniciar la API.');
  }

  return secret;
};

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token de autenticación requerido.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Usuario no encontrado o sesión inválida.',
      });
    }

    if (user.status === 'Bloqueado') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Tu cuenta está bloqueada y no puedes acceder.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token inválido o expirado.',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'No tienes permisos de administrador.',
    });
  }

  next();
};
