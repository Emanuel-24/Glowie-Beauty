import Subscriber from '../models/Subscriber.js';

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const subscribeEmail = async (email, source = 'general') => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!validateEmail(cleanEmail)) {
    const error = new Error('Formato de correo electrónico inválido');
    error.statusCode = 400;
    throw error;
  }

  const cleanSource = String(source || 'general').trim();

  const existing = await Subscriber.findOne({ email: cleanEmail });
  if (existing) {
    if (!existing.active) {
      existing.active = true;
      existing.source = cleanSource;
      await existing.save();
    }
    return {
      id: existing._id.toString(),
      email: existing.email,
      source: existing.source,
      alreadySubscribed: true,
      createdAt: existing.createdAt,
    };
  }

  const subscriber = await Subscriber.create({
    email: cleanEmail,
    source: cleanSource,
    active: true,
  });

  return {
    id: subscriber._id.toString(),
    email: subscriber.email,
    source: subscriber.source,
    alreadySubscribed: false,
    createdAt: subscriber.createdAt,
  };
};

export const getAllSubscribers = async () => {
  const list = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
  return list.map((item) => ({
    id: item._id.toString(),
    email: item.email,
    source: item.source || 'general',
    active: item.active !== false,
    createdAt: item.createdAt,
  }));
};
