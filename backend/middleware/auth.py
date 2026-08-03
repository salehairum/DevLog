from functools import wraps
from flask import request, jsonify, g
import firebase_admin
from firebase_admin import auth


def firebase_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "Missing or invalid Authorization header"
            }), 401

        id_token = auth_header.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)

            g.user = {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
            }

        except Exception:
            return jsonify({
                "error": "Invalid or expired token"
            }), 401

        return fn(*args, **kwargs)

    return wrapper