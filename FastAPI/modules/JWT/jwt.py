from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import jwt
from jose.jwt import JWTError, ExpiredSignatureError, JWTClaimsError
from datetime import datetime, timedelta

from config import OAUTH2_SETTINGS, API_SETTINGS

##########
# SCHEMAS #
##########

class Token(BaseModel):
	def __init__(self, sub: str, exp: datetime, iat: datetime, refresh: Optional[bool] = False):
		self.sub = sub
		self.exp = exp
		self.iat = iat
		self.refresh = refresh

#################
# FUNCTIONALITY #
#################

OAuth2 = OAuth2PasswordBearer(tokenUrl=API_SETTINGS.ROUTE_BASE + OAUTH2_SETTINGS.TOKEN_URL)

def _create_token(identity: str, expires_delta: timedelta, refresh: bool) -> str:
	now = datetime.utcnow()
	to_encode = {
		'sub': identity,
		'exp': now + expires_delta,
		'iat': now,
		'refresh': refresh,
	}
	return jwt.encode(to_encode, OAUTH2_SETTINGS.JWT_SECRET_KEY, algorithm=OAUTH2_SETTINGS.ALGORITHM)

def create_access_token(identity: str, expires_delta: timedelta = OAUTH2_SETTINGS.DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES) -> str:
	return _create_token(identity, expires_delta, False)

def create_refresh_token(identity: str, expires_delta: timedelta = OAUTH2_SETTINGS.DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES) -> str:
	return _create_token(identity, expires_delta, True)

def decode_token(token: str = Depends(OAuth2)) -> Token:
	try:
		return jwt.decode(token, OAUTH2_SETTINGS.JWT_SECRET_KEY, algorithms=[OAUTH2_SETTINGS.ALGORITHM])
	except JWTError:
		raise HTTPException(
			status_code = 401,
			detail = 'Invalid signature',
			headers={"WWW-Authenticate": "Bearer"}
		)
	except ExpiredSignatureError:
		raise HTTPException(
			status_code = 401,
			detail = 'Signature has expired',
			headers={"WWW-Authenticate": "Bearer"}
		)
	except JWTClaimsError as e:
		raise HTTPException(
			status_code = 401,
			detail = str(e),
			headers={"WWW-Authenticate": "Bearer"}
		)

def get_jwt_identity() -> str:
	return decode_token()['sub']