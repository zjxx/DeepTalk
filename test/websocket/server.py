import asyncio
import websockets
import json
from datetime import datetime
from typing import Dict, Set

# 存储所有连接的客户端
connected_clients: Dict[str, websockets.WebSocketServerProtocol] = {}

async def register(websocket: websockets.WebSocketServerProtocol, user_id: str, user_name: str):
    """注册新的客户端连接"""
    connected_clients[user_id] = websocket
    try:
        # 发送欢迎消息
        await websocket.send(json.dumps({
            "type": "system",
            "message": "欢迎连接到语音聊天室！",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }))
        
        # 广播新用户加入消息
        await broadcast({
            "type": "user_join",
            "userId": user_id,
            "userName": user_name,
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except websockets.exceptions.ConnectionClosed:
        pass

async def unregister(user_id: str, user_name: str):
    """注销客户端连接"""
    if user_id in connected_clients:
        del connected_clients[user_id]
        # 广播用户离开消息
        await broadcast({
            "type": "user_leave",
            "userId": user_id,
            "userName": user_name,
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

async def broadcast(message: dict):
    """向所有连接的客户端广播消息"""
    if connected_clients:
        message_str = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_str) for client in connected_clients.values()]
        )

async def handle_client(websocket: websockets.WebSocketServerProtocol):
    """处理客户端连接"""
    user_id = None
    user_name = None
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                message_type = data.get("type")
                
                if message_type == "user_join":
                    user_id = data.get("userId")
                    user_name = data.get("userName")
                    if user_id and user_name:
                        await register(websocket, user_id, user_name)
                
                elif message_type == "voice":
                    # 广播语音数据给其他用户
                    if user_id:
                        await broadcast({
                            "type": "voice",
                            "userId": user_id,
                            "audioData": data.get("audioData"),
                            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })
                
            except json.JSONDecodeError:
                print(f"收到非JSON消息: {message}")
                continue
                
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        if user_id and user_name:
            await unregister(user_id, user_name)

async def main():
    # 启动WebSocket服务器
    server = await websockets.serve(
        handle_client,
        "0.0.0.0",
        8765,
        ping_interval=None  # 禁用ping以保持连接
    )
    print("语音聊天服务器已启动在 ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())