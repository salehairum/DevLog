from sentence_transformers import SentenceTransformer
import chromadb

print("Loading SentenceTransformer...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded.")

print("Connecting to ChromaDB...")
chroma_client = chromadb.PersistentClient(
    path="./chroma_persist"
)

logs_collection = chroma_client.get_or_create_collection(
    name="devlog_db",
    metadata={
        "hnsw:space": "cosine"
    }
)