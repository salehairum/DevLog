from bson import ObjectId

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
    Index a newly-created log in ChromaDB.
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


def semantic_search(user_id, query, top_n=5):
    """
    Perform semantic search against ChromaDB.

    Returns a list of Mongo ObjectIds in ranked order.
    """

    query_embedding = encode(query)

    results = logs_collection.query(
        query_embeddings=[query_embedding],
        n_results=top_n,
        where={
            "user_id": user_id
        }
    )

    metadatas = results.get("metadatas", [[]])[0]

    if not metadatas:
        return []

    return [
        ObjectId(metadata["mongo_id"])
        for metadata in metadatas
    ]