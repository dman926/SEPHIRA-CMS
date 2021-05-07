import requests
from secret import reCAPTCHA_V3_secret

def verify_recaptcha_token(token, ip=None):
	if ip:
		payload = {
			'secret': reCAPTCHA_V3_secret,
			'response': token,
			'remoteip': ip
		}
	else:
		payload = {
			secret: reCAPTCHA_V3_secret,
			response: token
		}
	r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
	res = r.json()
	return res.get('success', None)