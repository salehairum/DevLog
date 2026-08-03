from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

from routes.auth_routes import auth_bp
from routes.log_routes import logs_bp
from routes.search_routes import search_bp


load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True)

swagger = Swagger(app)

cred = credentials.Certificate("firebase-service-account.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        cred,
        {
            "projectId": "devlog-1dae6"
        }
    )


app.register_blueprint(auth_bp)
app.register_blueprint(logs_bp)
app.register_blueprint(search_bp)


if __name__ == "__main__":
    app.run(debug=True)