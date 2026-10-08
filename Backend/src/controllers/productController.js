import {
  getAllProducts,
  getProductByIdRecord,
  createProductRecord,
  updateProductRecord,
  deleteProductRecord,
  getTopSellerProductRecord,
} from '../services/productService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    return sendResponse(res, 200, true, products, 'Listado de productos disponible');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar los productos');
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await getProductByIdRecord(id);
    return sendResponse(res, 200, true, product, 'Producto encontrado');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo consultar el producto');
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await createProductRecord(req.body || {});
    return sendResponse(res, 201, true, product, 'Producto creado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo crear el producto');
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await updateProductRecord(id, req.body || {});
    return sendResponse(res, 200, true, product, 'Producto actualizado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo actualizar el producto');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProductRecord(id);
    return sendResponse(res, 200, true, result, 'Producto eliminado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo eliminar el producto');
  }
};

export const getTopSeller = async (req, res) => {
  try {
    const topSeller = await getTopSellerProductRecord();
    return sendResponse(res, 200, true, topSeller, 'Producto más vendido obtenido correctamente');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'Error al consultar el producto más vendido');
  }
};
