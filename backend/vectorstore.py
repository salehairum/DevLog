from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

print("Loading ChromaDB and SentenceTransformer...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded.")

chroma_client = chromadb.PersistentClient(path="./chroma_persist")

logs_collection_chroma = chroma_client.get_or_create_collection(
    name="devlog_db",
    metadata={"hnsw:space": "cosine"}
)

def add_log_to_chroma(log_id, text):
    embedding = embedding_model.encode(text).tolist()
    logs_collection_chroma.add(
        documents=[text],
        embeddings=[embedding],
        metadatas=[{"mongo_id": str(log_id)}],
        ids=[str(log_id)]
    )
