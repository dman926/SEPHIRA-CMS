'''
Create Python Exceptions to encompass server and DB errors
'''

from app import app

class InternalServerError(Exception):
	message = 'Internal Server Error'
	code = '500'

class SchemaValidationError(Exception):
	message = 'Schema Validation Error'
	code = '400'

class EmailAlreadyExistsError(Exception):
	message = 'Email Already Exists Error'
	code = '400'

class PostAlreadyExistsError(Exception):
	message = 'Post Already Exists Error'
	code = '400'

class UnauthorizedError(Exception):
	message = 'Unauthorized Error'
	code = '401'

class EmailDoesnotExistsError(Exception):
	message = 'Email Does Not Exist Error'
	code = '400'

class BadTokenError(Exception):
	message = 'Bad Token Error'
	code = '403'

class FileNotFoundError(Exception):
	message = 'File Not Found Error'
	code = '404'

class ResourceNotFoundError(Exception):
	message = 'Resource Not Found Error'
	code = '404'

class MissingOtpError(Exception):
	message = 'Missing OTP Error'
	code = '401'

class OutOfStockError(Exception):
	message = 'Out Of Stock Error'
	code = '409'

@app.errorhandler(InternalServerError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(SchemaValidationError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(EmailAlreadyExistsError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(UnauthorizedError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(EmailDoesnotExistsError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(BadTokenError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(FileNotFoundError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(ResourceNotFoundError)
def handle_(error):
	return {'message': error.message}, error.code

@app.errorhandler(MissingOtpError)
def handle_MissingOtpError(error):
	return {'message': error.message}, error.code

@app.errorhandler(OutOfStockError)
def handle_OutOfStockError(error):
	return {'message': error.message}, error.code