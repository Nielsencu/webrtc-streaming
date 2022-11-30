import os
from aiohttp import web
import sys

BASE_PATH = os.path.dirname(__file__)

async def index(request):
    content = open(os.path.join(BASE_PATH, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)


async def javascript(request):
    content = open(os.path.join(BASE_PATH, "client.js"), "r").read()
    return web.Response(content_type="application/javascript", text=content)

if __name__ == "__main__":
    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/client.js", javascript)
    web.run_app(app, host="0.0.0.0", port=int(sys.argv[1]))