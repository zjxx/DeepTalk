import type { SearchRequest, SearchResponse, CheckStockRequest, CheckStockResponse,
    PurchaseRequest, PurchaseResponse, UseModelRequest, UseModelResponse } from '../interface/ShopInterface';
import { API_ENDPOINTS } from '../config/api';
import { http } from '../utils/http'

//const BASE_URL = '/api/community'
// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, request)
// }

//搜索
export function ShopSearchAPI(request: SearchRequest): Promise<SearchResponse> {
    console.log('发送的搜索请求:', JSON.stringify(request));
    return http.post<SearchResponse, SearchRequest>(API_ENDPOINTS.SHOP.SEARCH, request);
}
//购买
export function ShopPurchaseAPI(request: PurchaseRequest): Promise<PurchaseResponse> {
    console.log('发送的购买请求:', JSON.stringify(request));
    return http.post<PurchaseResponse, PurchaseRequest>(API_ENDPOINTS.SHOP.PRODUCT.PURCHASE, request);
}
//查看库存
export function ShopCheckStockAPI(request: CheckStockRequest): Promise<CheckStockResponse> {
    console.log('发送的查看库存请求:', JSON.stringify(request));
    return http.post<CheckStockResponse, CheckStockRequest>(API_ENDPOINTS.SHOP.CHECK_STOCK, request);
}

//使用模型
export function ShopUseModelAPI(request: UseModelRequest): Promise<UseModelResponse> {
    console.log('发送的使用模型请求:', JSON.stringify(request));
    return http.post<UseModelResponse, UseModelRequest>(API_ENDPOINTS.SHOP.PRODUCT.USE, request);
}
