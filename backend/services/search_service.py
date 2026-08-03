from database import db

from services import vector_service
from utils.serializers import serialize_log


def semantic_search(user_id, query, top_n=5):
    """
    Perform semantic search over a user's logs.
    """

    mongo_ids = vector_service.semantic_search(
        user_id=user_id,
        query=query,
        top_n=top_n,
    )

    if not mongo_ids:
        return []

    mongo_logs = list(
        db.logs.find(
            {
                "_id": {"$in": mongo_ids},
                "user_id": user_id,
            }
        )
    )

    id_to_log = {
        log["_id"]: log
        for log in mongo_logs
    }

    ordered_logs = [
        id_to_log[oid]
        for oid in mongo_ids
        if oid in id_to_log
    ]

    return [
        serialize_log(log)
        for log in ordered_logs
    ]