import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeUser } from '../src/services/authService.js';
import { normalizeProduct } from '../src/services/productService.js';
import { normalizeCategory } from '../src/services/categoryService.js';
import { normalizeOrder } from '../src/services/orderService.js';
import { normalizePayment } from '../src/services/paymentService.js';
import { normalizeTag } from '../src/services/tagService.js';
import { normalizeSiteConfig } from '../src/services/siteConfigService.js';

describe('Suite de Integración y Servicios Críticos - Backend Glowe Beauty', () => {

  describe('1. Flujo de Autenticación y Sanitización de Roles (ADR-007)', () => {
    test('sanitizeUser excluye contraseñas y preserva el rol y estado', () => {
      const mockRawUser = {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Administrador Glowe',
        email: 'admin@glowe.com',
        password: '$2a$10$hashedpasswordstringthatshouldneverleak',
        role: 'admin',
        status: 'Activo',
      };

      const sanitized = sanitizeUser(mockRawUser);

      assert.equal(sanitized.id, '64f1a2b3c4d5e6f7a8b9c0d1');
      assert.equal(sanitized.name, 'Administrador Glowe');
      assert.equal(sanitized.email, 'admin@glowe.com');
      assert.equal(sanitized.role, 'admin');
      assert.equal(sanitized.status, 'Activo');
      assert.equal(sanitized.password, undefined, 'La contraseña no debe ser expuesta');
    });

    test('sanitizeUser asigna valores por defecto consistentes para clientes', () => {
      const mockClient = {
        _id: '64f1a2b3c4d5e6f7a8b9c0d2',
        name: 'Cliente Glowe',
        email: 'cliente@glowe.com',
        role: 'user',
        status: 'Activo',
      };

      const sanitized = sanitizeUser(mockClient);
      assert.equal(sanitized.role, 'user');
    });
  });

  describe('2. Consulta y Normalización de Productos (ADR-009, ADR-010)', () => {
    test('normalizeProduct asegura estructura completa con imágenes y stock', () => {
      const rawProduct = {
        _id: 'prod123',
        name: 'Labial Matte Rose',
        price: 35000,
        images: ['https://glowe.com/img1.jpg', 'https://glowe.com/img2.jpg'],
        category: 'maquillaje',
      };

      const normalized = normalizeProduct(rawProduct);

      assert.equal(normalized.id, 'prod123');
      assert.equal(normalized.name, 'Labial Matte Rose');
      assert.equal(normalized.brand, 'Glowe Select', 'Debe asignar marca por defecto');
      assert.equal(normalized.price, 35000);
      assert.equal(normalized.images.length, 2, 'Debe preservar el arreglo de imágenes');
      assert.equal(normalized.image, 'https://glowe.com/img1.jpg', 'Debe asignar la primera imagen como portada');
      assert.equal(normalized.stock, 0);
    });

    test('normalizeProduct maneja producto sin imagen con fallback seguro', () => {
      const rawEmpty = {
        _id: 'empty_prod',
        title: 'Producto Sin Imagen',
        price: 20000,
      };

      const normalized = normalizeProduct(rawEmpty);
      assert.equal(normalized.name, 'Producto Sin Imagen');
      assert.ok(Array.isArray(normalized.images));
    });
  });

  describe('3. Normalización de Órdenes y Flujo de Pagos (ADR-008, ADR-011)', () => {
    test('normalizeOrder calcula balance y estructura inicial de la orden', () => {
      const rawOrder = {
        _id: 'order_999',
        total: 100000,
        amountPaid: 0,
        customer: 'Mariana Gómez',
        items: [{ productId: 'prod123', title: 'Labial Matte', quantity: 2, price: 50000 }],
        shippingAddress: 'Carrera 7 # 45-12, Bogotá',
      };

      const normalized = normalizeOrder(rawOrder);

      assert.equal(normalized.id, 'order_999');
      assert.equal(normalized.total, 100000);
      assert.equal(normalized.balance, 100000);
      assert.equal(normalized.paymentStatus, 'Sin pagos');
      assert.equal(normalized.status, 'Pendiente');
    });

    test('normalizePayment estructura abonos y métodos de pago correctamente', () => {
      const rawPayment = {
        _id: 'pay_001',
        orderId: 'order_999',
        userId: 'user_123',
        amount: 50000,
        method: 'TRANSFERENCIA',
        status: 'Confirmado',
      };

      const normalized = normalizePayment(rawPayment);

      assert.equal(normalized.id, 'pay_001');
      assert.equal(normalized.amount, 50000);
      assert.equal(normalized.method, 'TRANSFERENCIA');
      assert.equal(normalized.status, 'Confirmado');
    });
  });

  describe('4. Gestión de Categorías', () => {
    test('normalizeCategory asigna conteo de productos y campos obligatorios', () => {
      const rawCat = {
        _id: 'cat_01',
        name: 'Cabello',
        slug: 'cabello',
      };

      const normalized = normalizeCategory(rawCat, 15);

      assert.equal(normalized.id, 'cat_01');
      assert.equal(normalized.name, 'Cabello');
      assert.equal(normalized.products, 15);
      assert.equal(normalized.status, 'Activa');
    });
  });

  describe('5. Gestión de Etiquetas y Configuración del Sitio (Fases 1 y 2)', () => {
    test('normalizeTag formatea correctamente identificadores y conteo', () => {
      const rawTag = {
        _id: 'tag_01',
        name: 'Ojos',
        slug: 'ojos',
        description: 'Productos para la mirada',
      };

      const normalized = normalizeTag(rawTag, 8);

      assert.equal(normalized.id, 'tag_01');
      assert.equal(normalized.name, 'Ojos');
      assert.equal(normalized.products, 8);
      assert.equal(normalized.description, 'Productos para la mirada');
    });

    test('normalizeSiteConfig preserva heroConfig con valores por defecto y lista comunitaria', () => {
      const rawConfig = {
        _id: 'cfg_01',
        heroConfig: {
          floatingBadgeText: '✨ ¡Nuevo producto!',
          tagline: 'RUTINA COMPLETA',
          title: 'Glow Natural Everyday',
        },
        communityConfig: [
          { imageUrl: 'https://glowe.com/c1.jpg', title: '@glow1', link: 'https://instagram.com' },
        ],
      };

      const normalized = normalizeSiteConfig(rawConfig);

      assert.equal(normalized.id, 'cfg_01');
      assert.equal(normalized.heroConfig.floatingBadgeText, '✨ ¡Nuevo producto!');
      assert.equal(normalized.heroConfig.tagline, 'RUTINA COMPLETA');
      assert.equal(normalized.heroConfig.title, 'Glow Natural Everyday');
      assert.equal(normalized.communityConfig.length, 1);
      assert.equal(normalized.communityConfig[0].title, '@glow1');
    });
  });

});
