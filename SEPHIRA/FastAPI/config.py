from pydantic import AnyHttpUrl, EmailStr
from typing import Optional, Union
from datetime import timedelta

# This is just for development purposes. Feel free to put the raw values in this file if people seeing them is not an issue (ie. private code base)
from secret import COINBASE_API_KEY, COINBASE_SHARED_SECRET, NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET, PAYPAL_ID, PAYPAL_SECRET, STRIPE_SK


class MongoSettings:
	CONNECT_URI: str = 'mongodb://localhost/sephira-test' # The URI of the mongo server. (mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]])


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
	ALLOWED_EXTENSIONS: Union[set[str], str] = { 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'opus', 'vtt' } # Set to `*` to allow all file types (not recommended)
	MAX_STREAM_CHUNK_SIZE: int = 1024 # File stream paypload size in bytes
	ENABLE_FFMPEG: bool = True # Requires ffmpeg and ffprobe to be installed and in the command path. If you aren't sure if it is set up correctly, enter `ffmpeg` and `ffprobe` in the terminal/command prompt and see if it works
	# Below settings are only used if `ENABLE_FFMPEG` is `True`
	ENABLE_FILE_PROCESSING: bool = True # If an uploaded file should be 'processed'. Depends on the type of file. For exampe, `video/...` files are broken into their stream components with the aid of FFMPEG
	VIDEO_EXTENSION: str = 'webm' # The file format a video file's video should be decomposed to
	VIDEO_CODEC: str = 'vp9' # The codec to use to accompany the VIDEO_EXTENSION. ex.  VIDEO_EXTENSION == 'webm' -> VIDEO_CODEC == 'vp8' or 'vp9' | VIDEO_EXTENSION == 'mp4' -> VIDEO_CODEC == 'h264'
	AUDIO_EXTENSION: str = 'aac' # The file format a video file's audio should be decomposed to
	AUDIO_CODEC: str = 'aac' # The codec to use to accompany the AUDIO_EXTENSION. ex. AUDIO_EXTENSION == 'aac' -> VIDEO_CODEC == 'aac'
	SUBTITLE_EXTENSION: str = 'vtt' # The file format a video file's subtitle should be decomosed to. AT THE TIME OF WRITING, ONLY VTT IS SUPPORTED BY MAJOR BROWSERS
	FORCE_DIMENSION: bool = True # Force a standard video dimension based on `VIDEO_DIMENSIONS`, Forcing dimensions will MASSIVELY increase media processing times for videos not a standard resolution as ffmpeg will need to downscale.
	VIDEO_DIMENSIONS: list[tuple[int]] = [(3840, 2160), (2560, 1440), (1920, 1080), (1280, 720), (854, 480), (640, 360), (426, 240)] # A list of acceptable video dimensions. Each element is defined as (width, height) in pixels. By default, the standard YouTube dimensions are used.
	CREATE_SMALLER_DIMENSIONS: bool = True # When set to True, create video files for every resolution equal to or smaller than the uploaded video file. Useful for allowing users to select different resolutions in the the video player


class CORSSettings:
	ALLOW_ORIGINS: list[AnyHttpUrl] = [
		# List front end urls here for them to be able to use FastAPI. Set to `'*'` for any url (not recommended unless you know what you're doing)
		'http://localhost:4200'
	]

class APISettings:
	ROUTE_BASE: str = '/' # There must be a leading and trailing '/'


class FastAPISettings:
	DEBUG: bool = True # You should turn this off in production


class UvicornSettings:
	USE_RELOADER: bool = True # You should most definitely set this to 'False' in production as it takes a lot of resources to use
	LOG_LEVEL: str = 'info' # It is recommended to use 'warning' in production to reduce log clutter
	PORT: int = 8000 # The port of the ASGI server. Make sure this port is available on your server
	MAX_CONTENT_SIZE: Optional[int] = None # The max post content size. Set to `None` for unlimitted (not recommended if users can upload). Should also set this in your web server (NGINX/Apache).


class ShopSettings:
	ENABLE: bool = True # Must be enabled for payment gateways to work
	CURRENCY_CODE: str = 'USD'


class StripeSettings:
	ENABLE: bool = True
	SECRET_KEY: str = STRIPE_SK # Your secret key


class PayPalSettings:
	ENABLE: bool = True
	CLIENT_ID: str = PAYPAL_ID # Your client ID
	CLIENT_SECRET: str = PAYPAL_SECRET # Your client secret
	USE_SANDBOX: bool = True # Set to `True` if you would like to test payments without actually getting charged. Remember that your client ID and client secert are different for sandbox and live accounts
	BRAND_NAME: str = 'Test Brand' # The name of your business on PayPal receipts


class CoinbaseCommerceSettings:
	ENABLE: bool = True
	API_KEY: str = COINBASE_API_KEY # Your API key
	SHARED_SECRET: str = COINBASE_SHARED_SECRET # Your webhook shared secret
	CHARGE_NAME: str = 'Test Charge' # The name of the charge


class NowPaymentsSettings:
	ENABLE: bool = True
	API_KEY: str = NOWPAYMENTS_API_KEY # Your API key
	IPN_SECRET: str = NOWPAYMENTS_IPN_SECRET # Your IPN (Instant Payment Notifications) secret
	STATUS_PING_TIME: int = 60 # Seconds between how often NOWPayments should be pinged if it is working