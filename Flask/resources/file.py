'''
File Endpoints
'''

from flask import jsonify, request, url_for, current_app
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from werkzeug.utils import secure_filename

from .errors import InternalServerError, SchemaValidationError, FileNotFoundError

import os

from services.logging_service import writeWarningToLog

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class UploaderApi(Resource):
	'''
	Upload file and return it's filename
	'''
	@swagger.doc({
		'tags': ['File IO'],
		'description': 'Upload a file to this users media folder.',
		'parameters': [
			{
				'name': 'file',
				'description': 'The file to upload.',
				'in': 'body',
				'type': 'file',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The location of the file',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			if 'file' not in request.files:
				raise SchemaValidationError
			file = request.files['file']
			if file.filename == '':
				raise SchemaValidationError
			if file and allowed_file(file.filename):
				filename = secure_filename(file.filename)
				# Make sure upload folder exists
				path = current_app.config['UPLOAD_FOLDER']
				if not os.path.isdir(path):
					os.mkdir(path)
				# Make sure the users folder exists inside upload folder
				path = os.path.join(current_app.config['UPLOAD_FOLDER'], get_jwt_identity())
				if not os.path.isdir(path):
					os.mkdir(path)
				path = os.path.join(current_app.config['UPLOAD_FOLDER'], get_jwt_identity(), filename)
				# Handle filename collisions
				if os.path.isfile(path):
					counter = 2
					pathSplit = path.rsplit('.', 1)
					newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
					while os.path.isfile(newPath):
						counter += 1
						newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
					path = newPath
					filenameSplit = filename.rsplit('.', 1)
					filename = filenameSplit[0] + '_' + str(counter) + '.' + filenameSplit[1]
				file.save(path)
				# TODO: do compression/thumbnails here
				return 'uploads/' + get_jwt_identity() + '/' + filename, 200
			raise SchemaValidationError
		except SchemaValidationError:
			raise SchemaValidationError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.file.UploaderApi post', e)
			raise InternalServerError

class MediaApi(Resource):
	@swagger.doc({
		'tags': ['File IO'],
		'description': 'Get all media urls belonging to user',
		'responses': {
			'200': {
				'description': 'An array of file locations',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			mediaPath = os.path.join(current_app.config['UPLOAD_FOLDER'], get_jwt_identity())
			if os.path.isdir(mediaPath):
				_, _, filenames = next(os.walk(mediaPath))
				mappedFilenames = map(lambda file: '/assets/uploads/' + get_jwt_identity() + '/' + file, filenames)
				return jsonify(list(mappedFilenames))
			return ''
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.file.MediaApi get', e)
			raise InternalServerError

class SingleMediaApi(Resource):
	@swagger.doc({
		'tags': ['File IO'],
		'description': 'Delete file according to filename',
		'parameters': [
			{
				'name': 'Filename',
				'description': 'The filename',
				'in': 'path',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'File deleted',
			}
		}
	})
	@jwt_required()
	def delete(self, filename):
		try:
			mediaFolderPath = os.path.join(current_app.config['UPLOAD_FOLDER'], get_jwt_identity())
			mediaPath = os.path.join(mediaFolderPath, filename)
			if os.path.isdir(mediaFolderPath) and os.path.isfile(mediaPath):
				os.remove(mediaPath)
				return 'ok', 200
			raise FileNotFoundError
		except FileNotFoundError:
			raise FileNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.file.SingleMediaApi get', e)
			raise InternalServerError