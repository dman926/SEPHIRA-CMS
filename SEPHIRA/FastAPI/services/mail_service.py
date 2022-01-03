from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from config import MailSettings

from os import path

_conf = ConnectionConfig(
	MAIL_USERNAME=MailSettings.MAIL_USERNAME,
	MAIL_PASSWORD=MailSettings.MAIL_PASSWORD,
	MAIL_SERVER=MailSettings.MAIL_SERVER,
	MAIL_PORT=MailSettings.MAIL_PORT,
	MAIL_TLS=MailSettings.MAIL_TLS,
	MAIL_SSL=MailSettings.MAIL_SSL,
	MAIL_FROM=MailSettings.MAIL_FROM,
	MAIL_FROM_NAME=MailSettings.MAIL_NICENAME,
	USE_CREDENTIALS=True,
	TEMPLATE_FOLDER=path.join(path.dirname(__file__), '..', 'templates', 'email')
)

async def send_email_async(subject: str, recipients: list[EmailStr], template: str, body: dict = {}, attachments: list[dict] = []):
	message = MessageSchema(
		subject=subject,
		recipients=recipients,
		template_body=body,
		subtype='html',
		attachments=attachments
	)

	fm = FastMail(_conf)

	await fm.send_message(message, template_name=template)

def send_email_backround(background_tasks: BackgroundTasks, subject: str, recipients: list[EmailStr], template: str, body: dict, attachments: list[dict] = []):
	message = MessageSchema(
		subject=subject,
		recipients=recipients,
		template_body=body,
		subtype='html',
		attachments=attachments
	)

	fm = FastMail(_conf)

	background_tasks.add_task(fm.send_message, message, template_name=template)