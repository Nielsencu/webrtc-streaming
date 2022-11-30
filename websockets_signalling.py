import asyncio
import websockets

clients = {}

async def echo(websocket):
    async for message in websocket:
        
        await websocket.send(message)

async def main():
    async with websockets.serve(echo, "localhost", 9000):
        await asyncio.Future()  # run forever

asyncio.run(main())