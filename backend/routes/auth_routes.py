from flask import Blueprint, jsonify, g

from middleware.auth import firebase_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
@firebase_required
def login():

    return jsonify({
        "message": "Login successful",
        "user": g.user
    })