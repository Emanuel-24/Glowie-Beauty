import {
  getAllBundles,
  getBundleByIdRecord,
  createBundleRecord,
  updateBundleRecord,
  deleteBundleRecord,
} from '../services/bundleService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getBundles = async (req, res) => {
  try {
    const bundles = await getAllBundles();
    return sendResponse(res, 200, true, bundles, 'Listado de combos obtenido con éxito');
  } catch (error) {
    return sendResponse(res, 500, false, null, error?.message || 'Error al consultar combos');
  }
};

export const getBundleById = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await getBundleByIdRecord(id);
    return sendResponse(res, 200, true, bundle, 'Combo consultado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'Error al consultar el combo');
  }
};

export const createBundle = async (req, res) => {
  try {
    const bundle = await createBundleRecord(req.body || {});
    return sendResponse(res, 201, true, bundle, 'Combo creado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'Error al crear el combo');
  }
};

export const updateBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await updateBundleRecord(id, req.body || {});
    return sendResponse(res, 200, true, bundle, 'Combo actualizado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'Error al actualizar el combo');
  }
};

export const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteBundleRecord(id);
    return sendResponse(res, 200, true, result, 'Combo eliminado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'Error al eliminar el combo');
  }
};
