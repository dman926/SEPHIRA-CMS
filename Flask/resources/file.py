from flask import jsonify, request, url_for, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from werkzeug.utils import secure_filename

from .errors import InternalServerError, SchemaValidationError, FileNotFoundError

import os
import subprocess
from threading import Thread
from time import sleep

from app import PRODUCTION

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mkv', 'webm'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mkv', 'webm'}

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def processVideo(filePath):
	filePath = os.path.abspath(filePath)
	subprocess.run(['HandBrakeCLI', '-Z', 'Web/Vimeo YouTube 720p30', '-i', filePath, '-o', filePath.rsplit('.', 1)[0] + '.mp4', '-e', 'x264', '-b', '1500'])
	if PRODUCTION:
		subprocess.run(['rm', filePath], shell=True)
	else:
		# WINDOWS USERS ONLY. Change 'del' to 'rm' or get rid of this and use the production command on linux 
		subprocess.run(['del', filePath], shell=True)

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
				# Check if it's a video file
				ext = file.filename.rsplit('.', 1)[1].lower()
				if ext in ALLOWED_VIDEO_EXTENSIONS:
					# Is a video
					Thread(target=processVideo, args=(path,)).start()
					filename = filename.rsplit('.', 1)[0] + '.mp4'
					print(filename)
				else:
					# Is an image
					# TODO: do any image compression here
					pass
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