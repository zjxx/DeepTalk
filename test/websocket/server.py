import asyncio
import websockets
import json
from datetime import datetime

# 存储所有连接的客户端
connected_clients = set()

async def register(websocket):
    """注册新的客户端连接"""
    connected_clients.add(websocket)
    try:
        # 发送欢迎消息
        await websocket.send(json.dumps({
            "type": "system",
            "message": "欢迎连接到WebSocket服务器！",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }))
        # 广播新用户加入消息
        await broadcast({
            "type": "system",
            "message": "新用户已加入聊天室",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except websockets.exceptions.ConnectionClosed:
        pass

async def unregister(websocket):
    """注销客户端连接"""
    connected_clients.remove(websocket)
    # 广播用户离开消息
    await broadcast({
        "type": "system",
        "message": "用户已离开聊天室",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

async def broadcast(message):
    """向所有连接的客户端广播消息"""
    if connected_clients:
        message_str = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_str) for client in connected_clients]
        )

async def handle_client(websocket):
    """处理客户端连接"""
    await register(websocket)
    try:
        async for message in websocket:
            try:
                # 尝试解析JSON消息
                data = json.loads(message)
                # 广播消息给所有客户端
                await broadcast({
                    "type": "message",
                    "content": data.get("content", ""),
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            except json.JSONDecodeError:
                # 如果不是JSON格式，直接广播原始消息
                await broadcast({
                    "type": "message",
                    "content": message,
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await unregister(websocket)

async def main():
    # 启动WebSocket服务器
    server = await websockets.serve(
        handle_client,
        "0.0.0.0",
        8765,
        ping_interval=None  # 禁用ping以保持连接
    )
    print("WebSocket服务器已启动在 ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())