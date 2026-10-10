import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { variantOptionsFor, detailsFor } from '@/features/products/utils/variants'

describe('variants utility', () => {
  describe('variantOptionsFor', () => {
    it('returns null if product is null, undefined, or missing category', () => {
      assert.equal(variantOptionsFor(null), null)
      assert.equal(variantOptionsFor(undefined), null)
      assert.equal(variantOptionsFor({}), null)
      assert.equal(variantOptionsFor({ category: 'inexistente' }), null)
    })

    it('returns tone options for maquillaje', () => {
      const res = variantOptionsFor({ category: 'maquillaje' })
      assert.ok(res)
      assert.equal(res.kind, 'Tono')
      assert.deepEqual(res.options, ['Rosewood', 'Cereza', 'Topo', 'Miel', 'Terracota'])
    })

    it('returns presentation options for cabello', () => {
      const res = variantOptionsFor({ category: 'cabello' })
      assert.ok(res)
      assert.equal(res.kind, 'Presentacion')
      assert.deepEqual(res.options, ['50 ml', '125 ml', '250 ml'])
    })

    it('returns tone options for piel', () => {
      const res = variantOptionsFor({ category: 'piel' })
      assert.ok(res)
      assert.equal(res.kind, 'Tono')
      assert.deepEqual(res.options, ['Light', 'Medium', 'Medium Plus', 'Deep'])
    })

    it('returns presentation options for descuento', () => {
      const res = variantOptionsFor({ category: 'descuento' })
      assert.ok(res)
      assert.equal(res.kind, 'Presentacion')
      assert.deepEqual(res.options, ['30 ml', '60 ml'])
    })
  })

  describe('detailsFor', () => {
    it('returns null for missing, null or invalid categories', () => {
      assert.equal(detailsFor(null), null)
      assert.equal(detailsFor(undefined), null)
      assert.equal(detailsFor({ category: 'unknown' }), null)
    })

    it('returns cosmetic ingredients and tips for maquillaje', () => {
      const details = detailsFor({ category: 'maquillaje' })
      assert.ok(details)
      assert.ok(Array.isArray(details.ingredients))
      assert.ok(details.ingredients.length > 0)
      assert.match(details.tips, /Cruelty free/i)
    })

    it('returns hair ingredients and application tips for cabello', () => {
      const details = detailsFor({ category: 'cabello' })
      assert.ok(details)
      assert.ok(Array.isArray(details.ingredients))
      assert.match(details.tips, /cabello/i)
    })

    it('returns skin ingredients (e.g., Acido hialuronico) for piel', () => {
      const details = detailsFor({ category: 'piel' })
      assert.ok(details)
      assert.ok(details.ingredients.some((i) => i.includes('hialuronico')))
      assert.match(details.tips, /hidratante/i)
    })
  })
})
