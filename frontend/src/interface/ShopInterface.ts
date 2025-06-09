//单品
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}
//订单(一次只允许购买单个商品)
export interface Order {
    id: string;
    userId: string;
    product: Product;
}
//搜索请求
export interface SearchRequest {
    query: string;
}
//搜索响应
export interface SearchResponse {
    products: Product[];
}
//查看库存
export interface CheckStockRequest {
    userId: string;
}
//查看库存响应
export interface CheckStockResponse {
    productList: Product[];
}
//购买请求
export interface PurchaseRequest {
    order: Order;
}
//购买响应
export interface PurchaseResponse {
    order: Order;
    userId: string;
    product: Product;
    status: 'pending' | 'completed' | 'failed';
}

// 使用模型请求
export interface UseModelRequest {
    productId: string;
    userId: string;
}

// 使用模型响应
export interface UseModelResponse {
    success: boolean;
    message: string;
}

// 获取用户正在使用的模型ID请求
export interface GetModelIdRequest {
    userId: string;
}

// 获取用户正在使用的模型ID响应
export interface GetModelIdResponse {
    success: boolean;
    message: string;
    productId?: string; // 如果用户正在使用模型，返回productId；否则为undefined
}

