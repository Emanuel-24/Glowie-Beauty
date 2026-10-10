import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateItemCount,
  calculateSubtotal,
  calculateShippingCost,
  calculateTotal,
  calculateCartTotals,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
} from '@/features/cart/utils/cartTotals'

describe('cartTotals utility', () => {
  describe('calculateItemCount', () => {
    it('returns 0 for empty, null or non-array values', () => {
      assert.equal(calculateItemCount([]), 0)
      assert.equal(calculateItemCount(null), 0)
      assert.equal(calculateItemCount(undefined), 0)
      assert.equal(calculateItemCount('invalid'), 0)
    })

    it('sums the quantities of all items', () => {
      const items = [
        { id: '1', qty: 2 },
        { id: '2', qty: 3 },
        { id: '3', qty: 1 },
      ]
      assert.equal(calculateItemCount(items), 6)
    })

    it('handles items with missing or non-numeric qty safely', () => {
      const items = [
        { id: '1', qty: '2' },
        { id: '2' },
        { id: '3', qty: null },
      ]
      assert.equal(calculateItemCount(items), 2)
    })
  })

  describe('calculateSubtotal', () => {
    it('returns 0 for empty array', () => {
      assert.equal(calculateSubtotal([]), 0)
      assert.equal(calculateSubtotal(null), 0)
    })

    it('calculates price * qty correctly', () => {
      const items = [
        { price: 25000, qty: 2 },
        { price: 40000, qty: 1 },
      ]
      assert.equal(calculateSubtotal(items), 90000)
    })

    it('handles numeric strings gracefully', () => {
      const items = [
        { price: '30000', qty: '2' },
      ]
      assert.equal(calculateSubtotal(items), 60000)
    })
  })

  describe('calculateShippingCost', () => {
    it('returns 0 when subtotal is 0 or negative', () => {
      assert.equal(calculateShippingCost(0), 0)
      assert.equal(calculateShippingCost(-100), 0)
    })

    it(`charges standard shipping ($${STANDARD_SHIPPING_COST}) when subtotal <= $${FREE_SHIPPING_THRESHOLD}`, () => {
      assert.equal(calculateShippingCost(50000), STANDARD_SHIPPING_COST)
      assert.equal(calculateShippingCost(FREE_SHIPPING_THRESHOLD), STANDARD_SHIPPING_COST)
    })

    it(`returns free shipping ($0) when subtotal > $${FREE_SHIPPING_THRESHOLD}`, () => {
      assert.equal(calculateShippingCost(FREE_SHIPPING_THRESHOLD + 1), 0)
      assert.equal(calculateShippingCost(200000), 0)
    })
  })

  describe('calculateTotal', () => {
    it('sums subtotal and shipping cost', () => {
      assert.equal(calculateTotal(50000, 12000), 62000)
      assert.equal(calculateTotal(200000, 0), 200000)
    })
  })

  describe('calculateCartTotals', () => {
    it('computes all cart values coherently in a single object', () => {
      const items = [
        { id: 'p1', price: 40000, qty: 2 }, // 80,000
        { id: 'p2', price: 50000, qty: 1 }, // 50,000 -> subtotal 130,000
      ]

      const totals = calculateCartTotals(items)

      assert.deepEqual(totals, {
        itemCount: 3,
        subtotal: 130000,
        shippingCost: 12000,
        total: 142000,
      })
    })

    it('applies free shipping when items exceed threshold', () => {
      const items = [
        { id: 'p1', price: 80000, qty: 2 }, // 160,000 > 150,000
      ]

      const totals = calculateCartTotals(items)

      assert.deepEqual(totals, {
        itemCount: 2,
        subtotal: 160000,
        shippingCost: 0,
        total: 160000,
      })
    })
  })
})
