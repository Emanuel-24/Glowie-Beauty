import {
  getSiteConfigRecord,
  updateSiteConfigRecord,
} from '../services/siteConfigService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getSiteConfig = async (req, res) => {
  try {
    const config = await getSiteConfigRecord();
    return sendResponse(res, 200, true, config, 'Configuración del sitio obtenida correctamente');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'Error al consultar la configuración del sitio');
  }
};

export const updateSiteConfig = async (req, res) => {
  try {
    const config = await updateSiteConfigRecord(req.body || {});
    return sendResponse(res, 200, true, config, 'Configuración del sitio actualizada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'Error al actualizar la configuración del sitio');
  }
};
