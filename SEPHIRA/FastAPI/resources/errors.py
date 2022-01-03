from fastapi import HTTPException
from typing import Optional


class NotImplementedError(Exception):
	def __init__(self, detail: Optional[str] = ''):
		self.detail = detail
		self.http_exception = HTTPException(status_code=self.status_code, detail=self.detail)

	status_code = 501


class UserAlreadyExistsError(Exception):
	status_code = 409
	detail = 'User with details already exists'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class UnauthorizedError(Exception):
	def __init__(self, detail: Optional[str] = ''):
		self.detail = detail
		self.http_exception = HTTPException(status_code=self.status_code, detail=self.detail)

	status_code = 401


class MissingOtpError(Exception):
	status_code = 401
	detail = 'Missing otp'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class NotVerifiedError(Exception):
	status_code = 401
	detail = 'Not verified'
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


class AlreadyExistsError(Exception):
	status_code = 409
	detail = 'Item with given details already exists'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class MediaProcessingError(Exception):
	status_code = 422
	detail = 'There was an error processing the media file'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class ServiceUnavailableError(Exception):
	status_code = 503
	detail = 'The requested service is unavailable'
	http_exception = HTTPException(status_code=status_code, detail=detail)


class OutOfStockError(Exception):
	status_code = 409
	detail = 'A requested item is out of stock'
	http_exception = HTTPException(status_code=status_code, detail=detail)