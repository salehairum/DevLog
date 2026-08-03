from bson import ObjectId

from config.search import (
    MAX_CANDIDATES,
    SIMILARITY_THRESHOLD,
)

from vectorstore import (
    embedding_model,
    logs_collection,
)

def encode(text):
    """
    Generate an embedding for a piece of text.
    """
    return embedding_model.encode(text).tolist()


def add_log(log_id, user_id, text):
    """
    Index a log in ChromaDB.
    """

    embedding = encode(text)

    logs_collection.add(
        ids=[str(log_id)],
        documents=[text],
        embeddings=[embedding],
        metadatas=[
            {
                "mongo_id": str(log_id),
                "user_id": str(user_id),
            }
        ],
    )


def delete_log(log_id):
    """
    Remove a log from ChromaDB.
    """

    logs_collection.delete(
        ids=[str(log_id)]
    )


def update_log(log_id, user_id, text):
    """
    Update a log embedding.

    Chroma supports update(), but delete()+add()
    is simple and works everywhere.
    """

    delete_log(log_id)

    add_log(
        log_id=log_id,
        user_id=user_id,
        text=text,
    )

def semantic_search(user_id, query, top_n=5):
    """
    Perform semantic search against ChromaDB.

    Returns only matches whose similarity score exceeds
    SIMILARITY_THRESHOLD.
    """

    query_embedding = encode(query)

    results = logs_collection.query(
        query_embeddings=[query_embedding],
        n_results=MAX_CANDIDATES,
        where={
            "user_id": user_id,
        },
        include=[
            "metadatas",
            "distances",
        ],
    )

    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    if not metadatas:
        return []

    matches = []

    for metadata, distance in zip(metadatas, distances):

        score = 1.0 - float(distance)

        if score < SIMILARITY_THRESHOLD:
            continue

        matches.append({
            "mongo_id": ObjectId(metadata["mongo_id"]),
            "distance": float(distance),
            "score": round(score, 4),
        })

    return matches[:top_n]