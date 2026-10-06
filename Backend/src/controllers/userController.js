import {
  getAllUsers,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
} from '../services/userService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return sendResponse(res, 200, true, users, 'Usuarios consultados correctamente');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar los usuarios');
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, null, 'Nombre, email y contraseña son obligatorios');
  }

  try {
    const user = await createUserRecord({ name, email, password, role, status });
    return sendResponse(res, 201, true, user, 'Usuario creado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo crear el usuario');
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, status } = req.body;

  try {
    const user = await updateUserRecord(id, { name, email, password, role, status });
    return sendResponse(res, 200, true, user, 'Usuario actualizado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo actualizar el usuario');
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteUserRecord(id);
    return sendResponse(res, 200, true, result, 'Usuario eliminado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo eliminar el usuario');
  }
};
