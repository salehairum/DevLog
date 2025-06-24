from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

chroma_client = chromadb.Client(Settings(persist_directory="./chroma_persist"))

logs_collection_chroma = chroma_client.get_or_create_collection(
    name="devlog_db",
    metadata={"hnsw:space": "cosine"}
)

chroma_client.persist()

def add_log_to_chroma(log_id, text):
    embedding = embedding_model.encode(text).tolist()
    logs_collection_chroma.add(
        documents=[text],
        embeddings=[embedding],
        metadatas=[{"mongo_id": str(log_id)}],
        ids=[str(log_id)]
    )
    chroma_client.persist()
