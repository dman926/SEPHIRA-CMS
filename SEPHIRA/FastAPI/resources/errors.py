from fastapi import HTTPException
from typing import Optional


class NotImplementedError(Exception):
	def __init__(self, detail: Optional[str] = ''):
		self.detail = detail
		self.http_exception = HTTPException(status_code=self.status_code, detail=self.detail)

	status_code = 501


class UserAlreadyExistsError(Exception):
	status_code = 400
	detail = 'User with details already exists'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class UnauthorizedError(Exception):
	def __init__(self, detail: Optional[str] = ''):
		self.detail = detail
		print(self.detail)
		self.http_exception = HTTPException(status_code=self.status_code, detail=self.detail)

	status_code = 400


class MissingOtpError(Exception):
	status_code = 401
	detail = 'Missing otp'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class SchemaValidationError(Exception):
	status_code = 400
	detail = 'Schmea Validation Error'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class NotFoundError(Exception):
	def __init__(self, detail: Optional[str] = ''):
		self.detail = detail
		self.http_exception = HTTPException(status_code=self.status_code, detail=self.detail)

	status_code = 404


class InvalidPostTypeError(Exception):
	status_code = 422
	detail = 'Invalid Post Type'
	http_exception = HTTPException(status_code=status_code, detail=detail)