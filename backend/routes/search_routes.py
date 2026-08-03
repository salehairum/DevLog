from flask import Blueprint, request, jsonify, g

from middleware.auth import firebase_required
from services import search_service

search_bp = Blueprint("search", __name__)


@search_bp.route("/logs/search", methods=["POST"])
@firebase_required
def search_logs():
    """
    Semantic search logs by query text
    ---
    tags:
      - Logs
    parameters:
      - in: body
        name: search
        schema:
          type: object
          properties:
            query:
              type: string
              example: "fixed firebase auth issue"
            top_n:
              type: integer
              example: 5
    responses:
      200:
        description: List of logs matching semantically
        schema:
          type: array
          items:
            type: object
    """

    data = request.get_json()

    query = data.get("query", "").strip()
    top_n = data.get("top_n", 5)

    if not query:
        return jsonify({
            "error": "Query text is required"
        }), 400

    results = search_service.hybrid_search(
        user_id=g.user["uid"],
        query=query,
        top_n=top_n,
    )

    return jsonify(results), 200