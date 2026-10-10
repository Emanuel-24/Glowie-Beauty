import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getWhatsAppUrl,
  formatOrderWhatsAppMessage,
  getOrderWhatsAppUrl,
  CONTACT_CONFIG,
} from '@/shared/utils/whatsapp'

describe('whatsapp utility', () => {
  describe('getWhatsAppUrl', () => {
    it('generates a canonical wa.me link with encoded text', () => {
      const url = getWhatsAppUrl('Hola Glowe Beauty', '573001234567')
      assert.equal(url, 'https://wa.me/573001234567?text=Hola%20Glowe%20Beauty')
    })

    it('cleans formatting characters from phone numbers', () => {
      const url = getWhatsAppUrl('Test', '+57 (300) 123-4567')
      assert.ok(url.startsWith('https://wa.me/573001234567?text='))
    })

    it('preserves and encodes 4-byte UTF-8 emojis correctly (ADR-008)', () => {
      const url = getWhatsAppUrl('Pedido 💖 ✨', '573001234567')
      assert.ok(url.includes(encodeURIComponent('💖')))
      assert.ok(url.includes(encodeURIComponent('✨')))
      assert.match(url, /https:\/\/wa\.me\/573001234567\?text=Pedido(%20|\+)/)
    })

    it('supports useApi option to produce api.whatsapp.com/send URL', () => {
      const url = getWhatsAppUrl('Hola', '573001234567', { useApi: true })
      assert.equal(url, 'https://api.whatsapp.com/send?phone=573001234567&text=Hola')
    })

    it('supports useWeb option to produce web.whatsapp.com/send URL', () => {
      const url = getWhatsAppUrl('Hola', '573001234567', { useWeb: true })
      assert.equal(url, 'https://web.whatsapp.com/send?phone=573001234567&text=Hola')
    })
  })

  describe('formatOrderWhatsAppMessage', () => {
    it('formats a structured message with orderId, customerName, total and items', () => {
      const orderData = {
        orderId: 'GLOWE-9988',
        customerName: 'Valentina Gomez',
        items: [
          { name: 'Labial Matte Rosewood', qty: 2, price: 35000 },
          { name: 'Serum Capilar Argán', qty: 1, price: 60000 },
        ],
        total: 130000,
        paymentMethod: 'efectivo',
        address: 'Calle 100 #15-20',
        city: 'Bogotá',
      }

      const message = formatOrderWhatsAppMessage(orderData)

      assert.match(message, /GLOWE-9988/)
      assert.match(message, /Valentina Gomez/)
      assert.match(message, /Bogotá - Calle 100 #15-20/)
      assert.match(message, /Efectivo contra entrega 💵/)
      assert.match(message, /• 2x Labial Matte Rosewood/)
      assert.match(message, /• 1x Serum Capilar Argán/)
      assert.match(message, /\$130\.000 COP/)
      assert.match(message, /💖/)
    })

    it('handles fallback defaults gracefully when fields are missing', () => {
      const message = formatOrderWhatsAppMessage({})
      assert.match(message, /#PENDIENTE/)
      assert.match(message, /Cliente/)
      assert.match(message, /A coordinar/)
      assert.match(message, /Sin productos detallados/)
    })
  })

  describe('getOrderWhatsAppUrl', () => {
    it('creates complete WhatsApp URL with formatted order data', () => {
      const orderData = {
        orderId: 'GLOWE-1234',
        customerName: 'Camila',
        items: [{ name: 'Gloss', qty: 1, price: 20000 }],
        total: 20000,
      }

      const url = getOrderWhatsAppUrl(orderData, '573119876543')

      assert.ok(url.startsWith('https://wa.me/573119876543?text='))
      assert.ok(url.includes(encodeURIComponent('GLOWE-1234')))
      assert.ok(url.includes(encodeURIComponent('Camila')))
    })
  })
})
