import {
  getAllCategories,
  createCategoryRecord,
  updateCategoryRecord,
  deleteCategoryRecord,
} from '../services/categoryService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getCategories = async (req, res) => {
  try {
    const payload = await getAllCategories();
    return sendResponse(res, 200, true, payload, 'Listado de categorías disponible');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar las categorías');
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body || {};
    const category = await createCategoryRecord({ name, description, status });
    return sendResponse(res, 201, true, category, 'Categoría creada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo crear la categoría');
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await updateCategoryRecord(id, req.body || {});
    return sendResponse(res, 200, true, category, 'Categoría actualizada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo actualizar la categoría');
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategoryRecord(id);
    return sendResponse(res, 200, true, result, 'Categoría eliminada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo eliminar la categoría');
  }
};
