import types
from aqt.sound import mpvManager

def ensure_running(self):
	pass

_command = mpvManager.command

def command(self, *args, timeout=1):
	try:
		_command(*args)
	except Exception as e:
		print('Exception:', str(e))

mpvManager.ensure_running = types.MethodType(ensure_running, mpvManager)
mpvManager.command = types.MethodType(command, mpvManager)
