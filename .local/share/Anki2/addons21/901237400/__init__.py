from aqt import mw
from aqt import gui_hooks
from PyQt5 import QtDBus, QtCore


def set_progress():
    global app_name
    due_card_count = len(mw.col.find_cards("is:new or is:due"))
    studied_card_count = len(mw.col.find_cards("rated:1"))
    divisor = studied_card_count + due_card_count
    if divisor == 0:
        progress = 1
    else:
        progress = studied_card_count / divisor
    signal = "Update"
    path = "/"
    interface = "com.canonical.Unity.LauncherEntry"
    bus = QtDBus.QDBusConnection.sessionBus()
    if not bus.isConnected():
        print("Not connected to dbus!")
    signal = QtDBus.QDBusMessage.createSignal(path, interface, signal)
    signal << "application://" + app_name + ".desktop"
    qt_due_card_count = QtCore.QVariant(due_card_count)
    qt_due_card_count.convert(QtCore.QVariant.LongLong)
    signal << {'count': qt_due_card_count, 'count-visible': True, 'progress': progress, 'progress-visible': True}
    bus.send(signal)


def send_notification():
    global app_name
    global notification_id
    global saved_due_card_count
    due_card_count = len(mw.col.find_cards("is:new or is:due"))
    to_notify = due_card_count > saved_due_card_count
    saved_due_card_count = due_card_count
    if not to_notify:
        return
    short_app_name = "Anki"
    qt_notification_id = QtCore.QVariant(notification_id)
    qt_notification_id.convert(QtCore.QVariant.UInt)
    icon = app_name
    title = "Anki"
    text = str(due_card_count) + (" card" if due_card_count == 1 else " cards") + " to study"
    actions_list = QtDBus.QDBusArgument([], QtCore.QMetaType.QStringList)
    hint = {}
    time = -1
    item = "org.freedesktop.Notifications"
    path = "/org/freedesktop/Notifications"
    interface = "org.freedesktop.Notifications"
    bus = QtDBus.QDBusConnection.sessionBus()
    if not bus.isConnected():
        print("Not connected to dbus!")
    notify = QtDBus.QDBusInterface(item, path, interface, bus)
    if notify.isValid():
        msg = notify.call(QtDBus.QDBus.AutoDetect, "Notify", short_app_name,
                          qt_notification_id, icon, title, text,
                          actions_list, hint, time)
        if msg.errorName():
            print("Failed to send notification!")
            print(msg.errorMessage())
        notification_id = msg.arguments()[0]
    else:
        print("Invalid dbus interface!")


config = mw.addonManager.getConfig(__name__)
app_name = config['app_name']  # application name is not always net.ankiweb.Anki
notification_id = 0  # we want to store notification ID to replace it if it is not closed
saved_due_card_count = 0  # we want to send notifications only if the number of due cards changes
gui_hooks.collection_did_load.append(lambda _: set_progress())
gui_hooks.reviewer_did_show_question.append(lambda _: set_progress())
gui_hooks.reviewer_will_end.append(set_progress)
gui_hooks.sync_did_finish.append(set_progress)
mw.progress.timer(60000, set_progress, True)
gui_hooks.sync_did_finish.append(send_notification)
mw.progress.timer(60000, send_notification, True)
