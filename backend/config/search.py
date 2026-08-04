"""
Configuration for semantic and hybrid search.
"""

# Number of nearest neighbours to retrieve from Chroma
MAX_CANDIDATES = 50

# Number of final search results returned to the client
DEFAULT_TOP_N = 5

# Minimum cosine similarity required for a match
SIMILARITY_THRESHOLD = 0.5

SEMANTIC_WEIGHT = 0.7
KEYWORD_WEIGHT = 0.3

MODEL="BAAI/bge-small-en-v1.5"