import type { ConnectResponse, ConnectRequest } from '../interface/versus'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'



/**
 * 建立 WebSocket 连接
 * @param userId 用户ID
 * @returns 包含 sessionId 和 opponentId 的响应
 */
export const connectWebSocketApi = async (request: ConnectRequest): Promise<ConnectResponse> => {

  const data  = await http.post<ConnectResponse,ConnectRequest>(API_ENDPOINTS.VERSUS.CONNECT, request)
  return data
}

