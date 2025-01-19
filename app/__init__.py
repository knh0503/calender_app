from flask import Flask, redirect
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

    from app.models import User

    # login_required를 실행하기 전 사용자 정보를 조회
    # load_user에서 현재 사용자 객체를 반환하여 current_user로 설정
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # login_requried에서 로그인이 되어 있지 않을 경우 핸들링
    @login_manager.unauthorized_handler
    def unauthorized_callback():
        return redirect("/welcome")

    # 블루프린트 연결
    from app.routes.views import views
    from app.routes.api import api

    app.register_blueprint(views)
    app.register_blueprint(api)
    
    return app