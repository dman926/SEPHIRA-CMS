from flask import request
from flask_restful_swagger_2 import Resource, swagger

from services.recaptcha_service import verify_recaptcha_token

class TestRecaptchaApi(Resource):
	@swagger.doc({
		'tags': ['ReCATPCHA', 'Test'],
		'description': 'Verify a recaptcha token',
		'responses': {
			'200': {
				'description': 'If the recaptcha verified',
			}
		}
	})
	def post(self):
		return verify_recaptcha_token(request.get_json().get('token'), request.remote_addr)