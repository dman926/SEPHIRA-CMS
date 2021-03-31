'''
API Endpoints
'''

from .auth import SignupApi, LoginApi, ForgotPassword, ResetPassword, TokenRefresh, CheckPassword, UserApi
from .card import CardsApi, CardApi
from .file import UploaderApi, MediaApi, SingleMediaApi

def initialize_routes(api, base):
	api.add_resource(SignupApi, base + 'auth/signup')
	api.add_resource(LoginApi, base + 'auth/login')
	api.add_resource(ForgotPassword, base + 'auth/forgot')
	api.add_resource(ResetPassword, base + 'auth/reset')
	api.add_resource(TokenRefresh, base + 'auth/refresh')
	api.add_resource(CheckPassword, base + 'auth/checkPassword')
	api.add_resource(UserApi, base + 'auth/user')

	api.add_resource(CardsApi, base + 'card/cards')
	api.add_resource(CardApi, base + 'card/card/<id>')

	api.add_resource(UploaderApi, base + 'file/uploader')
	api.add_resource(MediaApi, base + 'file/media')
	api.add_resource(SingleMediaApi, base + 'file/media/<filename>')