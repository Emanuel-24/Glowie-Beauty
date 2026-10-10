/**
 * Centralización inmutable de todas las rutas de Glowe Beauty.
 * Preserva exactamente los paths existentes para SEO, sitemap y analítica.
 */
export const ROUTES = Object.freeze({
  HOME: '/',
  MAKEUP: '/maquillaje',
  HAIR: '/cabello',
  OFFERS: '/ofertas',
  BUNDLES: '/combos',
  BUNDLE_DETAIL: (id) => `/combos/${id}`,
  BUNDLE_DETAIL_PARAM: '/combos/:id',
  DISCOVER: '/descubrir',
  FAVORITES: '/favoritos',
  PRODUCT_DETAIL: (id) => `/producto/${id}`,
  PRODUCT_DETAIL_PARAM: '/producto/:id',
  CHECKOUT: '/checkout',
  PROFILE: '/perfil',
  ADMIN: '/admin',
  AUTH: '/auth',
  LOGIN: '/login',
  REGISTER: '/registro',
})

export default ROUTES
