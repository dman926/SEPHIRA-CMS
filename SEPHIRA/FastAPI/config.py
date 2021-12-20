from pydantic import AnyHttpUrl, EmailStr
from typing import Optional, Union
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
	ALLOWED_EXTENSIONS: Union[set[str], str] = { 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'vtt' } # Set to `*` to allow all file types (not recommended)
	MAX_STREAM_CHUNK_SIZE: int = 1024 # File stream paypload size in bytes
	ENABLE_FFMPEG: bool = True # Requires ffmpeg and ffprobe to be installed and in the command path. If you aren't sure if it is set up correctly, enter `ffmpeg` and `ffprobe` in the terminal/command prompt and see if it works
	# Below settings are only used if `ENABLE_FFMPEG` is `True`
	ENABLE_FILE_PROCESSING: bool = True # If an uploaded file should be 'processed'. Depends on the type of file. For exampe, `application/x-subrip` files are converted to `text/vtt` and `video/...` files are broken into their stream components with the aid of FFMPEG
	VIDEO_EXTENSION: str = 'webm' # The file format a video file's video should be decomposed to
	AUDIO_EXTENSION: str = 'aac' # The file format a video file's audio should be decomposed to
	SUBTITLE_EXTENSION: str = 'vtt' # The file format a video file's subtitle should be decomosed to. AT THE TIME OF WRITING, ONLY VTT IS SUPPORTED BY MAJOR BROWSERS
	FORCE_DIMENSION: bool = True # Force a standard video dimension based on `VIDEO_DIMENSIONS`
	VIDEO_DIMENSIONS: list[tuple[int]] = [(3840, 2160), (2560, 1440), (1080, 720), (720, 480), (854, 480), (640, 360), (426, 240)] # A list of acceptable video dimensions. Each element is defined as (width, height) in pixels. By default, the standard YouTube dimensions are used


class CORSSettings:
	ALLOW_ORIGINS: list[AnyHttpUrl] = [
		'http://localhost:4200'
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