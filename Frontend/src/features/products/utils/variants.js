/**
 * Reglas de variantes de producto e información técnica de cosméticos para Glowe Beauty.
 */

const CATEGORY_VARIANTS = {
  maquillaje: {
    kind: 'Tono',
    options: ['Rosewood', 'Cereza', 'Topo', 'Miel', 'Terracota'],
  },
  cabello: {
    kind: 'Presentacion',
    options: ['50 ml', '125 ml', '250 ml'],
  },
  piel: {
    kind: 'Tono',
    options: ['Light', 'Medium', 'Medium Plus', 'Deep'],
  },
  descuento: {
    kind: 'Presentacion',
    options: ['30 ml', '60 ml'],
  },
}

const CATEGORY_DETAILS = {
  maquillaje: {
    ingredients: [
      'Cera de candelilla (vegana)',
      'Aceite de jojoba hidratante',
      'Pigmentos minerales de larga duracion',
      'Vitamina E antioxidante',
    ],
    tips: 'Aplica una capa fina y difumina antes de que fije. Cruelty free y libre de parabenos.',
  },
  cabello: {
    ingredients: [
      'Aceite de argap 100% puro',
      'Seda hidrolizada reparadora',
      'Panthenol (pro-vitamina B5)',
      'Extracto de camellia protector UV',
    ],
    tips: 'Aplica en medios y puntas con el cabello humedo. Uso diario o cada dos lavados.',
  },
  piel: {
    ingredients: [
      'Acido hialuronico de triple peso molecular',
      'Niacinamida 5% iluminadora',
      'Extracto de callela calmante',
      'Escualano derivado de la avena',
    ],
    tips: 'Aplica mañana y noche antes de tu crema hidratante. Masajea hasta absorcion total.',
  },
}

export const variantOptionsFor = (product) => {
  if (!product) return null
  const def = CATEGORY_VARIANTS[product.category]
  if (!def) return null
  return { kind: def.kind, options: def.options }
}

export const detailsFor = (product) => {
  if (!product) return null
  const def = CATEGORY_DETAILS[product.category]
  if (!def) return null
  return def
}
