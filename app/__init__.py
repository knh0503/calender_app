from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 데이터 베이스 연결
    db.init_app(app)

    # 로그인 관리 
    login_manager.init_app(app)

    # load_user 콜백 함수
    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # 블루프린트 연결
    from app.routes.views import views
    from app.routes.api import api

    app.register_blueprint(views)
    app.register_blueprint(api)
    
    return app