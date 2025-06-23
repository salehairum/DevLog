from flask import Flask, request, jsonify
from database import db
from flask_cors import CORS
from bson import ObjectId
from flasgger import Swagger
from datetime import datetime, timezone, timedelta
import firebase_admin
from firebase_admin import auth, credentials
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env into environment

app = Flask(__name__)
CORS(app, supports_credentials=True)
swagger = Swagger(app)

cred = credentials.Certificate("firebase-service-account.json") 
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'projectId': 'devlog-1dae6'
    })
# Use `db` to access collections:
logs_collection = db["logs"]

def serialize_log(log):
    log["_id"] = str(log["_id"])
    return log

@app.route("/login", methods=["POST"])
def login():
    """
    User login via Firebase ID token
    ---
    tags:
      - Authentication
    parameters:
      - in: header
        name: Authorization
        required: true
        description: Bearer Firebase ID token
        schema:
          type: string
          example: "Bearer eyJhbGciOiJSUzI1NiIs..."
    responses:
      200:
        description: Login successful
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Login successful
                user:
                  type: object
                  properties:
                    uid:
                      type: string
                      example: abc123uid
                    email:
                      type: string
                      example: user@example.com
                    name:
                      type: string
                      example: John Doe
      401:
        description: Unauthorized or invalid token
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: Invalid token
                details:
                  type: string
                  example: Token expired or malformed
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    id_token_str = auth_header.split(" ")[1]

    try:
        decoded_token = auth.verify_id_token(id_token_str)

        user = {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name")
        }

        return jsonify({"message": "Login successful", "user": user})

    except Exception as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 401
    
@app.route('/logs', methods=['GET'])
def get_logs():
    """
    Retrieve all dev logs
    ---
    tags:
      - Logs
    responses:
      200:
        description: A list of dev logs
        schema:
          type: array
          items:
            type: object
            properties:
              _id:
                type: string
                description: Log ID
                example: "64a1f7a2c7d9f8b123456789"
              title:
                type: string
                example: "Worked on devlog"
              date:
                type: string
                format: date
                example: "2025-06-20"
              project:
                type: string
                example: "Devlog App"
              time_taken:
                type: number
                example: 2.5
    """
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]

    try:
        # Verify Firebase ID token
        decoded_token =auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']
    except Exception as e:
        return jsonify({"error": "Invalid or expired token"}), 401
    filters = {'user_id': user_uid}

    project = request.args.get('project')
    date = request.args.get('date')  
    title = request.args.get('title')
    
    if project:
        filters['project'] = project
    if date:
        filters['date'] = date
    if title:
        filters['title'] = {'$regex': f".*{title}.*", '$options': 'i'}

    # Fetch and serialize logs
    user_logs = list(logs_collection.find(filters).sort('date', -1))
    serialized_logs = [serialize_log(log) for log in user_logs]
    return jsonify(serialized_logs), 200

@app.route('/logs/streak', methods=['GET'])
def get_logs_streak():

    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]
    print(f"Extracted token: {id_token[:20]}...")  # Print partial token for safety

    try:
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return jsonify({"error": "Invalid or expired token"}), 401

    # Parse days parameter (default 30)
    try:
        days = int(request.args.get('days', 30))
    except ValueError:
        return jsonify({"error": "Invalid 'days' parameter"}), 400

    # Calculate start date for filtering
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_date_str = start_date.strftime('%Y-%m-%d')

    filters = {
        'user_id': user_uid,
        'date': {'$gte': start_date_str}
    }

    # Project only date and time_taken fields
    projection = {
        '_id': 0,
        'date': 1,
        'time_taken': 1
    }

    try:
        logs_cursor = logs_collection.find(filters, projection).sort('date', 1)
        logs = list(logs_cursor)
    except Exception as e:
        return jsonify({"error": "Database query failed"}), 500

    # Serialize date to string if needed
    for log in logs:
        if isinstance(log.get('date'), datetime):
            log['date'] = log['date'].strftime('%Y-%m-%d')

    return jsonify(logs), 200

@app.route('/logs', methods=['POST'])
def create_log():
    """
    Create a new dev log
    ---
    tags:
      - Logs
    parameters:
      - in: body
        name: log
        schema:
          type: object
          required:
            - title
            - date
            - project
            - time_taken
          properties:
            title:
              type: string
            date:
              type: string
              format: date
            project:
              type: string
            time_taken:
              type: number
    responses:
      201:
        description: Log created
    """
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]

    try:
        # Verify Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']
    except Exception as e:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    data = request.get_json()

    required_fields = ['title', 'project', 'time_taken']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    data["date"] =datetime.now(timezone.utc).strftime("%Y-%m-%d")
    data["user_id"] = user_uid
    result = logs_collection.insert_one(data)

    # Fetch the inserted document from MongoDB
    created_log = logs_collection.find_one({"_id": result.inserted_id})
    serialized_log = serialize_log(created_log)

    return jsonify(serialized_log), 201

@app.route('/logs/<log_id>', methods=['DELETE'])
def delete_log(log_id):
    """
    Delete a dev log by ID
    ---
    tags:
      - Logs
    parameters:
      - name: log_id
        in: path
        type: string
        required: true
        description: The MongoDB ObjectId of the log to delete
    responses:
      200:
        description: Log deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Log deleted
      404:
        description: Log not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: Log not found
      400:
        description: Invalid ID or other error
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid ObjectId
    """
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]

    try:
        # Verify Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']
    except Exception as e:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    try:
        result = logs_collection.delete_one({"_id": ObjectId(log_id)})
        if result.deleted_count == 1:
            return jsonify({"message": "Log deleted"}), 200
        else:
            return jsonify({"error": "Log not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/logs/<log_id>', methods=['PATCH'])
def update_log(log_id):
    """
    Update fields of a dev log by ID
    ---
    tags:
      - Logs
    parameters:
      - name: log_id
        in: path
        type: string
        required: true
        description: The MongoDB ObjectId of the log to update
      - in: body
        name: updates
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: "Updated title"
            project:
              type: string
              example: "New Project Name"
            time_taken:
              type: number
              example: 3.0
          description: Fields to update (any subset of these)
    responses:
      200:
        description: Log updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Log updated
      400:
        description: No valid fields provided or invalid ID
        schema:
          type: object
          properties:
            error:
              type: string
              example: No valid fields provided
      404:
        description: Log not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: Log not found
    """
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split('Bearer ')[1]

    try:
        # Verify Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']
    except Exception as e:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    data = request.get_json()
    allowed_fields = {"title", "project", "time_taken"}

    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    try:
        result = logs_collection.update_one(
            {"_id": ObjectId(log_id)},
            {"$set": updates}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Log not found"}), 404

        # Fetch and return the updated document
        updated_log = logs_collection.find_one({"_id": ObjectId(log_id)})
        return jsonify(serialize_log(updated_log)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400