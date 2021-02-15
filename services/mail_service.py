'''
Emailing service
'''

from threading import Thread
from flask_mail import Message

import app

def send_async_email(app, msg):
    with app.app.app_context():
        try:
            app.mail.send(msg)
        except ConnectionRefusedError:
            raise InternalServerError("[MAIL SERVER] not working")


def send_email(subject, sender, recipients, text_body, html_body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    Thread(target=send_async_email, args=(app.app, msg)).start()