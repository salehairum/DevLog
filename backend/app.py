from flask import Flask
from database import db

app = Flask(__name__)

# Use `db` to access collections:
logs_collection = db["logs"]
