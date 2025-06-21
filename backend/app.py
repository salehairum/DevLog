from flask import Flask
from database import db
from flask import request, jsonify
from flask_cors import CORS
from bson import ObjectId
from flasgger import Swagger
from datetime import datetime, timezone

app = Flask(__name__)

CORS(app) 

swagger = Swagger(app)

# Use `db` to access collections:
logs_collection = db["logs"]

def serialize_log(log):
    log["_id"] = str(log["_id"])
    return log

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
    logs = list(logs_collection.find())
    serialized_logs = [serialize_log(log) for log in logs]
    return jsonify(serialized_logs), 200

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
    data = request.get_json()

    required_fields = ['title', 'project', 'time_taken']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    data["date"] =datetime.now(timezone.utc).strftime("%Y-%m-%d")
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
        return jsonify({"message": "Log updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
