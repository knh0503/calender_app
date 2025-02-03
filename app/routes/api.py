import os
from flask import Blueprint, jsonify, render_template, request, redirect, url_for, flash
from app.models.model import User, Event
from app import db
from flask_login import login_user, login_required, current_user, logout_user
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime

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
        if current_user.is_authenticated:
            logout_user()

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

@api.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('views.welcome'))

@api.route('/delete_account', methods=['POST'])
@login_required
def delete_account():
    user = current_user
    db.session.delete(user)
    db.session.commit()
    logout_user()
    return redirect(url_for('views.welcome'))

@api.route('/update_profile', methods=['POST','GET'])
@login_required
def update_profile():
    user = current_user

    if request.method == 'POST':
        user_name = request.form['user-name']
        user_description = request.form['user-description']
        user_birth = request.form['user-birth']
        if (user_birth == ''):
            user_birth = None
        user_interests = request.form['user-interests']
        user_work = request.form['user-work']
        user_location = request.form['user-location']
        user_website = request.form['user-website']
        user_image = request.files['user-image']
        # 프로필 사진이 변경될 때만 db에 수정된 경로 저장
        if user_image.filename != '':
            file_name = secure_filename(user_image.filename)
            file_path = os.path.join('app/static/images/profile', file_name)
            user_image.save(file_path)
            # db에 저장할 경로는 static 이후부터
            db_file_path = f'images/profile/{file_name}'
            user.image_path = db_file_path

        user.username = user_name
        user.description = user_description
        user.birth = user_birth
        user.interest = user_interests
        user.work = user_work
        user.location = user_location
        user.website = user_website
        
        db.session.commit()

        return jsonify ({
            'message': '프로필이 업데이트되었습니다.',
        })
    return render_template('proflie_setting.html')

@api.route('/change_password', methods=['POST','GET'])
@login_required
def change_password():
    user = current_user

    if request.method == 'POST':
        current_password = request.form['current-password']
        new_password = request.form['new-password']
        confirm_password = request.form['confirm-password']

        if new_password != confirm_password:
            return jsonify({
                'flag' : False,
                'message' : '새 비밀번호와 새 비밀번호 확인이 다릅니다.',
            })
        
        if check_password_hash(user.password, current_password):
            user.password = generate_password_hash(new_password)
            db.session.commit()
            return jsonify({
                'flag' : True,
                'message' : '성공적으로 비밀번호를 변경하였습니다.',
            })
        
        else:            
            return jsonify({
                'flag' : False,
                'message' : '현재 비밀번호가 다릅니다.',
            })

    return render_template('account_setting.html')

@api.route('/change_email', methods=['POST','GET'])
@login_required
def change_email():

    if request.method == 'POST':
        user_email = request.form['user-email']

        userExist = User.query.filter_by(email=user_email).first()
        if userExist:
            return jsonify({
                'available' : False,
                'message' : "이미 등록된 이메일입니다.",
            })
        else:
            current_user.email = user_email
            db.session.commit()
            return jsonify({
                'available' : True,
                'message' : '이메일 주소를 새로 등록하였습니다.',
                'email' : user_email,
            })
    return render_template('account_setting.html')

@api.route('/change_phone', methods=['POST','GET'])
@login_required
def change_phone():

    if request.method == 'POST':
        user_phone = request.form['user-phone']

        current_user.phone = user_phone
        db.session.commit()
        return jsonify({
            'available' : True,
            'message' : '휴대폰 번호를 새로 등록하였습니다.',
            'phone' : user_phone,
        })
    return render_template('account_setting.html')

@api.route('/add_event', methods=['POST'])
def add_event():
    title = request.form['eventTitle']
    allDay = request.form.get('allDay', False)
    if allDay:
        allDay = True
        startDate = datetime.strptime(request.form['startDate'], '%Y-%m-%d').replace(hour=0, minute=0)
        endDate = datetime.strptime(request.form['endDate'], '%Y-%m-%d').replace(hour=0, minute=0)
    else:
        allDay = False
        startDate = datetime.strptime(f"{request.form['startDate']} {request.form['startTime']}", '%Y-%m-%d %H:%M')
        endDate = datetime.strptime(f"{request.form['startDate']} {request.form['endTime']}", '%Y-%m-%d %H:%M')
    
    description = request.form['description']
    category = request.form['category']
    location = request.form['location']
    file = request.files['file']
    if file.filename == '':
        db_file_path = ''
    else:
        file_name = secure_filename(file.filename)
        file_path = os.path.join('app/static/images/calendar', file_name)
        file.save(file_path)
        # db에 저장할 경로는 static 이후부터
        db_file_path = f'images/calendar/{file_name}'
    alarm = request.form['alarm']
    color = request.form['color']

    event = Event(title=title,
                  description=description,
                  start_date=startDate,
                  end_date=endDate,
                  user_id=current_user.id,
                  category=category,
                  location=location,
                  file=db_file_path,
                  alarm=alarm,
                  color=color,
                  all_day = allDay
                  )
    
    db.session.add(event)
    db.session.commit()

    return jsonify ({
        'title': title,
        'date' : f"{startDate} ~ {endDate}",
        'message' : f"{title} on {startDate} ~ {endDate}",
    })

@api.route('/update_event', methods=['POST'])
def update_event():
    id = request.form['eventID']
    title = request.form['eventTitle']
    allDay = request.form.get('allDay', False)
    if allDay:
        allDay = True
        startDate = datetime.strptime(request.form['startDate'], '%Y-%m-%d').replace(hour=0, minute=0)
        endDate = datetime.strptime(request.form['endDate'], '%Y-%m-%d').replace(hour=0, minute=0)
    else:
        allDay = False
        startDate = datetime.strptime(f"{request.form['startDate']} {request.form['startTime']}", '%Y-%m-%d %H:%M')
        endDate = datetime.strptime(f"{request.form['startDate']} {request.form['endTime']}", '%Y-%m-%d %H:%M')
    
    description = request.form['description']
    category = request.form['category']
    location = request.form['location']
    file = request.files['file']
    if file.filename == '':
        db_file_path = ''
    else:
        file_name = secure_filename(file.filename)
        file_path = os.path.join('app/static/images/calendar', file_name)
        file.save(file_path)
        # db에 저장할 경로는 static 이후부터
        db_file_path = f'images/calendar/{file_name}'
    alarm = request.form['alarm']
    color = request.form['color']

    event = Event.query.filter_by(id=id).first()

    event.title = title
    event.all_day = allDay
    event.start_date = startDate
    event.end_date = endDate
    event.description = description
    event.category = category
    event.location = location
    event.file = db_file_path
    event.alarm = alarm
    event.color = color
    
    db.session.commit()

    return jsonify ({
        'title': title,
        'date' : f"{startDate} ~ {endDate}",
        'message' : f"{title} on {startDate} ~ {endDate}이 수정되었습니다.",
    })

@api.route('/get_events', methods=['GET'])
def get_events():
    events = Event.query.all()
    events = Event.query.filter_by(user_id=current_user.id).all()
    events_data = [{
        'id' : event.id,
        'title' : event.title,
        'description' : event.description,
        'start' : event.start_date.isoformat(),
        'end' : event.end_date.isoformat(),
        'category' : event.category,
        'location' : event.location,
        'file' : event.file,
        'alarm' : event.alarm,
        'color' : event.color,
        'allDay' : event.all_day
    } for event in events]
    return jsonify(events_data)