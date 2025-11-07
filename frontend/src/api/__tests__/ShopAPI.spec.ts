import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  ShopSearchAPI,
  ShopPurchaseAPI,
  ShopCheckStockAPI,
  ShopUseModelAPI,
  ShopGetModelIdAPI
} from '../ShopAPI'
import { http } from '../../utils/http'

// Mock http module
vi.mock('../../utils/http', () => ({
  http: {
    post: vi.fn()
  }
}))

// Mock API_ENDPOINTS
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    SHOP: {
      SEARCH: '/api/shop/search',
      CHECK_STOCK: '/api/shop/check-stock',
      PRODUCT: {
        PURCHASE: '/api/shop/product/purchase',
        USE: '/api/shop/product/use',
        GET_MODEL_ID: '/api/shop/product/get-model-id'
      }
    }
  }
}))

describe('Shop API', () => {
  const mockHttp = vi.mocked(http)

  beforeEach(() => {
    // 模拟console方法
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('ShopSearchAPI', () => {
    it('应该发送商品搜索请求', async () => {
      const searchRequest = {
        keyword: 'Live2D模型',
        category: 'model',
        page: 1,
        limit: 10
      }
      const mockResponse = {
        products: [
          { id: '1', name: 'Hatsune Miku', price: 100, category: 'model' },
          { id: '2', name: 'Kizuna AI', price: 150, category: 'model' }
        ],
        total: 2,
        page: 1,
        limit: 10
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopSearchAPI(searchRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/shop/search', searchRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的搜索请求:', JSON.stringify(searchRequest))
    })

    it('应该处理空搜索结果', async () => {
      const searchRequest = {
        keyword: '不存在的商品',
        page: 1,
        limit: 10
      }
      const mockResponse = {
        products: [],
        total: 0,
        page: 1,
        limit: 10
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopSearchAPI(searchRequest)

      expect(result.products).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('ShopPurchaseAPI', () => {
    it('应该发送购买请求', async () => {
      const purchaseRequest = {
        productId: 'product123',
        userId: 'user456',
        quantity: 1
      }
      const mockResponse = {
        success: true,
        orderId: 'order789',
        message: '购买成功',
        balance: 850
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopPurchaseAPI(purchaseRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/shop/product/purchase', purchaseRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的购买请求:', JSON.stringify(purchaseRequest))
    })

    it('应该处理余额不足的情况', async () => {
      const purchaseRequest = {
        productId: 'expensive_product',
        userId: 'user456',
        quantity: 1
      }
      const mockError = new Error('余额不足')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(ShopPurchaseAPI(purchaseRequest)).rejects.toThrow('余额不足')
    })

    it('应该处理商品不存在的情况', async () => {
      const purchaseRequest = {
        productId: 'nonexistent_product',
        userId: 'user456',
        quantity: 1
      }
      const mockError = new Error('商品不存在')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(ShopPurchaseAPI(purchaseRequest)).rejects.toThrow('商品不存在')
    })
  })

  describe('ShopCheckStockAPI', () => {
    it('应该查看商品库存', async () => {
      const stockRequest = {
        productId: 'product123'
      }
      const mockResponse = {
        productId: 'product123',
        stock: 25,
        available: true
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopCheckStockAPI(stockRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/shop/check-stock', stockRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的查看库存请求:', JSON.stringify(stockRequest))
    })

    it('应该处理缺货情况', async () => {
      const stockRequest = {
        productId: 'out_of_stock_product'
      }
      const mockResponse = {
        productId: 'out_of_stock_product',
        stock: 0,
        available: false
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopCheckStockAPI(stockRequest)

      expect(result.stock).toBe(0)
      expect(result.available).toBe(false)
    })
  })

  describe('ShopUseModelAPI', () => {
    it('应该使用模型并处理字符串响应', async () => {
      const useModelRequest = {
        modelId: 'model123',
        userId: 'user456'
      }
      const mockResponse = 'ok'

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopUseModelAPI(useModelRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/shop/product/use', useModelRequest)
      expect(result).toEqual({
        status: 200,
        data: 'ok'
      })
      expect(console.log).toHaveBeenCalledWith('使用模型请求:', useModelRequest)
    })

    it('应该使用模型并处理对象响应', async () => {
      const useModelRequest = {
        modelId: 'model456',
        userId: 'user789'
      }
      const mockResponse = {
        status: 200,
        message: '模型已激活',
        data: { modelId: 'model456', activated: true }
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopUseModelAPI(useModelRequest)

      expect(result).toEqual(mockResponse)
    })

    it('应该处理模型不存在的情况', async () => {
      const useModelRequest = {
        modelId: 'nonexistent_model',
        userId: 'user456'
      }
      const mockError = new Error('模型不存在或未购买')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(ShopUseModelAPI(useModelRequest)).rejects.toThrow('模型不存在或未购买')
    })
  })

  describe('ShopGetModelIdAPI', () => {
    it('应该获取用户当前使用的模型ID', async () => {
      const getModelRequest = {
        userId: 'user456'
      }
      const mockResponse = {
        userId: 'user456',
        currentModelId: 'model123',
        modelName: 'Hatsune Miku'
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopGetModelIdAPI(getModelRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/shop/product/get-model-id', getModelRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的获取模型ID请求:', JSON.stringify(getModelRequest))
    })

    it('应该处理用户未使用任何模型的情况', async () => {
      const getModelRequest = {
        userId: 'user789'
      }
      const mockResponse = {
        userId: 'user789',
        currentModelId: null,
        modelName: null
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await ShopGetModelIdAPI(getModelRequest)

      expect(result.currentModelId).toBeNull()
      expect(result.modelName).toBeNull()
    })

    it('应该处理用户不存在的情况', async () => {
      const getModelRequest = {
        userId: 'nonexistent_user'
      }
      const mockError = new Error('用户不存在')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(ShopGetModelIdAPI(getModelRequest)).rejects.toThrow('用户不存在')
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理网络连接错误', async () => {
      const searchRequest = { keyword: '测试', page: 1, limit: 10 }
      const networkError = new Error('网络连接失败')

      mockHttp.post.mockRejectedValue(networkError)

      await expect(ShopSearchAPI(searchRequest)).rejects.toThrow('网络连接失败')
    })

    it('应该处理服务器错误', async () => {
      const purchaseRequest = { productId: 'product123', userId: 'user456', quantity: 1 }
      const serverError = new Error('服务器内部错误')

      mockHttp.post.mockRejectedValue(serverError)

      await expect(ShopPurchaseAPI(purchaseRequest)).rejects.toThrow('服务器内部错误')
    })

    it('应该处理超时错误', async () => {
      const stockRequest = { productId: 'product123' }
      const timeoutError = new Error('请求超时')

      mockHttp.post.mockRejectedValue(timeoutError)

      await expect(ShopCheckStockAPI(stockRequest)).rejects.toThrow('请求超时')
    })

    it('应该处理大量购买请求', async () => {
      const purchaseRequest = {
        productId: 'bulk_product',
        userId: 'user456',
        quantity: 999
      }
      const mockError = new Error('购买数量超过限制')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(ShopPurchaseAPI(purchaseRequest)).rejects.toThrow('购买数量超过限制')
    })
  })
}) 