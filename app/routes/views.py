from flask import Blueprint, render_template, redirect
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
def root():
    if current_user.is_authenticated:
        return redirect('/main')
    else:
        redirect('/welcome')

@views.route('/welcome')
def welcome():
    return render_template('welcome.html')

@views.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')

@views.route('/sign_in')
def sign_in():
    return render_template('sign_in.html')

@views.route('/main')
@login_required
def main():
    return render_template('calender_v2.html', user=current_user)

@views.route('/calendar_v1')
def calendar_v1():
    return render_template('calender.html')

@views.route('/users_and_events')
def users_and_events():
    return render_template('users_and_events.html')

@views.route('/profile_setting')
@login_required
def profile_setting():
    return render_template('profile_setting.html', user=current_user)