import os
from flask import Blueprint, jsonify, render_template, request, redirect, url_for, flash
from app.models.model import User
from app import db
from flask_login import login_user, login_manager
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

api = Blueprint('api', __name__)

@api.route('/confirm_email', methods=['POST'])
def confirm_email():
    data = request.json
    user_email = data.get('userEmail')

    user = User.query.filter_by(email=user_email).first()
    if user:
        return jsonify({
            'available' : False
        })
    else:
        return jsonify({
            'available' : True
        })

@api.route('/register', methods=['POST'])
def register():
    user_email = request.form['user-email']
    user_pwd = request.form['user-pwd']
    hashed_password = generate_password_hash(user_pwd) # Hash 생성

    user_phone = request.form['user-phone']

    user_birth = request.form['user-birth']
    if (user_birth == ''):
        user_birth = None
    user_interest = request.form['user-interest']
    user_work = request.form['user-work']
    user_location = request.form['user-location']
    user_website = request.form['user-website']
    
    user_image = request.files['user-image']
    if user_image.filename == '':
        db_file_path = ''
    else:
        file_name = secure_filename(user_image.filename)
        file_path = os.path.join('app/static/images/profile', file_name)
        user_image.save(file_path)
        # db에 저장할 경로는 static 이후부터
        db_file_path = f'images/profile/{file_name}'
        
    user_name = request.form['user-name']
    user_description = request.form['user-description']

    new_user = User(username=user_name,
                    email=user_email,
                    password=hashed_password,
                    phone=user_phone,
                    birth=user_birth,
                    interest=user_interest,
                    work=user_work,
                    location=user_location,
                    website=user_website,
                    description=user_description,
                    image_path=db_file_path)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify ({
        'name': user_name
    })

@api.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        email = request.form.get('user-email')
        password = request.form.get('user-pwd')
        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user)
                return jsonify({
                    'flag' : True,
                    'message' : 'Timely에 오신걸 환영합니다!',
                })
            else:
                return jsonify({
                    'flag' : False,
                    'message' : '비밀번호를 다시 확인해주세요.',
                })
        else:
            return jsonify({
                'flag' : False,
                'message' : '이메일을 다시 확인해주세요.',
            })
    return render_template('sign_in.html')