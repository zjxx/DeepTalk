import { describe, it, expect } from 'vitest'
import type {
  Product,
  Order,
  SearchRequest,
  SearchResponse,
  PurchaseRequest,
  PurchaseResponse,
  UseModelRequest,
  UseModelResponse,
  GetModelIdRequest,
  GetModelIdResponse
} from '../ShopInterface'

describe('Shop Interfaces', () => {
  describe('Product', () => {
    it('应该包含产品的所有必需字段', () => {
      const product: Product = {
        id: 'product-123',
        name: '高级语音模型',
        description: '提供更自然的语音合成和识别功能',
        price: 99.99,
        imageUrl: 'https://example.com/model-image.jpg'
      }
      
      expect(typeof product.id).toBe('string')
      expect(typeof product.name).toBe('string')
      expect(typeof product.description).toBe('string')
      expect(typeof product.price).toBe('number')
      expect(typeof product.imageUrl).toBe('string')
    })

    it('应该支持不同价格范围的产品', () => {
      const freeProduct: Product = {
        id: 'free-model',
        name: '免费基础模型',
        description: '基础的语音功能',
        price: 0,
        imageUrl: 'https://example.com/free-model.jpg'
      }
      
      const premiumProduct: Product = {
        id: 'premium-model',
        name: '高端专业模型',
        description: '专业级语音处理功能',
        price: 299.99,
        imageUrl: 'https://example.com/premium-model.jpg'
      }
      
      expect(freeProduct.price).toBe(0)
      expect(premiumProduct.price).toBeGreaterThan(0)
    })
  })

  describe('Order', () => {
    it('应该包含订单的所有必需字段', () => {
      const product: Product = {
        id: 'product-456',
        name: '中级语音模型',
        description: '适合日常使用的语音模型',
        price: 49.99,
        imageUrl: 'https://example.com/mid-model.jpg'
      }
      
      const order: Order = {
        id: 'order-789',
        userId: 'user-123',
        product: product
      }
      
      expect(typeof order.id).toBe('string')
      expect(typeof order.userId).toBe('string')
      expect(typeof order.product).toBe('object')
      expect(order.product.id).toBe(product.id)
    })
  })

  describe('SearchRequest & SearchResponse', () => {
    it('应该正确处理搜索请求', () => {
      const request: SearchRequest = {
        query: '语音模型'
      }
      
      expect(typeof request.query).toBe('string')
      expect(request.query.length).toBeGreaterThan(0)
    })

    it('应该正确处理搜索响应', () => {
      const products: Product[] = [
        {
          id: 'search-1',
          name: '搜索结果1',
          description: '第一个搜索结果',
          price: 30.00,
          imageUrl: 'https://example.com/result1.jpg'
        }
      ]
      
      const response: SearchResponse = {
        products: products
      }
      
      expect(Array.isArray(response.products)).toBe(true)
      expect(response.products.length).toBe(1)
    })
  })

  describe('PurchaseRequest & PurchaseResponse', () => {
    it('应该正确处理购买请求', () => {
      const product: Product = {
        id: 'purchase-product',
        name: '待购买产品',
        description: '用户想要购买的产品',
        price: 75.00,
        imageUrl: 'https://example.com/purchase.jpg'
      }
      
      const order: Order = {
        id: 'purchase-order',
        userId: 'buyer-123',
        product: product
      }
      
      const request: PurchaseRequest = {
        order: order
      }
      
      expect(typeof request.order).toBe('object')
      expect(request.order.product.price).toBe(75.00)
    })

    it('应该支持不同的购买状态', () => {
      const product: Product = {
        id: 'status-test',
        name: '状态测试产品',
        description: '测试不同购买状态',
        price: 20.00,
        imageUrl: 'https://example.com/status.jpg'
      }
      
      const order: Order = {
        id: 'status-order',
        userId: 'status-user',
        product: product
      }
      
      const response: PurchaseResponse = {
        order: order,
        userId: 'status-user',
        product: product,
        status: 'completed'
      }
      
      expect(['pending', 'completed', 'failed']).toContain(response.status)
    })
  })

  describe('UseModelRequest & UseModelResponse', () => {
    it('应该正确处理使用模型请求', () => {
      const request: UseModelRequest = {
        productId: 'model-to-use',
        userId: 'model-user'
      }
      
      expect(typeof request.productId).toBe('string')
      expect(typeof request.userId).toBe('string')
    })

    it('应该正确处理使用模型响应', () => {
      const response: UseModelResponse = {
        status: 200,
        data: '模型切换成功'
      }
      
      expect(typeof response.status).toBe('number')
      expect(typeof response.data).toBe('string')
      expect(response.status).toBe(200)
    })
  })

  describe('GetModelIdRequest & GetModelIdResponse', () => {
    it('应该正确处理获取模型ID请求', () => {
      const request: GetModelIdRequest = {
        userId: 'current-user'
      }
      
      expect(typeof request.userId).toBe('string')
    })

    it('应该正确处理有模型的用户响应', () => {
      const response: GetModelIdResponse = {
        success: true,
        message: '用户正在使用模型',
        productId: 'current-model-123'
      }
      
      expect(typeof response.success).toBe('boolean')
      expect(typeof response.message).toBe('string')
      expect(typeof response.productId).toBe('string')
      expect(response.success).toBe(true)
    })

    it('应该正确处理没有模型的用户响应', () => {
      const response: GetModelIdResponse = {
        success: false,
        message: '用户未使用任何模型',
        productId: undefined
      }
      
      expect(response.success).toBe(false)
      expect(response.productId).toBeUndefined()
    })
  })
}) 