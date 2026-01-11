from executors.pubsub import publish

def async_execute(payload):
    return publish(payload)
