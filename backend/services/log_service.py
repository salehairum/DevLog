from datetime import datetime, timezone, timedelta
from bson import ObjectId

from database import db
from services import vector_service
from utils.serializers import serialize_log

logs_collection = db["logs"]


def get_logs(user_id, project=None, date=None):
    filters = {"user_id": user_id}

    if project:
        filters["project"] = {
            "$regex": f".*{project}.*",
            "$options": "i"
        }

    if date:
        filters["date"] = date

    logs = list(
        logs_collection.find(filters).sort("date", -1)
    )

    return [
        serialize_log(log)
        for log in logs
    ]


def get_logs_streak(user_id, days=30):
    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=days)
    )

    filters = {
        "user_id": user_id,
        "date": {
            "$gte": start_date.strftime("%Y-%m-%d")
        }
    }

    projection = {
        "_id": 0,
        "date": 1,
        "time_taken": 1
    }

    logs = list(
        logs_collection
        .find(filters, projection)
        .sort("date", 1)
    )

    for log in logs:
        if isinstance(log.get("date"), datetime):
            log["date"] = log["date"].strftime("%Y-%m-%d")

    return logs


def create_log(user_id, data):
    required_fields = {
        "title",
        "project",
        "time_taken"
    }

    if not required_fields.issubset(data):
        raise ValueError("Missing required fields")

    data["date"] = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    data["user_id"] = user_id

    result = logs_collection.insert_one(data)

    created_log = logs_collection.find_one(
        {"_id": result.inserted_id}
    )

    vector_service.add_log(
        created_log["_id"],
        created_log["user_id"],
        created_log["title"],
    )

    return serialize_log(created_log)


def delete_log(user_id, log_id):
    result = logs_collection.delete_one({
        "_id": ObjectId(log_id),
        "user_id": user_id
    })
    if result.deleted_count == 1:
        vector_service.delete_log(log_id)
        return True

    return False

    return result.deleted_count == 1


def update_log(user_id, log_id, data):
    allowed_fields = {
        "title",
        "project",
        "time_taken"
    }

    updates = {
        k: v
        for k, v in data.items()
        if k in allowed_fields
    }

    if not updates:
        raise ValueError("No valid fields provided")

    result = logs_collection.update_one(
        {
            "_id": ObjectId(log_id),
            "user_id": user_id
        },
        {
            "$set": updates
        }
    )

    if result.matched_count == 0:
        return None

    updated = logs_collection.find_one(
        {"_id": ObjectId(log_id)}
    )

    vector_service.update_log(
        log_id=updated_log["_id"],
        user_id=updated_log["user_id"],
        text=updated_log["title"],
    )

    return serialize_log(updated)