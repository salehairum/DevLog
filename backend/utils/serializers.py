# utils/serializers.py

def serialize_log(log):
    log["_id"] = str(log["_id"])
    return log