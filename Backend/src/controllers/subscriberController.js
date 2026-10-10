import { subscribeEmail, getAllSubscribers } from '../services/subscriberService.js';

export const subscribe = async (req, res, next) => {
  try {
    const { email, source } = req.body || {};
    const result = await subscribeEmail(email, source);
    res.status(200).json({
      success: true,
      data: result,
      message: result.alreadySubscribed
        ? '¡Ya estás suscrita! Te avisaremos con prioridad cuando tengamos nuevas ofertas.'
        : '¡Suscripción exitosa! Te avisaremos de nuevas ofertas y promociones.',
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      data: null,
      message: error.message || 'Error al procesar la suscripción',
    });
  }
};

export const getSubscribers = async (req, res, next) => {
  try {
    const list = await getAllSubscribers();
    res.status(200).json({
      success: true,
      data: list,
      message: 'Lista de suscriptores obtenida con éxito',
    });
  } catch (error) {
    next(error);
  }
};
