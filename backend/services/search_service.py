from database import db

from services import vector_service
from utils.serializers import serialize_log
from config.search import DEFAULT_TOP_N, SEMANTIC_WEIGHT, KEYWORD_WEIGHT
import re

from database import db
from utils.serializers import serialize_log

def keyword_search(user_id, query):
    """
    Perform keyword search using a simple scoring algorithm.

    Scoring:
    - Exact phrase match
    - Prefix matches (fix -> fixed)
    - Multiple keyword matches
    """

    query = query.strip().lower()

    if not query:
        return []

    query_words = query.split()

    logs = list(
        db.logs.find(
            {
                "user_id": user_id,
            }
        )
    )

    results = []

    for log in logs:

        title = log.get("title", "").lower()

        score = 0

        # ----------------------------------------
        # Exact phrase match
        # ----------------------------------------
        if query in title:
            score += 5

        # ----------------------------------------
        # Individual word matching
        # ----------------------------------------
        title_words = re.findall(r"\w+", title)

        for query_word in query_words:

            for word in title_words:

                # exact word
                if word == query_word:
                    score += 3

                # prefix match
                elif word.startswith(query_word):
                    score += 2

                # substring match
                elif query_word in word:
                    score += 1

        if score == 0:
            continue

        serialized = serialize_log(log)

        # normalize score roughly to 0-1
        serialized["keyword_score"] = round(min(score / 10, 1.0), 3)

        results.append(serialized)

    results.sort(
        key=lambda x: x["keyword_score"],
        reverse=True,
    )

    return results

def semantic_search(user_id, query, top_n=DEFAULT_TOP_N):
    """
    Perform semantic search over a user's logs.
    """

    matches = vector_service.semantic_search(
        user_id=user_id,
        query=query,
        top_n=top_n,
    )

    if not matches:
        return []

    mongo_ids = [
        match["mongo_id"]
        for match in matches
    ]

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

    results = []

    for match in matches:
        mongo_id = match["mongo_id"]

        if mongo_id not in id_to_log:
            continue

        serialized = serialize_log(id_to_log[mongo_id])

        serialized["semantic_score"] = match["score"]
        serialized["semantic_distance"] = match["distance"]

        results.append(serialized)

    return results


def hybrid_search(user_id, query, top_n=DEFAULT_TOP_N):
    """
    Hybrid search combining semantic and keyword retrieval.
    """

    semantic_results = semantic_search(
        user_id=user_id,
        query=query,
        top_n=50,
    )

    keyword_results = keyword_search(
        user_id=user_id,
        query=query,
    )

    merged = {}

    #
    # Add semantic results
    #

    for log in semantic_results:

        log["keyword_score"] = 0.0

        log["hybrid_score"] = (
            SEMANTIC_WEIGHT * log["semantic_score"]
        )

        merged[log["_id"]] = log

    #
    # Merge keyword results
    #

    for log in keyword_results:

        if log["_id"] in merged:

            merged[log["_id"]]["keyword_score"] = 1.0

            merged[log["_id"]]["hybrid_score"] += (
                KEYWORD_WEIGHT
            )

        else:

            log["semantic_score"] = 0.0
            log["semantic_distance"] = None
            log["keyword_score"] = 1.0

            log["hybrid_score"] = KEYWORD_WEIGHT

            merged[log["_id"]] = log

    results = sorted(
        merged.values(),
        key=lambda x: x["hybrid_score"],
        reverse=True,
    )

    return results[:top_n]