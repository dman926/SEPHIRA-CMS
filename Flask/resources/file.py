from flask import jsonify, request, url_for, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from werkzeug.utils import secure_filename

from .errors import InternalServerError, SchemaValidationError, FileNotFoundError

import os

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class UploaderApi(Resource):
	'''
	Upload file and return it's filename
	'''
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
		except Exception:
			raise InternalServerError

class MediaApi(Resource):
	'''
	Get all media urls belonging to user
	'''
	@jwt_required()
	def get(self):
		mediaPath = os.path.join(current_app.config['UPLOAD_FOLDER'], get_jwt_identity())
		if os.path.isdir(mediaPath):
			_, _, filenames = next(os.walk(mediaPath))
			mappedFilenames = map(lambda file: '/assets/uploads/' + get_jwt_identity() + '/' + file, filenames)
			return jsonify(list(mappedFilenames))
		return ''

class SingleMediaApi(Resource):
	'''
	Delete file with according file name
	'''
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
		except Exception:
			raise InternalServerError