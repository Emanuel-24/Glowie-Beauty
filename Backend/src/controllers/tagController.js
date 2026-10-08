import {
  getAllTags,
  createTagRecord,
  deleteTagRecord,
} from '../services/tagService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getTags = async (req, res) => {
  try {
    const payload = await getAllTags();
    return sendResponse(res, 200, true, payload, 'Listado de etiquetas disponible');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar las etiquetas');
  }
};

export const createTag = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const tag = await createTagRecord({ name, description });
    return sendResponse(res, 201, true, tag, 'Etiqueta creada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo crear la etiqueta');
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTagRecord(id);
    return sendResponse(res, 200, true, result, 'Etiqueta eliminada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo eliminar la etiqueta');
  }
};
