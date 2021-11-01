from fastapi import HTTPException

#NotImplementedError = HTTPException(status_code = 501)
#UserAlreadyExistsError = HTTPException(status_code=400, detail='User with details already exists')
class NotImplementedError(HTTPException):
	status_code = 501

class UserAlreadyExistsError(HTTPException):
	status_code = 400
	detail = 'User with details already exists'

class UnauthorizedError(HTTPException):
	status_code = 400

class MissingOtpError(HTTPException):
	status_code = 401
	detail = 'Missing otp'