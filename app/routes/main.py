import os
from flask import Blueprint, jsonify, render_template, request
from app.models.model import User, Event
from app import db
from datetime import datetime
from werkzeug.utils import secure_filename

main = Blueprint('main', __name__)

UPLOAD_FOLDER = 'app/static/images/profile'

@main.route('/')
def welcome():
    return render_template('welcome.html')

@main.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')

@main.route('/sign_in')
def sign_in():
    return render_template('sign_in.html')

@main.route('/calendar_v1')
def calendar_v1():
    return render_template('calender.html')

@main.route('/calender_v2')
def home():
    return render_template('calender_v2.html')

@main.route('/users_and_events')
def users_and_events():
    return render_template('users_and_events.html')

@main.route('/profile_setting')
def profile_setting():
    return render_template('profile_setting.html')

@main.route('/confirm_email', methods=['POST'])
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

@main.route('/register', methods=['POST'])
def register():
    user_email = request.form['user-email']
    user_pwd = request.form['user-pwd']
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
        file_path = ''
    else:
        file_name = secure_filename(user_image.filename)
        file_path = os.path.join('app/static/images/profile', file_name)
        user_image.save(file_path)
        
    user_name = request.form['user-name']
    user_description = request.form['user-description']

    new_user = User(username=user_name,
                    email=user_email,
                    password=user_pwd,
                    phone=user_phone,
                    birth=user_birth,
                    interest=user_interest,
                    work=user_work,
                    location=user_location,
                    website=user_website,
                    description=user_description,
                    image_path=file_path)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify ({
        'name': user_name
    })