from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()  # loads variables from .env into environment

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["devlog_db"]
