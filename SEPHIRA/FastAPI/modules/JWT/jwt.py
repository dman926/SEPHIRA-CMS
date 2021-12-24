from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import jwt
from jose.jwt import JWTError, ExpiredSignatureError, JWTClaimsError
from datetime import datetime, timedelta

from config import OAuth2Settings, APISettings

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

OAuth2 = OAuth2PasswordBearer(tokenUrl=APISettings.ROUTE_BASE + OAuth2Settings.TOKEN_URL)
OAuth2_optional = OAuth2PasswordBearer(tokenUrl=APISettings.ROUTE_BASE + OAuth2Settings.TOKEN_URL, auto_error=False)

def _create_token(identity: str, expires_delta: timedelta, refresh: bool) -> str:
	now = datetime.utcnow()
	to_encode = {
		'sub': identity,
		'exp': now + expires_delta,
		'iat': now,
		'refresh': refresh,
	}
	return jwt.encode(to_encode, OAuth2Settings.JWT_SECRET_KEY, algorithm=OAuth2Settings.ALGORITHM)

def create_access_token(identity: str, expires_delta: timedelta = OAuth2Settings.DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES) -> str:
	return _create_token(identity, expires_delta, False)

def create_refresh_token(identity: str, expires_delta: timedelta = OAuth2Settings.DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES) -> str:
	return _create_token(identity, expires_delta, True)

def decode_token(token: str) -> Token:
	try:
		return jwt.decode(token, OAuth2Settings.JWT_SECRET_KEY, algorithms=[OAuth2Settings.ALGORITHM])
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

def get_raw_token(token: str = Depends(OAuth2)) -> Token:
	return decode_token(token)

def get_jwt_identity(token: str = Depends(OAuth2)) -> str:
	return decode_token(token)['sub']

def get_jwt_identity_optional(token: Optional[str] = Depends(OAuth2_optional)) -> Optional[str]:
	if token:
		return decode_token(token)['sub']
	return None