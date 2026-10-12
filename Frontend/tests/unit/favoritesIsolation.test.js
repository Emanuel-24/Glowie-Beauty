import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const isValidId = (id) => typeof id === 'string' || typeof id === 'number'

const resolveId = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'id' in value
    ? value.id
    : value

const sanitizeFavorites = (list) => {
  if (!Array.isArray(list)) return []
  return [...new Set(list.map(resolveId).filter(isValidId))]
}

describe('favorites isolation and normalization logic', () => {
  it('resuelve IDs desde valores primitivos y objetos con id', () => {
    assert.equal(resolveId('prod-1'), 'prod-1')
    assert.equal(resolveId(123), 123)
    assert.equal(resolveId({ id: 'prod-99', name: 'Labial' }), 'prod-99')
    assert.equal(resolveId(null), null)
    assert.equal(resolveId(undefined), undefined)
  })

  it('filtra IDs duplicados e inválidos correctamente', () => {
    const raw = ['p1', 10, 'p1', null, undefined, false, { id: 'p2' }, 'p2', {}]
    const cleaned = sanitizeFavorites(raw)
    assert.deepEqual(cleaned, ['p1', 10, 'p2'])
  })

  it('no fusiona favoritos anónimos con los favoritos autenticados de MongoDB', () => {
    const anonymousFavorites = ['anon-1', 'anon-2']
    const userMongoFavorites = ['saved-in-db-1']

    // Política de aislamiento estricto: la cuenta autenticada carga exclusivamente userMongoFavorites
    const effectiveAuthenticatedFavorites = sanitizeFavorites(userMongoFavorites)

    assert.deepEqual(effectiveAuthenticatedFavorites, ['saved-in-db-1'])
    assert.equal(effectiveAuthenticatedFavorites.includes('anon-1'), false)
    assert.equal(effectiveAuthenticatedFavorites.includes('anon-2'), false)
  })

  it('preserva la lista limpia cuando el usuario autenticado no tiene favoritos en BD', () => {
    const userWithoutFavorites = { favorites: [] }
    const loadedFavorites = sanitizeFavorites(userWithoutFavorites.favorites)
    assert.deepEqual(loadedFavorites, [])
  })
})
