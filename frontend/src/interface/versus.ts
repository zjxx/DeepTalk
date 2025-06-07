
export interface ConnectResponse {
    sessionId: string
    opponentId: string
  }
  
  // WebSocket 连接请求接口
  export interface ConnectRequest {
    userId: string
  }