'''
Asynchronous Tasks
'''
from .order import removeExpiredOrders

def initialize_tasks(scheduler):
	#scheduler.add_job(id='Remove Expired Orders', func=removeExpiredOrders, trigger='interval', seconds=5)
	pass