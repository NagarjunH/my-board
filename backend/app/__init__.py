from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from config import Config
from app.models.base import Base

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)

    # Configure CORS for local development and production cloud deployment
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.board_routes import board_bp
    from app.routes.page_routes import page_bp
    from app.routes.share_routes import share_bp
    from app.routes.asset_routes import asset_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(board_bp)
    app.register_blueprint(page_bp)
    app.register_blueprint(share_bp)
    app.register_blueprint(asset_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "MyBoard API",
            "version": "1.0.0"
        }), 200

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    # Create tables & seed default database
    with app.app_context():
        Base.metadata.create_all(bind=engine)
        from app.services.seed_service import seed_database_if_empty
        seed_database_if_empty(db_session)

    return app
