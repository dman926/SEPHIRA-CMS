from app import app

def writeWarningToLog(message, err):
	app.logger.warning(message + ': ' + str(err))