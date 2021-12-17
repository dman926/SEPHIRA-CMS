from pydantic import AnyHttpUrl, EmailStr
from typing import Optional
from datetime import timedelta

# This is just for development purposes. Feel free to put the raw values in this file if people seeing them is not an issue (ie. private code base)
from secret import COINBASE_API_KEY, COINBASE_SHARED_SECRET, PAYPAL_ID, PAYPAL_SECRET, STRIPE_SK


class MongoSettings:
	CONNECT_URI: str = 'mongodb://localhost/sephira-test'


class MailSettings:
	MAIL_SERVER: str = ''
	MAIL_PORT: int = 0
	MAIL_TLS: bool = False
	MAIL_SSL: bool = False
	MAIL_USERNAME: str = ''
	MAIL_PASSWORD: str = ''
	MAIL_FROM: EmailStr = 'sephira@sephira.org'


class OAuth2Settings:
	JWT_SECRET_KEY: str = 'super-secret' # MAKE SURE TO CHANGE THIS FOR PRODUCTION
	DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES: timedelta = timedelta(days=1)
	DEFAULT_REFRESH_TOKEN_EXPIRES_MINUTES: timedelta = timedelta(days=7)
	ALGORITHM: str = 'HS256' # Don't change this unless you know what you're doing
	TOKEN_URL: str = 'auth/docs-login' # Don't change this unless you change the login route for some reason


class FileSettings:
	ALLOWED_EXTENSIONS: set[str] = { 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm' }
	MAX_STREAM_CHUNK_SIZE: int = 14 * 1024 # File stream paypload size in bytes


class CORSSettings:
	ALLOW_ORIGINS: list[AnyHttpUrl] = [
		'*'
	]


class APISettings:
	ROUTE_BASE: str = '/' # There must be a leading and trailing '/'


class FastAPISettings:
	DEBUG: bool = True # You should turn this off in production


class UvicornSettings:
	USE_RELOADER: bool = True # You should most definitely set this to 'False' in production as it takes a lot of resources to use
	LOG_LEVEL: str = 'info' # It is recommended to use 'warning' in production to reduce log clutter
	PORT: int = 8000
	MAX_CONTENT_SIZE: Optional[int] = None # The max post content size. Set to `None` for unlimitted (not recommended if users can upload). Should also set this in your web server.


class ShopSettings:
	ENABLE: bool = True # Must be enabled for payment gateways to work


class CoinbaseCommerceSettings:
	ENABLE: bool = True
	API_KEY: str = COINBASE_API_KEY
	SHARED_SECRET: str = COINBASE_SHARED_SECRET
	CHARGE_NAME: str = 'Test Charge'
	CHARGE_DESCRIPTION: str = 'Test Description'


class PayPalSettings:
	ENABLE: bool = True
	CLIENT_ID: str = PAYPAL_ID
	CLIENT_SECRET: str = PAYPAL_SECRET
	USE_SANDBOX: bool = True
	BRAND_NAME: str = 'Test Brand'


class StripeSettings:
	ENABLE: bool = True
	SECRET_KEY: str = STRIPE_SK