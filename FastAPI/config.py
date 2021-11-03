from pydantic import AnyHttpUrl
from datetime import timedelta
from os import path


class MongoSettings:
	CONNECT_URI: str = 'mongodb://localhost/sephira-test'


class MailSettings:
	MAIL_SERVER: str
	MAIL_PORT: int
	MAIL_USERNAME: str
	MAIL_PASSWORD: str


class OAuth2Settings:
	JWT_SECRET_KEY: str = 'super-secret' # MAKE SURE TO CHANGE THIS FOR PRODUCTION
	DEFAULT_ACCESS_TOKEN_EXPIRES_MINUTES: timedelta = timedelta(days=1)
	DEFAULT_REFRESH_TOKEN_EXPIRES_MINUTES: timedelta = timedelta(days=7)
	ALGORITHM: str = 'HS256' # Don't change this unless you know what you're doing
	TOKEN_URL: str = 'auth/login' # Don't change this unless you change the login route for some reason


class UploadSettings:
	UPLOAD_FOLDER: str = path.join(path.dirname(__file__), '..', 'Angular', 'src', 'assets', 'uploads')


class CORSSettings:
	ALLOW_ORIGINS: list[AnyHttpUrl] = [
		'*'
	]


class APISettings:
	ROUTE_BASE: str = '/api/' # There must be a leading and trailing '/'


class UvicornSettings:
	USE_RELOADER: bool = True # You should most definitely set this to 'False' in production as it takes a lot of resources to use
	LOG_LEVEL: str = 'info' # It is recommended to use 'warning' in production to reduce log clutter

#########################
# SETTING INSTANTIATION #
#########################

MONGO_SETTINGS = MongoSettings()
MAIL_SETTINGS = MailSettings()
OAUTH2_SETTINGS = OAuth2Settings()
UPLOAD_SETTINGS = UploadSettings()
CORS_SETTINGS = CORSSettings()
API_SETTINGS = APISettings()
UVICORN_SETTINGS = UvicornSettings()