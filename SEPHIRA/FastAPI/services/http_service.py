from httpx import AsyncClient, Response, Timeout
from typing import Literal, Optional
from pydantic import HttpUrl

async def request(method: Literal['GET', 'OPTIONS', 'HEAD', 'POST', 'PUT', 'PAtCH', 'DELETE'], url: HttpUrl, params: Optional[dict]=None, content: Optional[dict]=None, data: Optional[dict]=None, files: Optional[dict]=None, json: Optional[dict]=None, headers: Optional[dict]=None, cookies: Optional[dict]=None) -> Response:
	async with AsyncClient(timeout=Timeout(10.0, connect=60.0, read=60.0)) as client:
		return await client.request(method=method, url=url, params=params, content=content, data=data, files=files, json=json, headers=headers, cookies=cookies)

