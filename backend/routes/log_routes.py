from flask import Blueprint, request, jsonify, g

from middleware.auth import firebase_required
from services import log_service

logs_bp = Blueprint("logs", __name__)


@logs_bp.route("/logs", methods=["GET"])
@firebase_required
def get_logs():

    logs = log_service.get_logs(
        user_id=g.user["uid"],
        project=request.args.get("project"),
        date=request.args.get("date"),
    )

    return jsonify(logs), 200


@logs_bp.route("/logs/streak", methods=["GET"])
@firebase_required
def get_logs_streak():

    try:
        days = int(request.args.get("days", 30))
    except ValueError:
        return jsonify({
            "error": "Invalid 'days' parameter"
        }), 400

    logs = log_service.get_logs_streak(
        g.user["uid"],
        days,
    )

    return jsonify(logs), 200


@logs_bp.route("/logs", methods=["POST"])
@firebase_required
def create_log():

    try:
        log = log_service.create_log(
            g.user["uid"],
            request.get_json()
        )

        return jsonify(log), 201

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400


@logs_bp.route("/logs/<log_id>", methods=["DELETE"])
@firebase_required
def delete_log(log_id):

    deleted = log_service.delete_log(
        g.user["uid"],
        log_id
    )

    if deleted:
        return jsonify({
            "message": "Log deleted"
        }), 200

    return jsonify({
        "error": "Log not found"
    }), 404


@logs_bp.route("/logs/<log_id>", methods=["PATCH"])
@firebase_required
def update_log(log_id):

    try:
        updated = log_service.update_log(
            g.user["uid"],
            log_id,
            request.get_json()
        )

        if updated is None:
            return jsonify({
                "error": "Log not found"
            }), 404

        return jsonify(updated), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400